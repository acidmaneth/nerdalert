import axios from "axios";
import {
  GOOGLE_API_KEY,
  GOOGLE_CSE_ID,
  SEARCH_TIMEOUT,
  SEARCH_MAX_RETRIES,
} from "./constants.js";

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  position: number;
}

export interface SearchResponse {
  results: SearchResult[];
  provider: string;
  success: boolean;
  qualityScore: number;
  sourceDiversity: string[];
  error?: string;
}

export interface SearchOptions {
  maxResults?: number;
  requireOfficialSources?: boolean;
  includeNews?: boolean;
  includeWikis?: boolean;
}

export interface RumorVerificationResult {
  isRumor: boolean;
  actualStatus: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sources: string[];
  corrections: string[];
  warnings: string[];
}

// Simplified search function using only Google Custom Search API
export async function performWebSearch(query: string, retryCount: number = 0): Promise<{
  results: SearchResult[];
  provider: string;
  success: boolean;
  error?: string;
}> {
  console.log(`Performing Google search for: ${query} (attempt ${retryCount + 1})`);
  
  // Use Google Custom Search API (primary and only provider)
  if (GOOGLE_API_KEY && GOOGLE_CSE_ID) {
    try {
      console.log(`Attempting Google search for: ${query}`);
      const googleResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CSE_ID,
          q: query,
          num: 10,
          safe: 'active',
          gl: 'us',
          hl: 'en'
          // Removed dateRestrict and sort to get broader, more authoritative results
        },
        timeout: SEARCH_TIMEOUT,
      });
      
      const results = googleResponse.data.items || [];
      if (results.length > 0) {
        console.log(`Google search successful: ${results.length} results`);
        return {
          results: normalizeSearchResults(results, 'google'),
          provider: 'google',
          success: true
        };
      }
    } catch (error) {
      console.error(`Google search failed:`, (error as Error).message);
    }
  } else {
    console.error('Google Custom Search API not configured. Please set GOOGLE_API_KEY and GOOGLE_CSE_ID');
  }
  
  // Retry logic for transient failures
  if (retryCount < SEARCH_MAX_RETRIES - 1) {
    console.log(`Search failed, retrying... (${retryCount + 1}/${SEARCH_MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
    return performWebSearch(query, retryCount + 1);
  }
  
  console.error(`Google search failed for query: ${query}`);
  return {
    results: [],
    provider: 'google',
    success: false,
    error: 'Google Custom Search API not available or failed'
  };
}

// NEW: Specialized rumor verification function
export async function verifyRumorOrRelease(movieTitle: string): Promise<RumorVerificationResult> {
  console.log(`Verifying rumor/release status for: ${movieTitle}`);
  
  const result: RumorVerificationResult = {
    isRumor: true,
    actualStatus: 'Unknown',
    confidence: 'LOW',
    sources: [],
    corrections: [],
    warnings: []
  };
  
  try {
    // Step 1: Check if it's already released (IMDB, official sites)
    const releaseQueries = [
      `${movieTitle} release date site:imdb.com`,
      `${movieTitle} movie site:imdb.com`,
      `${movieTitle} site:marvel.com`,
      `${movieTitle} site:disney.com`,
      `${movieTitle} site:variety.com`
    ];
    
    let releaseFound = false;
    let releaseDate = '';
    
    for (const query of releaseQueries) {
      const searchResult = await performWebSearch(query);
      if (searchResult.success && searchResult.results.length > 0) {
        const firstResult = searchResult.results[0];
        
        // Check if it's already released
        if (firstResult.snippet.toLowerCase().includes('released') || 
            firstResult.snippet.toLowerCase().includes('out now') ||
            firstResult.snippet.toLowerCase().includes('available')) {
          releaseFound = true;
          releaseDate = extractDateFromSnippet(firstResult.snippet);
          result.sources.push(firstResult.link);
          break;
        }
      }
    }
    
    // Step 2: If not found as released, check for official announcements
    if (!releaseFound) {
      const announcementQueries = [
        `${movieTitle} confirmed official announcement site:marvel.com`,
        `${movieTitle} confirmed official announcement site:disney.com`,
        `${movieTitle} confirmed official announcement site:variety.com`,
        `${movieTitle} confirmed official announcement site:hollywoodreporter.com`
      ];
      
      let announcementFound = false;
      
      for (const query of announcementQueries) {
        const searchResult = await performWebSearch(query);
        if (searchResult.success && searchResult.results.length > 0) {
          const firstResult = searchResult.results[0];
          
          if (firstResult.snippet.toLowerCase().includes('confirmed') ||
              firstResult.snippet.toLowerCase().includes('official') ||
              firstResult.snippet.toLowerCase().includes('announced')) {
            announcementFound = true;
            result.sources.push(firstResult.link);
            break;
          }
        }
      }
      
      // Step 3: Check for rumors vs confirmed status
      if (!announcementFound) {
        const rumorQueries = [
          `${movieTitle} rumor speculation site:screenrant.com`,
          `${movieTitle} rumor speculation site:collider.com`,
          `${movieTitle} rumor speculation site:reddit.com`
        ];
        
        for (const query of rumorQueries) {
          const searchResult = await performWebSearch(query);
          if (searchResult.success && searchResult.results.length > 0) {
            const firstResult = searchResult.results[0];
            
            if (firstResult.snippet.toLowerCase().includes('rumor') ||
                firstResult.snippet.toLowerCase().includes('speculation') ||
                firstResult.snippet.toLowerCase().includes('unconfirmed')) {
              result.warnings.push(`Found as rumor/speculation: ${firstResult.link}`);
            }
          }
        }
      } else {
        result.isRumor = false;
        result.actualStatus = 'Confirmed';
        result.confidence = 'HIGH';
      }
    } else {
      // It's already released
      result.isRumor = false;
      result.actualStatus = `Released ${releaseDate}`;
      result.confidence = 'HIGH';
      result.corrections.push(`${movieTitle} has already been released, not a rumor`);
    }
    
    // Step 4: Cross-check with current year
    const currentYear = new Date().getFullYear();
    if (result.actualStatus.includes('2026') || result.actualStatus.includes('2027')) {
      result.warnings.push(`Future date detected (${currentYear} is current year) - may be speculation`);
      result.confidence = 'MEDIUM';
    }
    
  } catch (error) {
    result.warnings.push(`Verification failed: ${(error as Error).message}`);
  }
  
  return result;
}

// Helper function to extract dates from snippets
function extractDateFromSnippet(snippet: string): string {
  const datePatterns = [
    /(\d{4})/g, // Year
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi, // Month Year
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/g // MM/DD/YYYY
  ];
  
  for (const pattern of datePatterns) {
    const match = snippet.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return 'Unknown date';
}

// Enhanced search result normalization for Google
function normalizeSearchResults(results: any[], provider: string): SearchResult[] {
  if (provider === 'google') {
    return results.map((result, index) => ({
      title: result.title || 'Unknown',
      link: result.link || result.url || '#',
      snippet: result.snippet || result.description || '',
      source: 'google',
      position: index + 1
    }));
  }
  
  // Fallback normalization
  return results.map((result, index) => ({
    title: result.title || result.name || 'Unknown',
    link: result.url || result.link || result.href || '#',
    snippet: result.description || result.snippet || result.summary || '',
    source: provider,
    position: index + 1
  }));
}

// Enhanced search with quality scoring
export async function performEnhancedSearch(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
  const { maxResults = 10, requireOfficialSources = true, includeNews = true, includeWikis = true } = options;
  
  try {
    const searchResult = await performWebSearch(query);
    
    if (!searchResult.success) {
      return {
        results: [],
        provider: searchResult.provider,
        success: false,
        qualityScore: 0,
        sourceDiversity: [],
        error: searchResult.error
      };
    }
    
    // Score and filter results
    const scoredResults = scoreSearchResults(searchResult.results, requireOfficialSources);
    const sourceDiversity = calculateSourceDiversity(scoredResults);
    const qualityScore = calculateQualityScore(scoredResults, sourceDiversity);
    
    return {
      results: scoredResults.slice(0, maxResults),
      provider: searchResult.provider,
      success: true,
      qualityScore,
      sourceDiversity
    };
  } catch (error) {
    return {
      results: [],
      provider: 'google',
      success: false,
      qualityScore: 0,
      sourceDiversity: [],
      error: (error as Error).message
    };
  }
}

// Enhanced scoring for Google results
function scoreSearchResults(results: SearchResult[], requireOfficialSources: boolean): SearchResult[] {
  return results.map(result => {
    let score = 0;
    
    // Base score for having content
    if (result.title && result.snippet) score += 10;
    
    // Official sources get MUCH higher scores
    if (isOfficialSource(result.link)) {
      score += 50; // Increased from 30 to 50
    } else if (requireOfficialSources) {
      score -= 30; // Increased penalty from 20 to 30
    }
    
    // News sources get moderate scores (but lower than official)
    if (isNewsSource(result.link)) {
      score += 20;
    }
    
    // Wiki sources get lower scores
    if (isWikiSource(result.link)) {
      score += 10;
    }
    
    // Position-based scoring (favor earlier results)
    score += Math.max(0, 15 - result.position); // Higher position = lower score
    
    return { ...result, score };
  }).sort((a, b) => (b as any).score - (a as any).score);
}

function calculateSourceDiversity(results: SearchResult[]): string[] {
  const domains = new Set<string>();
  results.forEach(result => {
    const domain = extractDomain(result.link);
    if (domain) domains.add(domain);
  });
  return Array.from(domains);
}

function calculateQualityScore(results: SearchResult[], sourceDiversity: string[]): number {
  if (results.length === 0) return 0;
  
  const avgScore = results.reduce((sum, result) => sum + ((result as any).score || 0), 0) / results.length;
  const diversityBonus = Math.min(sourceDiversity.length * 5, 25); // Max 25 points for diversity
  
  return Math.min(100, avgScore + diversityBonus);
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return '';
  }
}

function isOfficialSource(url: string): boolean {
  const domain = extractDomain(url).toLowerCase();
  const officialDomains = [
    'marvel.com', 'disney.com', 'disneyplus.com',
    'starwars.com', 'lucasfilm.com',
    'dc.com', 'warnerbros.com',
    'imdb.com', 'rottentomatoes.com',
    'variety.com', 'hollywoodreporter.com', 'deadline.com'
  ];
  return officialDomains.some(offical => domain.includes(offical));
}

function isNewsSource(url: string): boolean {
  const domain = extractDomain(url).toLowerCase();
  const newsDomains = [
    'variety.com', 'hollywoodreporter.com', 'deadline.com',
    'thewrap.com', 'collider.com', 'screenrant.com',
    'cnn.com', 'bbc.com', 'reuters.com', 'ap.org'
  ];
  return newsDomains.some(news => domain.includes(news));
}

function isWikiSource(url: string): boolean {
  const domain = extractDomain(url).toLowerCase();
  return domain.includes('wikipedia.org') || domain.includes('fandom.com') || domain.includes('wikia.com');
}

// Specialized search functions
export async function searchForMovieInfo(movieTitle: string): Promise<SearchResponse> {
  // Use multiple search strategies to handle title variations
  const queries = [
    `${movieTitle} movie cast release date official site:imdb.com`,
    `${movieTitle} movie cast release date official site:marvel.com`,
    `${movieTitle} release date site:imdb.com OR site:marvel.com`
  ];
  
  // Try each query and return the best results
  for (const query of queries) {
    const result = await performEnhancedSearch(query, { requireOfficialSources: true, maxResults: 8 });
    if (result.success && result.results.length > 0 && result.qualityScore > 50) {
      return result;
    }
  }
  
  // Fallback to original query if all specific queries fail
  const fallbackQuery = `${movieTitle} movie cast release date official`;
  return performEnhancedSearch(fallbackQuery, { requireOfficialSources: true, maxResults: 8 });
}

export async function searchForActorInfo(actorName: string): Promise<SearchResponse> {
  const query = `${actorName} actor movies recent`;
  return performEnhancedSearch(query, { requireOfficialSources: true, maxResults: 8 });
}

export async function searchForLatestNews(topic: string): Promise<SearchResponse> {
  const query = `${topic} latest news`;
  return performEnhancedSearch(query, { includeNews: true, maxResults: 8 });
}

export async function searchForWikiInfo(topic: string, franchise?: string): Promise<SearchResponse> {
  const query = franchise ? `${topic} ${franchise} wiki` : `${topic} wiki`;
  return performEnhancedSearch(query, { includeWikis: true, maxResults: 6 });
}

// NEW: Store verified Google results in RAG knowledge base
export async function storeVerifiedResultInRAG(searchResult: SearchResult, category?: string, franchise?: string): Promise<void> {
  try {
    // Import RAG service dynamically to avoid circular dependencies
    const { RAGService } = await import('./rag/rag-service.js');
    const ragService = new RAGService();
    
    // Extract domain for source tracking
    const domain = extractDomain(searchResult.link);
    
    // Determine category if not provided
    const detectedCategory = category || detectCategoryFromContent(searchResult.snippet);
    
    // Determine franchise if not provided
    const detectedFranchise = franchise || detectFranchiseFromContent(searchResult.snippet);
    
    // Calculate confidence based on source quality
    const confidence = isOfficialSource(searchResult.link) ? 'HIGH' : 'MEDIUM';
    
    // Create knowledge entry
    const knowledgeEntry = {
      id: generateIdFromTitle(searchResult.title),
      title: searchResult.title,
      content: searchResult.snippet,
      category: detectedCategory as 'movie' | 'tv' | 'comic' | 'character' | 'event' | 'trivia' | 'easter_egg' | 'behind_scenes' | 'fan_theory' | 'canon_info',
      franchise: detectedFranchise,
      status: detectStatusFromContent(searchResult.snippet) as 'announced' | 'in-production' | 'released' | 'cancelled' | 'established' | 'ongoing',
      verified: true,
      sources: [domain],
      lastUpdated: new Date().toISOString(),
      confidence: confidence as 'HIGH' | 'MEDIUM' | 'LOW',
      canonStatus: 'CANON' as const,
      tags: extractTagsFromContent(searchResult.snippet)
    };
    
    // Store in RAG knowledge base
    await ragService.updateKnowledgeBase(knowledgeEntry);
    console.log(`✅ Stored verified result in RAG: ${searchResult.title}`);
    
  } catch (error) {
    console.error('❌ Failed to store result in RAG:', error);
  }
}

// Helper functions for RAG storage
function generateIdFromTitle(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function detectCategoryFromContent(content: string): 'movie' | 'tv' | 'comic' | 'character' | 'event' | 'trivia' | 'easter_egg' | 'behind_scenes' | 'fan_theory' | 'canon_info' {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('movie') || lowerContent.includes('film')) return 'movie';
  if (lowerContent.includes('tv') || lowerContent.includes('series') || lowerContent.includes('show')) return 'tv';
  if (lowerContent.includes('comic') || lowerContent.includes('graphic novel')) return 'comic';
  if (lowerContent.includes('character') || lowerContent.includes('actor')) return 'character';
  if (lowerContent.includes('event') || lowerContent.includes('convention')) return 'event';
  if (lowerContent.includes('trivia') || lowerContent.includes('behind the scenes')) return 'trivia';
  if (lowerContent.includes('easter egg')) return 'easter_egg';
  if (lowerContent.includes('behind the scenes')) return 'behind_scenes';
  if (lowerContent.includes('fan theory') || lowerContent.includes('theory')) return 'fan_theory';
  if (lowerContent.includes('canon') || lowerContent.includes('official')) return 'canon_info';
  
  return 'movie'; // Default
}

function detectFranchiseFromContent(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('marvel') || lowerContent.includes('mcu')) return 'Marvel';
  if (lowerContent.includes('dc') || lowerContent.includes('batman') || lowerContent.includes('superman')) return 'DC';
  if (lowerContent.includes('star wars') || lowerContent.includes('jedi') || lowerContent.includes('sith')) return 'Star Wars';
  if (lowerContent.includes('star trek') || lowerContent.includes('enterprise') || lowerContent.includes('federation')) return 'Star Trek';
  if (lowerContent.includes('disney') || lowerContent.includes('pixar')) return 'Disney';
  
  return 'General';
}

function detectStatusFromContent(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('released') || lowerContent.includes('out now')) return 'released';
  if (lowerContent.includes('in production') || lowerContent.includes('filming')) return 'in-production';
  if (lowerContent.includes('announced') || lowerContent.includes('confirmed')) return 'announced';
  if (lowerContent.includes('cancelled') || lowerContent.includes('canceled')) return 'cancelled';
  
  return 'established';
}

function extractTagsFromContent(content: string): string[] {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // Extract common tags
  if (lowerContent.includes('superhero')) tags.push('superhero');
  if (lowerContent.includes('action')) tags.push('action');
  if (lowerContent.includes('comedy')) tags.push('comedy');
  if (lowerContent.includes('drama')) tags.push('drama');
  if (lowerContent.includes('sci-fi') || lowerContent.includes('science fiction')) tags.push('sci-fi');
  if (lowerContent.includes('fantasy')) tags.push('fantasy');
  if (lowerContent.includes('horror')) tags.push('horror');
  if (lowerContent.includes('romance')) tags.push('romance');
  
  return tags;
} 