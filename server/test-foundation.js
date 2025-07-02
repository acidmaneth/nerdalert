#!/usr/bin/env node

/**
 * Simple Foundation Test
 * Tests the core search functionality without complex RAG logic
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AGENT_URL = process.env.AGENT_URL || 'http://localhost:80';

console.log('🧪 Testing Search Foundation');
console.log('============================');
console.log(`Agent URL: ${AGENT_URL}`);
console.log('');

// Simple test cases
const testCases = [
  {
    description: "Deadpool 3 Release Status",
    query: "Is Deadpool 3 released? When did it come out?",
    expectedKeywords: ["released", "2024", "july"],
    shouldNotContain: ["rumor", "upcoming", "2025", "2026"]
  },
  {
    description: "Fantastic Four Status",
    query: "What's the status of the Fantastic Four movie?",
    expectedKeywords: ["fantastic four", "2025"],
    shouldNotContain: ["released", "2024"]
  }
];

async function testFoundation() {
  console.log('🚀 Starting Foundation Tests...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`🧪 Test: ${testCase.description}`);
    console.log(`Query: "${testCase.query}"`);
    
    try {
      const response = await axios.post(`${AGENT_URL}/prompt-sync`, {
        messages: [{ role: 'user', content: testCase.query }],
        sessionId: `foundation_test_${Date.now()}`
      });
      
      const responseText = response.data.text || response.data.response || '';
      console.log('✅ Response received');
      console.log('Response length:', responseText.length);
      
      // Simple keyword analysis
      const lowerResponse = responseText.toLowerCase();
      let passed = true;
      const issues = [];
      
      // Check for expected keywords
      for (const keyword of testCase.expectedKeywords) {
        if (!lowerResponse.includes(keyword.toLowerCase())) {
          passed = false;
          issues.push(`Missing expected keyword: "${keyword}"`);
        }
      }
      
      // Check for unwanted keywords
      for (const keyword of testCase.shouldNotContain) {
        if (lowerResponse.includes(keyword.toLowerCase())) {
          passed = false;
          issues.push(`Contains unwanted keyword: "${keyword}"`);
        }
      }
      
      if (passed) {
        console.log('✅ Test PASSED');
        passedTests++;
      } else {
        console.log('❌ Test FAILED');
        console.log('Issues found:', issues.join(', '));
      }
      
      console.log('---\n');
      
    } catch (error) {
      console.log('❌ Test failed:', error.response?.data?.error || error.message);
      console.log('---\n');
    }
  }
  
  // Summary
  console.log('📊 Foundation Test Summary');
  console.log('==========================');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Foundation is solid! Core search is working correctly.');
  } else {
    console.log('⚠️  Foundation needs work. Review the issues above.');
  }
}

// Run the tests
testFoundation().catch(console.error); 