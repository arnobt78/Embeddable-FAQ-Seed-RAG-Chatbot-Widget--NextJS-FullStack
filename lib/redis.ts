import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Message type for chat sessions
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Session type
export interface Session {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// FAQ metadata type
export interface FAQMetadata {
  question: string;
  answer: string;
}

// Session management
export async function getSession(sessionId: string): Promise<Session | null> {
  const data = await redis.get(`chat:session:${sessionId}`);
  if (!data) return null;
  
  // Parse JSON if it's a string, otherwise use as-is
  let session: Session;
  if (typeof data === 'string') {
    try {
      session = JSON.parse(data) as Session;
    } catch (e) {
      console.error('Failed to parse session data:', e);
      return null;
    }
  } else {
    session = data as Session;
  }
  
  // Normalize message content to ensure it's always a string (handle legacy array format)
  if (session.messages && Array.isArray(session.messages)) {
    session.messages = session.messages.map((msg) => {
      // If content is an array, normalize it to string
      if (Array.isArray(msg.content)) {
        const normalizedContent = (msg.content as unknown[])
          .map((item: unknown) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
              const itemObj = item as { text?: string; content?: string; message?: string };
              return itemObj.text || itemObj.content || itemObj.message || '';
            }
            return String(item || '');
          })
          .filter((text: string) => text.length > 0)
          .join(' ');
        return { ...msg, content: normalizedContent };
      }
      // If content is an object, extract text
      if (msg.content && typeof msg.content === 'object' && !Array.isArray(msg.content)) {
        const contentObj = msg.content as { text?: string; content?: string; message?: string };
        const normalizedContent = contentObj.text || contentObj.content || contentObj.message || String(msg.content);
        return { ...msg, content: normalizedContent };
      }
      // Already a string or convert to string
      return { ...msg, content: typeof msg.content === 'string' ? msg.content : String(msg.content || '') };
    });
  }
  
  return session;
}

export async function saveSession(
  sessionId: string,
  messages: ChatMessage[],
  ttl: number = parseInt(process.env.SESSION_TTL || '2592000')
): Promise<Session> {
  const session: Session = {
    id: sessionId,
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await redis.setex(`chat:session:${sessionId}`, ttl, JSON.stringify(session));
  return session;
}

/** Delete a chat session from Redis — returns true if key existed */
export async function deleteSession(sessionId: string): Promise<boolean> {
  const deleted = await redis.del(`chat:session:${sessionId}`);
  return deleted > 0;
}

// Vector storage for RAG
export async function storeVector(id: string, vector: number[], metadata: FAQMetadata): Promise<void> {
  await redis.hset(`chat:vectors:${id}`, {
    vector: JSON.stringify(vector),
    metadata: JSON.stringify(metadata),
  });
}

// Vector search result type
export interface VectorSearchResult {
  similarity: number;
  metadata: FAQMetadata;
}

export async function searchVectors(queryVector: number[], topK: number = 3): Promise<VectorSearchResult[]> {
  // Simple cosine similarity search (for production, use a proper vector DB)
  // This is a simplified version - for better performance, use Redis with RediSearch or Qdrant
  const keys = await redis.keys('chat:vectors:*');
  const results: VectorSearchResult[] = [];
  
  for (const key of keys) {
    try {
      const data = await redis.hgetall(key);
      if (data?.vector && data?.metadata) {
        // Safely parse JSON with error handling
        let vector: number[];
        let metadata: FAQMetadata;
        
        try {
          const vectorStr = typeof data.vector === 'string' ? data.vector : JSON.stringify(data.vector);
          vector = JSON.parse(vectorStr) as number[];
        } catch (e) {
          console.error(`Failed to parse vector for ${key}:`, e);
          continue;
        }
        
        try {
          const metadataStr = typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata);
          metadata = JSON.parse(metadataStr) as FAQMetadata;
        } catch (e) {
          console.error(`Failed to parse metadata for ${key}:`, e);
          continue;
        }
        
        const similarity = cosineSimilarity(queryVector, vector);
        results.push({
          similarity,
          metadata,
        });
      }
    } catch (error) {
      console.error(`Error processing vector ${key}:`, error);
      continue;
    }
  }
  
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
