import { useState, useCallback, useRef } from 'react';
import { ModelInfo, Provider, Message, ChatSettings, ApiContent, TextContent, ImageContent } from '../types';
import { NVIDIA_FREE_MODELS } from '../data/nvidia-free-models';

export function useProvider(
  provider: Provider | null,
  apiKey: string,
  customModels: ModelInfo[] = []
) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customModelsRef = useRef(customModels);
  customModelsRef.current = customModels;
  const lastFetchRef = useRef<string>('');

  // Track proxy availability: null = unknown, true/false = detected
  const proxyAvailableRef = useRef<boolean | null>(null);

  // AbortController for streaming
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchModels = useCallback(async () => {
    if (!provider) { setError('Chưa chọn provider'); return; }
    if (!apiKey) { setError('Vui lòng nhập API Key'); return; }

    const fetchKey = `${provider.id}-${apiKey}`;
    if (lastFetchRef.current === fetchKey && models.length > 0) return;
    lastFetchRef.current = fetchKey;
    setLoadingModels(true);
    setError(null);

    try {
      if (provider.id === 'nvidia') {
        const customForProvider = customModelsRef.current.filter(m => m.isCustom);
        setModels([...NVIDIA_FREE_MODELS, ...customForProvider]);
        setLoadingModels(false);
        return;
      }

      if (!provider.isBuiltin) {
        setModels(customModelsRef.current.filter(m => m.isCustom));
        setLoadingModels(false);
        return;
      }

      const response = await fetch(`${provider.baseUrl}${provider.modelsEndpoint || '/models'}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!response.ok) throw new Error('Không thể lấy danh sách model');

      const data = await response.json();
      let fetchedModels: ModelInfo[] = [];

      if (provider.id === 'openrouter') {
        fetchedModels = data.data
          .filter((model: { id: string; pricing?: { prompt: string; completion: string } }) => {
            if (!provider.filterFreeOnly) return true;
            return model.id.includes(':free') ||
              (model.pricing?.prompt === '0' && model.pricing?.completion === '0');
          })
          .map((model: { id: string; name: string; context_length?: number }) => ({
            id: model.id,
            name: model.name || model.id,
            contextLength: model.context_length,
          }));
      } else {
        fetchedModels = data.data.map((model: { id: string; name?: string }) => ({
          id: model.id,
          name: model.name || model.id,
        }));
      }

      fetchedModels.sort((a, b) => a.name.localeCompare(b.name));
      setModels(fetchedModels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      lastFetchRef.current = '';
    } finally {
      setLoadingModels(false);
    }
  }, [provider?.id, provider?.baseUrl, provider?.isBuiltin, provider?.filterFreeOnly, provider?.modelsEndpoint, apiKey]);

  // Build API content from message (supports text + images for vision models)
  function buildApiContent(message: Message): ApiContent {
    if (message.images && message.images.length > 0) {
      const parts: Array<TextContent | ImageContent> = [];
      if (message.content) {
        parts.push({ type: 'text', text: message.content });
      }
      for (const img of message.images) {
        parts.push({ type: 'image_url', image_url: { url: img } });
      }
      return parts;
    }
    return message.content;
  }

  // ---- Send message with proxy support ----
  const sendMessage = useCallback(async (
    messages: Message[],
    modelId: string,
    settings: ChatSettings,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: string, code?: string) => void
  ) => {
    if (!provider) { onError('Chưa chọn provider'); return; }
    if (!apiKey) { onError('Vui lòng nhập API Key'); return; }

    // Cancel previous request if any
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const systemMessage = settings.systemPrompt
        ? [{ role: 'system', content: settings.systemPrompt }]
        : [];

      const apiMessages = [
        ...systemMessage,
        ...messages.map(m => ({ role: m.role, content: buildApiContent(m) }))
      ];

      const bodyPayload: Record<string, unknown> = {
        model: modelId,
        messages: apiMessages,
        stream: true,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
      };
      if (settings.topK > 0) bodyPayload.top_k = settings.topK;
      if (settings.frequencyPenalty > 0) bodyPayload.frequency_penalty = settings.frequencyPenalty;
      if (settings.presencePenalty > 0) bodyPayload.presence_penalty = settings.presencePenalty;

      const needsProxy = provider.id !== 'openrouter';
      let response: Response;

      if (needsProxy) {
        response = await sendViaProxy(provider, apiKey, bodyPayload, abortController.signal);
      } else {
        response = await sendDirect(provider, apiKey, bodyPayload, abortController.signal);
      }

      // ---- Handle error responses ----
      if (!response.ok) {
        let errorMessage = 'Đã xảy ra lỗi khi gửi tin nhắn';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch { /* not JSON */ }
        throw Object.assign(new Error(errorMessage), { code: response.status.toString() });
      }

      // ---- Read streaming response ----
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error('Không thể đọc response');

      let buffer = '';

      while (true) {
        if (abortController.signal.aborted) break;

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onChunk(content);
            } catch { /* ignore */ }
          }
        }
      }

      // Process remaining buffer
      if (!abortController.signal.aborted) {
        if (buffer.startsWith('data: ')) {
          const data = buffer.slice(6);
          if (data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onChunk(content);
            } catch { /* ignore */ }
          }
        }

        onDone();
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        // Silent abort - don't call onError
        return;
      }
      const error = err as Error & { code?: string };
      onError(error.message || 'Đã xảy ra lỗi', error.code);
    }
  }, [provider, apiKey]);

  // ---- Proxy call ----
  async function sendViaProxy(
    provider: Provider,
    apiKey: string,
    bodyPayload: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<Response> {
    // If we already know proxy is NOT available → go direct immediately
    if (proxyAvailableRef.current === false) {
      return sendDirect(provider, apiKey, bodyPayload, signal);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          baseUrl: provider.baseUrl,
          apiKey,
          ...bodyPayload,
        }),
      });

      const contentType = response.headers.get('content-type') || '';

      // Proxy NOT deployed: Vercel returns 404 HTML page
      if (response.status === 404 && contentType.includes('text/html')) {
        proxyAvailableRef.current = false;
        // Try direct as last resort
        return sendDirectOrThrowCors(provider, apiKey, bodyPayload, signal);
      }

      // Proxy IS deployed (any other response, including errors from upstream API)
      proxyAvailableRef.current = true;
      return response;
    } catch (fetchErr) {
      // Network error calling proxy itself
      if (proxyAvailableRef.current === true) {
        // Proxy was working before → this is a real network error, not CORS
        throw Object.assign(
          new Error('Lỗi kết nối đến proxy server. Kiểm tra kết nối mạng.'),
          { code: 'NETWORK' }
        );
      }
      // Never confirmed proxy → try direct
      proxyAvailableRef.current = false;
      return sendDirectOrThrowCors(provider, apiKey, bodyPayload, signal);
    }
  }

  // ---- Direct call (for OpenRouter etc.) ----
  async function sendDirect(
    provider: Provider,
    apiKey: string,
    bodyPayload: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    if (provider.id === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'AI Chat Vietnam';
    }
    if (provider.id === 'nvidia') {
      headers['Accept'] = 'text/event-stream';
    }

    const url = `${provider.baseUrl}${provider.completionsEndpoint || '/chat/completions'}`;
    return fetch(url, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify(bodyPayload),
    });
  }

  // ---- Try direct, if CORS → clear error message ----
  async function sendDirectOrThrowCors(
    provider: Provider,
    apiKey: string,
    bodyPayload: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<Response> {
    try {
      return await sendDirect(provider, apiKey, bodyPayload, signal);
    } catch {
      throw Object.assign(
        new Error(
          `Không thể kết nối đến ${provider.name}. ` +
          `API này không hỗ trợ gọi trực tiếp từ trình duyệt (CORS). ` +
          `Hãy deploy ứng dụng lên Vercel để sử dụng proxy server.`
        ),
        { code: 'CORS' }
      );
    }
  }

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const resetModels = useCallback(() => {
    setModels([]);
    lastFetchRef.current = '';
  }, []);

  return { models, loadingModels, error, fetchModels, sendMessage, abort, resetModels };
}
