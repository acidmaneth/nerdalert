#!/usr/bin/env node

/**
 * Test Simplified Accuracy - Verify that removing hardcoded data improves accuracy
 * 
 * This test verifies that:
 * 1. No hardcoded year references are causing outdated information
 * 2. Dynamic date validation is working correctly
 * 3. Search queries are not biased by hardcoded years
 * 4. Current information is prioritized over outdated data
 */

const API_BASE = 'http://localhost:80';

async function testSimplifiedAccuracy() {
  console.log('🧪 Testing Simplified Accuracy (No Hardcoded Data)\n');

  const testCases = [
    {
      name: 'Deadpool 3 Release Status',
      query: 'When was Deadpool 3 released?',
      expectedBehavior: 'Should identify as released in 2024, not as upcoming',
      expectedKeywords: ['released', '2024', 'July']
    },
    {
      name: 'Current Marvel Movies',
      query: 'What are the latest Marvel movies?',
      expectedBehavior: 'Should provide current 2024 releases and upcoming 2025 movies',
      expectedKeywords: ['2024', '2025', 'released', 'upcoming']
    },
    {
      name: 'Fantastic Four Status',
      query: 'What is the status of Fantastic Four movie?',
      expectedBehavior: 'Should show current status and release date',
      expectedKeywords: ['2025', 'February', 'confirmed']
    },
    {
      name: 'No Fake Projects',
      query: 'Is Avengers Doomsday confirmed?',
      expectedBehavior: 'Should identify as confirmed movie, not fake',
      expectedKeywords: ['confirmed', '2026', 'official']
    },
    {
      name: 'Dynamic Year Detection',
      query: 'What movies are coming out this year?',
      expectedBehavior: 'Should focus on current year releases',
      expectedKeywords: ['2024', 'current', 'year']
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`❓ Query: ${testCase.query}`);
    console.log(`🎯 Expected: ${testCase.expectedBehavior}`);
    
    try {
      const response = await sendTestMessage(testCase.query);
      const analysis = analyzeResponse(response, testCase);
      
      if (analysis.passed) {
        console.log('✅ PASSED');
        passedTests++;
      } else {
        console.log('❌ FAILED');
        console.log(`   Issues: ${analysis.issues.join(', ')}`);
      }
      
      console.log(`   Response: ${response.substring(0, 200)}...`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('');
    }
  }

  console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Simplified approach is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Review the issues above.');
  }
}

async function sendTestMessage(message) {
  const response = await fetch(`${API_BASE}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{
        role: 'user',
        content: message
      }],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response || 'No response received';
}

function analyzeResponse(responseText, testCase) {
  const lowerResponse = responseText.toLowerCase();
  const issues = [];
  
  // Check for expected keywords
  for (const keyword of testCase.expectedKeywords) {
    if (!lowerResponse.includes(keyword.toLowerCase())) {
      issues.push(`Missing expected keyword: "${keyword}"`);
    }
  }
  
  // Check for hardcoded year issues
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Look for outdated year references
  if (lowerResponse.includes('2023') && testCase.name.includes('Current')) {
    issues.push('Contains outdated 2023 reference');
  }
  
  // Check for future year speculation
  if (lowerResponse.includes(`${nextYear + 1}`) && !testCase.name.includes('Fake')) {
    issues.push(`Contains speculation about ${nextYear + 1}`);
  }
  
  // Check for appropriate confidence levels
  if (lowerResponse.includes('confidence: low') && testCase.name.includes('Confirmed')) {
    issues.push('Low confidence for confirmed information');
  }
  
  // Check for rumor vs confirmed distinction
  if (testCase.name.includes('Fake') && lowerResponse.includes('rumor')) {
    issues.push('Incorrectly labeled confirmed movie as rumor');
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}

// Run the test
testSimplifiedAccuracy().catch(console.error); 