/**
 * Embedding generation for RAG vector search.
 *
 * Fallback chain (free-tier first):
 * 1. Gemini — gemini-embedding-001 (~1,500 req/day, no card)
 * 2. Hugging Face — sentence-transformers/all-MiniLM-L6-v2 via router, then legacy inference API
 * 3. OpenRouter — liquid/lfm-2.5-embedding-350m:free, then paid text-embedding-ada-002
 * 4. OpenAI direct — text-embedding-ada-002 (optional paid key)
 */

/** Normalize a vector to unit length for cosine similarity (required for non-3072-dim Gemini embeddings) */
function normalizeVector(values: number[]): number[] {
  const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
  return norm > 0 ? values.map((val) => val / norm) : values;
}

/** Primary: Google Gemini embedding API */
async function embedWithGemini(text: string): Promise<number[] | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: 768,
      }),
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  if (data.embedding?.values) {
    return normalizeVector(data.embedding.values);
  }
  return null;
}

/** HF router embeddings endpoint (preferred over legacy inference API) */
async function embedWithHuggingFaceRouter(text: string, apiKey: string): Promise<number[] | null> {
  const response = await fetch('https://router.huggingface.co/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      input: text,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const embedding = data?.data?.[0]?.embedding;
  return Array.isArray(embedding) ? embedding : null;
}

/** Legacy HF inference API — fallback when router endpoint is unavailable */
async function embedWithHuggingFaceLegacy(text: string, apiKey: string): Promise<number[] | null> {
  const endpoints = [
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
    'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      });

      if (response.status === 503) {
        const waitMs = parseInt(response.headers.get('retry-after') || '10', 10) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      if (!response.ok) continue;

      const data = await response.json();
      if (Array.isArray(data)) {
        return Array.isArray(data[0]) ? data[0] : data;
      }
      if (data.embeddings) return data.embeddings[0];
    } catch {
      continue;
    }
  }
  return null;
}

/** OpenRouter free embedding, then paid ada-002 fallback */
async function embedWithOpenRouter(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OpenRouter_API_KEY;
  if (!apiKey) return null;

  const models = [
    'liquid/lfm-2.5-embedding-350m:free',
    'openai/text-embedding-ada-002',
  ];

  for (const model of models) {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer':
          process.env.NEXT_PUBLIC_CHATBOT_URL ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          'https://www.arnobmahmud.com',
        'X-Title': 'Portfolio Chatbot',
      },
      body: JSON.stringify({ model, input: text }),
    });

    if (!response.ok) continue;

    const data = await response.json();
    const embedding = data?.data?.[0]?.embedding;
    if (Array.isArray(embedding)) return embedding;
  }
  return null;
}

/** OpenAI direct embedding (optional paid key) */
async function embedWithOpenAI(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-ada-002', input: text }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data?.data?.[0]?.embedding ?? null;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  let lastError: Error | null = null;

  try {
    const gemini = await embedWithGemini(text);
    if (gemini) return gemini;
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
  }

  const hfKey =
    process.env.HUGGING_FACE_API_KEY || process.env.Hugging_Face_Inference_API_KEY;
  if (hfKey) {
    try {
      const router = await embedWithHuggingFaceRouter(text, hfKey);
      if (router) return router;

      const legacy = await embedWithHuggingFaceLegacy(text, hfKey);
      if (legacy) return legacy;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  try {
    const openRouter = await embedWithOpenRouter(text);
    if (openRouter) return openRouter;
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
  }

  try {
    const openai = await embedWithOpenAI(text);
    if (openai) return openai;
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
  }

  console.error('[embeddings] All embedding methods failed');
  throw lastError || new Error('All embedding methods failed');
}

/** Batch-generate embeddings with rate-limit spacing for seed endpoint */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  const batchSize = 5;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map(
        (text, index) =>
          new Promise<number[]>((resolve, reject) => {
            setTimeout(async () => {
              try {
                resolve(await generateEmbedding(text));
              } catch (error) {
                reject(error);
              }
            }, index * 200);
          })
      )
    );
    embeddings.push(...batchEmbeddings);

    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return embeddings;
}
