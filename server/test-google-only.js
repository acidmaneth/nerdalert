const axios = require('axios');
require('dotenv').config();

// Test Google Custom Search API only
async function testGoogleSearch() {
  console.log('🔍 Testing Google Custom Search API...\n');
  
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.error('❌ GOOGLE_API_KEY and GOOGLE_CSE_ID are required');
    console.log('Please set these in your .env file');
    console.log('Get API key from: https://console.cloud.google.com/apis/credentials');
    console.log('Get CSE ID from: https://programmablesearchengine.google.com/');
    return false;
  }
  
  const testQueries = [
    'Marvel movies 2025 confirmed',
    'Deadpool 3 release date',
    'Eyes of Wakanda Disney Plus',
    'Avengers 6 movie 2026'
  ];
  
  let successCount = 0;
  
  for (const query of testQueries) {
    try {
      console.log(`Testing: "${query}"`);
      
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CSE_ID,
          q: query,
          num: 5,
          safe: 'active',
          gl: 'us',
          hl: 'en',
          dateRestrict: 'm6',
          sort: 'date'
        },
        timeout: 10000,
      });
      
      const results = response.data.items || [];
      console.log(`  ✅ Found ${results.length} results`);
      
      if (results.length > 0) {
        console.log(`  First result: ${results[0].title}`);
        console.log(`  URL: ${results[0].link}`);
        console.log(`  Snippet: ${results[0].snippet?.substring(0, 100)}...`);
      }
      
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log(`Test Results: ${successCount}/${testQueries.length} queries successful`);
  return successCount === testQueries.length;
}

// Test specific accuracy improvements
async function testAccuracyQueries() {
  console.log('🎯 Testing Accuracy-Specific Queries...\n');
  
  const accuracyQueries = [
    'Shuri Black Panther sister daughter relationship',
    'Deadpool 3 2024 release date confirmed',
    'Marvel Phase 6 official announcements 2025',
    'Eyes of Wakanda cast confirmed official'
  ];
  
  let accuracyCount = 0;
  
  for (const query of accuracyQueries) {
    try {
      console.log(`Testing accuracy: "${query}"`);
      
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_CSE_ID,
          q: query,
          num: 3,
          safe: 'active',
          gl: 'us',
          hl: 'en',
          dateRestrict: 'm6'
        },
        timeout: 10000,
      });
      
      const results = response.data.items || [];
      
      // Check for official sources
      const hasOfficialSource = results.some(result => 
        result.link.includes('marvel.com') || 
        result.link.includes('disney.com') || 
        result.link.includes('imdb.com') ||
        result.link.includes('variety.com') ||
        result.link.includes('hollywoodreporter.com')
      );
      
      if (hasOfficialSource) {
        console.log(`  ✅ Found official sources`);
        accuracyCount++;
      } else {
        console.log(`  ⚠️  No official sources found`);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log(`Accuracy Test Results: ${accuracyCount}/${accuracyQueries.length} queries found official sources`);
  return accuracyCount >= accuracyQueries.length * 0.5; // At least 50% should have official sources
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Google-Only Search Tests...\n');
  
  const tests = [
    { name: 'Basic Google Search', func: testGoogleSearch },
    { name: 'Accuracy Queries', func: testAccuracyQueries }
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
  console.log(`TEST SUMMARY: ${passedTests}/${tests.length} tests passed`);
  console.log(`${'='.repeat(50)}`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! Google search is working correctly.');
    console.log('The simplified search configuration should improve accuracy.');
  } else {
    console.log('⚠️  Some tests failed. Please check your Google API configuration.');
  }
  
  return passedTests === tests.length;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testGoogleSearch, testAccuracyQueries, runAllTests }; 