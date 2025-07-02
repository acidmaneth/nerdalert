#!/usr/bin/env node

/**
 * Test Script: Revised RAG Approach
 * Tests the new Google-first RAG system with no hardcoded data
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AGENT_URL = process.env.AGENT_URL || 'http://localhost:80';
const SESSION_ID = `test_session_${Date.now()}`;

console.log('🧪 Testing Revised RAG Approach');
console.log('================================');
console.log(`Agent URL: ${AGENT_URL}`);
console.log(`Session ID: ${SESSION_ID}`);
console.log('');

// Test cases for accuracy verification
const testCases = [
  {
    description: "Deadpool 3 Release Status",
    query: "Is Deadpool 3 released? When did it come out?",
    expectedBehavior: "Should correctly identify Deadpool 3 as released in July 2024",
    shouldBeReleased: true,
    expectedYear: "2024"
  },
  {
    description: "Fake Project Detection",
    query: "Tell me about Spider-Man: The Return of Uncle Ben movie",
    expectedBehavior: "Should identify this as a rumor or non-existent project (completely made up title)",
    shouldBeRumor: true
  },
  {
    description: "Current Marvel Movie",
    query: "What's the next Marvel movie coming out?",
    expectedBehavior: "Should provide current, verified information about upcoming Marvel movies",
    shouldBeCurrent: true
  },
  {
    description: "Fantastic Four Status",
    query: "What's the status of the Fantastic Four movie?",
    expectedBehavior: "Should provide current status and release date",
    shouldBeCurrent: true
  },
  {
    description: "Official Source Verification",
    query: "Who is playing Spider-Man in the MCU?",
    expectedBehavior: "Should prioritize official sources like Marvel.com",
    shouldUseOfficialSources: true
  }
];

async function testRevisedRAG() {
  console.log('🚀 Starting Revised RAG Tests...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`🧪 Test: ${testCase.description}`);
    console.log(`Query: "${testCase.query}"`);
    console.log(`Expected: ${testCase.expectedBehavior}`);
    
    try {
      const response = await axios.post(`${AGENT_URL}/prompt-sync`, {
        messages: [{ role: 'user', content: testCase.query }],
        sessionId: SESSION_ID
      });
      
      const responseText = response.data.text || response.data.response || '';
      console.log('✅ Response received');
      console.log('Response length:', responseText.length);
      
      // Analyze response for accuracy indicators
      const analysis = analyzeResponse(responseText, testCase);
      
      if (analysis.passed) {
        console.log('✅ Test PASSED');
        passedTests++;
      } else {
        console.log('❌ Test FAILED');
        console.log('Issues found:', analysis.issues.join(', '));
      }
      
      console.log('---\n');
      
    } catch (error) {
      console.log('❌ Test failed:', error.response?.data?.error || error.message);
      console.log('---\n');
    }
  }
  
  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Revised RAG approach is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Review the issues above.');
  }
}

function analyzeResponse(responseText, testCase) {
  const analysis = {
    passed: true,
    issues: []
  };
  
  const lowerResponse = responseText.toLowerCase();
  
  // Check for Deadpool 3 release status
  if (testCase.description.includes('Deadpool 3')) {
    if (testCase.shouldBeReleased) {
      // Should identify as released (July 2024)
      if (!lowerResponse.includes('released') && !lowerResponse.includes('2024')) {
        analysis.passed = false;
        analysis.issues.push('Did not identify Deadpool 3 as released');
      }
      // Should NOT be identified as rumor or upcoming
      if (lowerResponse.includes('rumor') || lowerResponse.includes('upcoming')) {
        analysis.passed = false;
        analysis.issues.push('Incorrectly identified as rumor/upcoming');
      }
      // Should mention July 2024 specifically
      if (!lowerResponse.includes('july') && !lowerResponse.includes('26')) {
        analysis.passed = false;
        analysis.issues.push('Did not mention July 26, 2024 release date');
      }
    }
  }
  
  // Check for fake project detection
  if (testCase.description.includes('Fake Project Detection')) {
    if (testCase.shouldBeRumor) {
      // Should identify as rumor, unconfirmed, or not found
      if (!lowerResponse.includes('rumor') && !lowerResponse.includes('unconfirmed') && 
          !lowerResponse.includes('not confirmed') && !lowerResponse.includes('speculation') &&
          !lowerResponse.includes('not found') && !lowerResponse.includes('no information') &&
          !lowerResponse.includes('doesn\'t exist') && !lowerResponse.includes('fake')) {
        analysis.passed = false;
        analysis.issues.push('Did not identify as rumor/speculation/non-existent');
      }
      // Should NOT provide specific details like release dates, cast, etc.
      if (lowerResponse.includes('release date') || lowerResponse.includes('cast') ||
          lowerResponse.includes('director') || lowerResponse.includes('confirmed')) {
        analysis.passed = false;
        analysis.issues.push('Provided specific details for fake project');
      }
    }
  }
  
  // Check for current information
  if (testCase.shouldBeCurrent) {
    if (lowerResponse.includes('2026') || lowerResponse.includes('2027')) {
      analysis.passed = false;
      analysis.issues.push('Mentioned future years that are likely incorrect');
    }
  }
  
  // Check for official sources
  if (testCase.shouldUseOfficialSources) {
    const officialSources = ['marvel.com', 'disney.com', 'imdb.com', 'variety.com'];
    const hasOfficialSource = officialSources.some(source => 
      responseText.includes(source) || responseText.includes(source.replace('.com', ''))
    );
    
    if (!hasOfficialSource) {
      analysis.passed = false;
      analysis.issues.push('Did not reference official sources');
    }
  }
  
  // Check for hardcoded data indicators
  if (lowerResponse.includes('knowledge base') || lowerResponse.includes('rag') || 
      lowerResponse.includes('sample data') || lowerResponse.includes('hardcoded')) {
    analysis.passed = false;
    analysis.issues.push('Mentioned internal systems in response');
  }
  
  return analysis;
}

// Run the tests
testRevisedRAG().catch(console.error); 