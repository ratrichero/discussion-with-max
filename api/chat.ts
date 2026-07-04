import type { VercelRequest, VercelResponse } from '@vercel/node';

// Proxy endpoint for LLM API calls (bypasses CORS)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { baseUrl, apiKey, model, messages, stream, ...options } = req.body;

    if (!baseUrl || !apiKey || !model || !messages) {
      return res.status(400).json({ error: 'Missing required fields: baseUrl, apiKey, model, messages' });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    // Provider-specific headers
    if (baseUrl.includes('nvidia')) {
      headers['Accept'] = stream ? 'text/event-stream' : 'application/json';
    }
    if (baseUrl.includes('openrouter')) {
      headers['HTTP-Referer'] = req.headers.referer || 'https://ai-chat.vercel.app';
      headers['X-Title'] = 'AI Chat Vietnam';
    }

    const endpoint = `${baseUrl}/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        stream: stream ?? true,
        ...options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error || { message: `HTTP ${response.status}` },
      });
    }

    // Handle streaming
    if (stream !== false) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body?.getReader();
      if (!reader) {
        return res.status(500).json({ error: 'Cannot read response stream' });
      }

      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      } finally {
        reader.releaseLock();
      }

      res.end();
    } else {
      // Non-streaming response
      const data = await response.json();
      res.status(200).json(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
      },
    });
  }
}
