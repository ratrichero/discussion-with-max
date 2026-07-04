export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { baseUrl, apiKey, model, messages, stream, ...options } = await req.json();

    if (!baseUrl || !apiKey || !model || !messages) {
      return new Response(
        JSON.stringify({ error: { message: 'Missing required fields' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    // Provider-specific headers
    if (baseUrl.includes('nvidia')) {
      headers['Accept'] = stream !== false ? 'text/event-stream' : 'application/json';
    }
    if (baseUrl.includes('openrouter')) {
      headers['HTTP-Referer'] = req.headers.get('referer') || 'https://ai-chat.vercel.app';
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
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { error: { message: errorText || `HTTP ${response.status}` } };
      }
      return new Response(JSON.stringify(errorJson), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Streaming: pipe through
    if (stream !== false && response.body) {
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
