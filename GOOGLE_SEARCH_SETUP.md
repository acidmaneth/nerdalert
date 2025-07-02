# Google Search Integration Setup Guide

This guide will help you integrate Google Custom Search API with your NerdAlert agent for enhanced web search capabilities.

## 🎯 Overview

Google Custom Search API provides:
- **High-quality search results** from Google's index
- **Customizable search engines** for specific domains or topics
- **Reliable and fast** search performance
- **Comprehensive coverage** of web content
- **Official Google API** with good documentation

## 📋 Prerequisites

- Google Cloud Platform account
- Google Custom Search Engine (CSE) setup
- API key from Google Cloud Console
- NerdAlert agent running locally

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select an existing one
3. **Enable billing** (required for API usage)
4. **Note your project ID** for later use

### Step 2: Enable Custom Search API

1. **Navigate to APIs & Services > Library**
2. **Search for "Custom Search API"**
3. **Click "Enable"**
4. **Wait for activation** (usually instant)

### Step 3: Create API Key

1. **Go to APIs & Services > Credentials**
2. **Click "Create Credentials" > "API Key"**
3. **Copy the generated API key**
4. **Click "Restrict Key"** (recommended)
5. **Set restrictions:**
   - **API restrictions**: Select "Custom Search API"
   - **Application restrictions**: Choose based on your needs
6. **Click "Save"**

### Step 4: Create Custom Search Engine

1. **Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)**
2. **Click "Create a search engine"**
3. **Configure your search engine:**

   **Basic Settings:**
   - **Search engine name**: "NerdAlert Search"
   - **Search engine description**: "Custom search for pop culture and entertainment"
   - **Search the entire web**: ✅ Check this for general search
   - **Search only included sites**: Leave unchecked for web-wide search

   **Advanced Settings:**
   - **Search language**: English
   - **Search region**: United States
   - **SafeSearch**: Moderate
   - **Image search**: Enable if needed
   - **Search suggestions**: Enable

4. **Click "Create"**
5. **Copy your Search Engine ID (cx)**

### Step 5: Configure Environment Variables

1. **Edit your `server/.env` file:**
   ```bash
   # Google Custom Search API Configuration
   GOOGLE_API_KEY=your_actual_api_key_here
   GOOGLE_CSE_ID=your_actual_search_engine_id_here
   
   # Search Configuration
   SEARCH_PROVIDER=google
   SEARCH_FALLBACK_ENABLED=true
   ```

2. **Save the file**

### Step 6: Test the Integration

1. **Run the Google search test:**
   ```bash
   cd server
   node test-google-search.js
   ```

2. **Verify the output shows successful searches**

## 🔧 Advanced Configuration

### Custom Search Engine Optimization

For better results with pop culture queries, consider creating specialized search engines:

#### Option 1: Entertainment-Focused CSE
- **Include sites**: `marvel.com`, `starwars.com`, `imdb.com`, `rottentomatoes.com`
- **Search the entire web**: ✅ Enabled
- **Use for**: General entertainment queries

#### Option 2: News-Focused CSE
- **Include sites**: `variety.com`, `hollywoodreporter.com`, `deadline.com`
- **Search the entire web**: ✅ Enabled
- **Use for**: Latest news and announcements

#### Option 3: Wiki-Focused CSE
- **Include sites**: `wikipedia.org`, `fandom.com`, `wikia.com`
- **Search the entire web**: ✅ Enabled
- **Use for**: Detailed information and lore

### Environment Variable Options

```bash
# Primary search provider
SEARCH_PROVIDER=google

# Fallback configuration
SEARCH_FALLBACK_ENABLED=true
SEARCH_TIMEOUT=10000
SEARCH_MAX_RETRIES=3

# Multiple search engines (if you have them)
GOOGLE_CSE_ID_ENTERTAINMENT=your_entertainment_cse_id
GOOGLE_CSE_ID_NEWS=your_news_cse_id
GOOGLE_CSE_ID_WIKI=your_wiki_cse_id
```

## 📊 Usage and Limits

### Google Custom Search API Limits
- **Free tier**: 100 searches per day
- **Paid tier**: $5 per 1000 searches
- **Rate limit**: 10,000 searches per day per API key

