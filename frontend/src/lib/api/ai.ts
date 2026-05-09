import { client } from './client';

export interface ProductCopyResult {
  description: string | null;
  short_description: string | null;
  sustainability_notes: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface GenerateCopyPayload {
  name: string;
  material?: string;
  short_description?: string;
}

export async function generateProductCopy(
  payload: GenerateCopyPayload,
): Promise<ProductCopyResult> {
  const { data } = await client.post<{ data: ProductCopyResult }>(
    '/partner/ai/generate-copy',
    payload,
  );
  return data.data;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Send chat messages to the streaming endpoint.
 * Returns a ReadableStream of SSE text chunks.
 * Caller handles parsing `data: {...}` events.
 */
export async function streamChat(messages: ChatMessage[]): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
  const token = typeof window !== 'undefined' ? localStorage.getItem('greeva_token') : null;

  return fetch(`${apiUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
  });
}
