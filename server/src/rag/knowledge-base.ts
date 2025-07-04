export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: 'movie' | 'tv' | 'comic' | 'character' | 'event' | 'trivia' | 'easter_egg' | 'behind_scenes' | 'fan_theory' | 'canon_info';
  franchise: string;
  releaseDate?: string;
  status: 'announced' | 'in-production' | 'released' | 'cancelled' | 'established' | 'ongoing';
  verified: boolean;
  sources: string[];
  lastUpdated: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  canonStatus: 'CANON' | 'NON-CANON' | 'SPECULATION' | 'RUMOR';
  tags: string[];
  triviaType?: 'behind_scenes' | 'easter_egg' | 'production' | 'casting' | 'script' | 'visual_effects' | 'music' | 'location' | 'costume' | 'prop' | 'origin';
  verificationScore?: number; // 0-100 score for trivia accuracy
  sourceAgreement?: number; // Number of sources that agree
  conflictingSources?: string[]; // Sources that disagree
}

export interface RAGQuery {
  query: string;
  category?: string;
  franchise?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  limit?: number;
}

export class NerdAlertKnowledgeBase {
  private entries: Map<string, KnowledgeEntry> = new Map();
  private vectorIndex: Map<string, number[]> = new Map(); // Simple vector storage

  // Add or update knowledge entry
  async addEntry(entry: KnowledgeEntry): Promise<void> {
    this.entries.set(entry.id, entry);
    await this.updateVectorIndex(entry);
  }

  // Retrieve relevant entries based on query
  async retrieve(query: RAGQuery): Promise<KnowledgeEntry[]> {
    const queryVector = await this.vectorizeQuery(query.query);
    const results: Array<{entry: KnowledgeEntry, score: number}> = [];

    for (const [id, entry] of this.entries) {
      const entryVector = this.vectorIndex.get(id);
      if (entryVector) {
        const score = this.calculateSimilarity(queryVector, entryVector);
        if (score > 0.3) { // Threshold for relevance
          results.push({entry, score});
        }
      }
    }

    // Filter by category and franchise if specified
    let filteredResults = results;
    if (query.category) {
      filteredResults = filteredResults.filter(r => r.entry.category === query.category);
    }
    if (query.franchise) {
      filteredResults = filteredResults.filter(r => r.entry.franchise === query.franchise);
    }

    // Sort by relevance score and return top results
    return filteredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || 5)
      .map(r => r.entry);
  }

  // Get current information for a specific topic
  getCurrentInfo(topic: string, category?: string): KnowledgeEntry | null {
    const entries = Array.from(this.entries.values());
    const relevant = entries.filter(entry => 
      entry.title.toLowerCase().includes(topic.toLowerCase()) &&
      (!category || entry.category === category)
    );

    if (relevant.length === 0) return null;

    // Return the most recently updated entry
    return relevant.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )[0];
  }

  // Check if information is current
  isInformationCurrent(entry: KnowledgeEntry, maxAgeDays: number = 30): boolean {
    const lastUpdated = new Date(entry.lastUpdated);
    const now = new Date();
    const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= maxAgeDays;
  }

  // Update entry with new information
  updateEntry(id: string, updates: Partial<KnowledgeEntry>): void {
    const existing = this.entries.get(id);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      this.addEntry(updated);
    }
  }

  // Simple vectorization (in production, use proper embeddings)
  private async vectorizeQuery(query: string): Promise<number[]> {
    // This is a simplified version - in production, use proper embeddings
    const words = query.toLowerCase().split(/\s+/);
    const vector = new Array(100).fill(0);
    words.forEach((word, index) => {
      if (index < 100) {
        vector[index] = word.length / 10; // Simple hash-like function
      }
    });
    return vector;
  }

  private async updateVectorIndex(entry: KnowledgeEntry): Promise<void> {
    const vector = await this.vectorizeQuery(entry.title + ' ' + entry.content);
    this.vectorIndex.set(entry.id, vector);
  }

  private calculateSimilarity(vec1: number[], vec2: number[]): number {
    // Simple cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Initialize with empty data (no hardcoded information)
  initializeSampleData(): void {
    // No hardcoded data - rely on Google Search API for current information
    console.log('Knowledge base initialized with no hardcoded data - using Google Search API');
  }

  // Enhanced trivia retrieval with type filtering
  async getTriviaByType(triviaType: string, franchise?: string): Promise<KnowledgeEntry[]> {
    const entries = Array.from(this.entries.values());
    return entries.filter(entry => 
      entry.triviaType === triviaType &&
      (!franchise || entry.franchise === franchise)
    );
  }

  // Get high-confidence trivia only
  async getVerifiedTrivia(confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH'): Promise<KnowledgeEntry[]> {
    const entries = Array.from(this.entries.values());
    return entries.filter(entry => 
      entry.category === 'trivia' && 
      entry.confidence === confidence &&
      entry.verified === true
    );
  }

  // Get canon information for a specific topic
  async getCanonInfo(topic: string, franchise: string): Promise<KnowledgeEntry | null> {
    const entries = Array.from(this.entries.values());
    const relevant = entries.filter(entry => 
      entry.category === 'canon_info' &&
      entry.franchise === franchise &&
      (entry.title.toLowerCase().includes(topic.toLowerCase()) ||
       entry.content.toLowerCase().includes(topic.toLowerCase()))
    );

    if (relevant.length === 0) return null;

    // Return the entry with highest confidence and verification score
    return relevant.sort((a, b) => {
      const scoreA = (a.verificationScore || 0) + (a.confidence === 'HIGH' ? 100 : a.confidence === 'MEDIUM' ? 50 : 0);
      const scoreB = (b.verificationScore || 0) + (b.confidence === 'HIGH' ? 100 : b.confidence === 'MEDIUM' ? 50 : 0);
      return scoreB - scoreA;
    })[0];
  }
} 