### Cost Optimization
1. **Monitor usage** in Google Cloud Console
2. **Use fallback providers** for non-critical searches
3. **Implement caching** for repeated queries
4. **Set up billing alerts** to avoid unexpected charges

## 🧪 Testing and Validation

### Run Comprehensive Tests

```bash
# Test basic functionality
node test-google-search.js

# Test with your agent
npm run dev
# Then send a test query through the chat interface
```

### Test Queries to Try

1. **Movie Information:**
   - "Marvel movies 2024"
   - "Star Wars latest news"
   - "Game of Thrones cast"

2. **TV Shows:**
   - "Lord of the Rings Amazon series"
   - "Stranger Things season 5"
   - "The Mandalorian cast"

3. **Comics and Gaming:**
   - "DC Comics Batman"
   - "Spider-Man video games"
   - "Witcher Netflix series"

### Expected Results

✅ **Good results should include:**
- Official websites (marvel.com, starwars.com, etc.)
- Reputable news sources
- Wikipedia entries
- IMDB/Rotten Tomatoes ratings

⚠️ **Watch out for:**
- Outdated information
- Fan sites with incorrect data
- Spam or low-quality content

## 🔄 Fallback Configuration

Your NerdAlert agent is configured with a smart fallback system:

1. **Google Custom Search API** (primary)
2. **Brave Search API** (fallback)
3. **Serper API** (final fallback)

This ensures your agent always has access to web search, even if one provider fails.

## 🛠️ Troubleshooting

### Common Issues

#### "API key not valid" error
- **Solution**: Check your API key in Google Cloud Console
- **Verify**: API key is restricted to Custom Search API
- **Check**: Billing is enabled on your project

#### "Search engine not found" error
- **Solution**: Verify your CSE ID is correct
- **Check**: Search engine is active and configured
- **Verify**: CSE ID format (should be like: `012345678901234567890:abcdefghijk`)

#### "Quota exceeded" error
- **Solution**: Check your daily quota usage
- **Upgrade**: Consider paid tier for higher limits
- **Optimize**: Implement caching to reduce API calls

#### No search results
- **Check**: Search engine configuration
- **Verify**: "Search the entire web" is enabled
- **Test**: Try different queries to isolate the issue

### Debug Commands

```bash
# Check environment variables
echo $GOOGLE_API_KEY
echo $GOOGLE_CSE_ID

# Test API directly
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CSE_ID&q=test"

# Check server logs
npm run dev
# Look for search-related log messages
```

## 📈 Performance Optimization

### Caching Strategy
Consider implementing result caching to reduce API calls:

```javascript
// Example caching implementation
const searchCache = new Map();

async function cachedSearch(query) {
  const cacheKey = query.toLowerCase();
  
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 3600000) { // 1 hour
      return cached.results;
    }
  }
  
  const results = await performGoogleSearch(query);
  searchCache.set(cacheKey, {
    results,
    timestamp: Date.now()
  });
  
  return results;
}
```

### Query Optimization
- **Use specific terms** for better results
- **Include year** for time-sensitive queries
- **Add context** (e.g., "Marvel movie" vs "movie")

## 🔒 Security Best Practices

1. **Restrict API keys** to specific APIs and domains
2. **Use environment variables** (never hardcode keys)
3. **Monitor usage** regularly
4. **Rotate keys** periodically
5. **Set up billing alerts** to prevent unexpected charges

## 📞 Support

If you encounter issues:

1. **Check this guide** first
2. **Run the test script** to isolate problems
3. **Review Google Cloud Console** for API status
4. **Check server logs** for detailed error messages
5. **Open an issue** in the repository with details

## 🎉 Success Checklist

- [ ] Google Cloud project created
- [ ] Custom Search API enabled
- [ ] API key generated and restricted
- [ ] Custom Search Engine created
- [ ] Environment variables configured
- [ ] Test script runs successfully
- [ ] Agent responds to search queries
- [ ] Fallback system working
- [ ] Usage monitoring set up

---

**Congratulations!** Your NerdAlert agent now has powerful Google search capabilities! 🚀

The integration provides high-quality, reliable search results that will significantly enhance your agent's ability to provide accurate and up-to-date information about pop culture, entertainment, and more. 