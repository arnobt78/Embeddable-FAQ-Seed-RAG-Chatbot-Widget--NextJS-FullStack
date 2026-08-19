import { faqs } from '@/lib/faqs';
import { generateEmbeddings } from '@/lib/embeddings';
import { storeVector } from '@/lib/redis';
import { verifySeedSecret } from '@/lib/auth/seed-auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const auth = verifySeedSecret(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.message }), {
      status: auth.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const texts = faqs.map(([q, a]) => `${q} ${a}`);
    const embeddings = await generateEmbeddings(texts);

    for (let i = 0; i < faqs.length; i++) {
      const [question, answer] = faqs[i];
      await storeVector(`faq-${i + 1}`, embeddings[i], {
        question,
        answer,
      });
    }

    return new Response(
      JSON.stringify({ success: true, count: faqs.length }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Seed error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Seed failed', details: errorMessage }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-seed-secret',
    },
  });
}
