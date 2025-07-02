#!/usr/bin/env node

/**
 * Test Google Custom Search API Integration
 * 
 * This script tests the Google Custom Search API integration
 * to ensure it's working properly with the NerdAlert agent.
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

async function testGoogleSearch() {
  console.log('🔍 Testing Google Custom Search API Integration...\n');

  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.error('❌ Google API configuration missing!');
    console.error('Please set GOOGLE_API_KEY and GOOGLE_CSE_ID in your .env file');
    console.error('\nSetup instructions:');
    console.error('1. Get API key from: https://console.cloud.google.com/apis/credentials');
    console.error('2. Get CSE ID from: https://programmablesearchengine.google.com/');
    console.error('3. Add both to your .env file');
    return;
  }

  console.log('✅ Google API configuration found');
  console.log(`API Key: ${GOOGLE_API_KEY.substring(0, 10)}...`);
  console.log(`CSE ID: ${GOOGLE_CSE_ID}\n`);

  const testQueries = [
    'Marvel movies 2024',
    'Star Wars latest news',
    'Game of Thrones cast',
    'Lord of the Rings Amazon series',
    'DC Comics Batman'
  ];

  for (const query of testQueries) {
    console.log(`🔎 Testing query: "${query}"`);
    
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CSE_ID,
          q: query,
          num: 5,
          safe: 'active',
          gl: 'us',
          hl: 'en'
        },
        timeout: 10000,
      });

      const results = response.data.items || [];
      
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} results`);
        
        // Show first result as example
        const firstResult = results[0];
        console.log(`   📰 Title: ${firstResult.title}`);
        console.log(`   🔗 Link: ${firstResult.link}`);
        console.log(`   📝 Snippet: ${firstResult.snippet?.substring(0, 100)}...`);
        
        // Check for search information
        if (response.data.searchInformation) {
          const searchInfo = response.data.searchInformation;
          console.log(`   📊 Total results: ${searchInfo.formattedTotalResults}`);
          console.log(`   ⏱️ Search time: ${searchInfo.formattedSearchTime}s`);
        }
      } else {
        console.log('⚠️ No results found');
      }
      
    } catch (error) {
      console.error(`❌ Search failed: ${error.message}`);
      
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
}

async function testSearchFallback() {
  console.log('🔄 Testing search fallback behavior...\n');
  
  // Test with a query that should work
  const query = 'Marvel movies 2024';
  console.log(`Testing fallback for: "${query}"`);
  
  try {
    // Simulate the search priority order
    const searchProviders = [
      { name: 'Google', enabled: !!GOOGLE_API_KEY && !!GOOGLE_CSE_ID },
      { name: 'Brave', enabled: !!process.env.BRAVE_API_KEY },
      { name: 'Serper', enabled: !!process.env.SERPER_API_KEY }
    ];
    
    console.log('Available search providers:');
    searchProviders.forEach(provider => {
      console.log(`   ${provider.enabled ? '✅' : '❌'} ${provider.name}`);
    });
    
    console.log('\nSearch priority order:');
    console.log('1. Google Custom Search API');
    console.log('2. Brave Search API');
    console.log('3. Serper API (Google proxy)');
    
  } catch (error) {
    console.error(`❌ Fallback test failed: ${error.message}`);
  }
}

async function testSearchQuality() {
  console.log('📊 Testing search result quality...\n');
  
  const qualityTests = [
    {
      query: 'Marvel Cinematic Universe latest movies',
      expectedDomains: ['marvel.com', 'imdb.com', 'rottentomatoes.com'],
      description: 'Should return official Marvel and movie review sites'
    },
    {
      query: 'Star Wars Disney Plus series',
      expectedDomains: ['starwars.com', 'disneyplus.com', 'wikipedia.org'],
      description: 'Should return official Star Wars and Disney sites'
    }
  ];
  
  for (const test of qualityTests) {
    console.log(`🔍 Testing: ${test.description}`);
    console.log(`Query: "${test.query}"`);
    
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CSE_ID,
          q: test.query,
          num: 10,
          safe: 'active',
          gl: 'us',
          hl: 'en'
        },
        timeout: 10000,
      });

      const results = response.data.items || [];
      
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} results`);
        
        // Check for expected domains
        const foundDomains = results.map(result => {
          const url = new URL(result.link);
          return url.hostname.replace('www.', '');
        });
        
        console.log('Found domains:');
        foundDomains.slice(0, 5).forEach(domain => {
          const isExpected = test.expectedDomains.some(expected => 
            domain.includes(expected.replace('www.', ''))
          );
          console.log(`   ${isExpected ? '✅' : '⚠️'} ${domain}`);
        });
        
        // Quality score
        const qualityScore = results.filter(result => {
          const domain = new URL(result.link).hostname.replace('www.', '');
          return test.expectedDomains.some(expected => 
            domain.includes(expected.replace('www.', ''))
          );
        }).length / results.length;
        
        console.log(`📊 Quality score: ${(qualityScore * 100).toFixed(1)}%`);
        
      } else {
        console.log('⚠️ No results found');
      }
      
    } catch (error) {
      console.error(`❌ Quality test failed: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

async function runAllTests() {
  console.log('🚀 Starting Google Search API Tests\n');
  console.log('=' .repeat(50));
  
  await testGoogleSearch();
  console.log('=' .repeat(50));
  
  await testSearchFallback();
  console.log('=' .repeat(50));
  
  await testSearchQuality();
  console.log('=' .repeat(50));
  
  console.log('\n🎉 Google Search API tests completed!');
  console.log('\nNext steps:');
  console.log('1. Ensure your .env file has GOOGLE_API_KEY and GOOGLE_CSE_ID');
  console.log('2. Test the integration with your NerdAlert agent');
  console.log('3. Monitor search quality and adjust CSE settings if needed');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testGoogleSearch, testSearchFallback, testSearchQuality }; 