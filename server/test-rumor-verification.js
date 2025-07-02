const axios = require('axios');
require('dotenv').config();

const AGENT_URL = process.env.AGENT_URL || 'http://localhost:80';
const SESSION_ID = `test_rumor_verification_${Date.now()}`;

async function testRumorVerification() {
  console.log('🎬 Testing Rumor Verification System...\n');
  
  const testCases = [
    {
      description: "Deadpool 3 - Should be identified as RELEASED, not rumor",
      query: "Tell me about Deadpool 3",
      expectedBehavior: "Should identify Deadpool 3 as already released in 2024, not a rumor",
      shouldContain: ["released", "2024", "not a rumor", "already released"]
    },
    {
      description: "Avengers Doomsday - Should be identified as RUMOR",
      query: "Tell me about Avengers Doomsday",
      expectedBehavior: "Should identify Avengers Doomsday as a rumor or unconfirmed",
      shouldContain: ["rumor", "unconfirmed", "not confirmed", "speculation"]
    },
    {
      description: "Fantastic Four 2025 - Should be identified as CONFIRMED",
      query: "Tell me about Fantastic Four 2025",
      expectedBehavior: "Should identify Fantastic Four as confirmed for 2025",
      shouldContain: ["confirmed", "2025", "official", "announced"]
    },
    {
      description: "Eyes of Wakanda - Should be identified as CONFIRMED",
      query: "Tell me about Eyes of Wakanda",
      expectedBehavior: "Should identify Eyes of Wakanda as confirmed Disney+ series",
      shouldContain: ["confirmed", "Disney+", "series", "official"]
    },
    {
      description: "Spider-Man 4 - Should be identified as RUMOR",
      query: "Tell me about Spider-Man 4",
      expectedBehavior: "Should identify Spider-Man 4 as rumor/unconfirmed",
      shouldContain: ["rumor", "unconfirmed", "not confirmed", "speculation"]
    }
  ];
  
  let passedTests = 0;
  
  for (const testCase of testCases) {
    console.log(`🧪 Test: ${testCase.description}`);
    console.log(`Query: "${testCase.query}"`);
    console.log(`Expected: ${testCase.expectedBehavior}`);
    console.log('─'.repeat(80));
    
    try {
      const response = await axios.post(`${AGENT_URL}/prompt`, {
        messages: [
          { role: "user", content: testCase.query }
        ],
        sessionId: `${SESSION_ID}_${testCase.description.replace(/\s+/g, '_')}`
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });
      
      const result = response.data;
      console.log(`Response: ${result.response.substring(0, 500)}...`);
      
      // Check for verification indicators
      const hasVerificationResults = result.response.includes('🎬 MOVIE/SHOW VERIFICATION RESULTS:');
      const hasCorrections = result.response.includes('📝 Correction:');
      const hasWarnings = result.response.includes('⚠️ VERIFICATION WARNINGS:');
      
      // Check for expected content
      const containsExpected = testCase.shouldContain.some(term => 
        result.response.toLowerCase().includes(term.toLowerCase())
      );
      
      console.log('\n📊 Verification Analysis:');
      console.log(`✅ Verification results section: ${hasVerificationResults ? 'YES' : 'NO'}`);
      console.log(`📝 Corrections provided: ${hasCorrections ? 'YES' : 'NO'}`);
      console.log(`⚠️ Warnings provided: ${hasWarnings ? 'YES' : 'NO'}`);
      console.log(`🎯 Contains expected terms: ${containsExpected ? 'YES' : 'NO'}`);
      
      // Determine if test passed
      const testPassed = hasVerificationResults && containsExpected;
      if (testPassed) {
        passedTests++;
        console.log('✅ TEST PASSED');
      } else {
        console.log('❌ TEST FAILED');
      }
      
    } catch (error) {
      console.error(`❌ Test failed with error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  console.log(`🎯 Test Results: ${passedTests}/${testCases.length} tests passed`);
  
  if (passedTests === testCases.length) {
    console.log('🎉 All rumor verification tests passed! The system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. The rumor verification system needs improvement.');
  }
  
  return passedTests === testCases.length;
}

// Test specific verification function
async function testSpecificVerification() {
  console.log('\n🔬 Testing Specific Verification Function...\n');
  
  const verificationTests = [
    {
      name: "Deadpool 3 Verification",
      title: "Deadpool 3",
      expectedStatus: "released",
      expectedYear: "2024"
    },
    {
      name: "Avengers Doomsday Verification", 
      title: "Avengers Doomsday",
      expectedStatus: "rumor",
      expectedYear: null
    },
    {
      name: "Fantastic Four Verification",
      title: "Fantastic Four",
      expectedStatus: "confirmed", 
      expectedYear: "2025"
    }
  ];
  
  for (const test of verificationTests) {
    console.log(`Testing: ${test.name}`);
    try {
      const response = await axios.post(`${AGENT_URL}/prompt`, {
        messages: [
          { role: "user", content: `Verify the status of ${test.title}` }
        ],
        sessionId: `${SESSION_ID}_specific_${test.name.replace(/\s+/g, '_')}`
      });
      
      const result = response.data.response;
      console.log(`Result: ${result.substring(0, 300)}...`);
      
      // Check for verification indicators
      const hasVerification = result.includes('🎬 MOVIE/SHOW VERIFICATION RESULTS:');
      const hasCorrectStatus = result.toLowerCase().includes(test.expectedStatus);
      const hasExpectedYear = test.expectedYear ? result.includes(test.expectedYear) : true;
      
      console.log(`Verification section: ${hasVerification ? '✅' : '❌'}`);
      console.log(`Correct status (${test.expectedStatus}): ${hasCorrectStatus ? '✅' : '❌'}`);
      console.log(`Expected year (${test.expectedYear}): ${hasExpectedYear ? '✅' : '❌'}`);
      
    } catch (error) {
      console.error(`Test failed: ${error.message}`);
    }
    console.log('─'.repeat(60));
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Rumor Verification Tests...\n');
  
  const tests = [
    { name: 'Rumor Verification Tests', func: testRumorVerification },
    { name: 'Specific Verification Tests', func: testSpecificVerification }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    console.log(`${'='.repeat(50)}`);
    console.log(`Running ${test.name}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      const result = await test.func();
      if (result) {
        passedTests++;
        console.log(`✅ ${test.name} PASSED`);
      } else {
        console.log(`❌ ${test.name} FAILED`);
      }
    } catch (error) {
      console.error(`❌ ${test.name} FAILED with error:`, error);
    }
    
    console.log('');
  }
  
  console.log(`${'='.repeat(50)}`);
  console.log(`TEST SUMMARY: ${passedTests}/${tests.length} test suites passed`);
  console.log(`${'='.repeat(50)}`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All rumor verification tests passed!');
    console.log('The system should now correctly identify:');
    console.log('• Released movies (like Deadpool 3) as NOT rumors');
    console.log('• Unconfirmed projects (like Avengers Doomsday) as rumors');
    console.log('• Confirmed projects (like Fantastic Four 2025) as official');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
  
  return passedTests === tests.length;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testRumorVerification, testSpecificVerification, runAllTests }; 