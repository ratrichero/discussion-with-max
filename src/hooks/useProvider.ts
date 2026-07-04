import { useState, useCallback, useRef } from 'react';
import { ModelInfo, Provider, Message, ChatSettings } from '../types';
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

  const fetchModels = useCallback(async () => {
    if (!provider) {
      setError('Chưa chọn provider');
      return;
    }
    if (!apiKey) {
      setError('Vui lòng nhập API Key');
      return;
    }

    const fetchKey = `${provider.id}-${apiKey}`;
    if (lastFetchRef.current === fetchKey && models.length > 0) {
      return;
    }
    lastFetchRef.current = fetchKey;
    setLoadingModels(true);
    setError(null);

    try {
      // NVIDIA: Use hardcoded list + custom models
      if (provider.id === 'nvidia') {
        const customForProvider = customModelsRef.current.filter(m => m.isCustom);
        setModels([...NVIDIA_FREE_MODELS, ...customForProvider]);
        setLoadingModels(false);
        return;
      }

      // Custom providers: Use their stored models
      if (!provider.isBuiltin) {
        setModels(customModelsRef.current.filter(m => m.isCustom));
        setLoadingModels(false);
        return;
      }

      // OpenRouter & others: Fetch from API
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

    try {
      const systemMessage = settings.systemPrompt
        ? [{ role: 'system', content: settings.systemPrompt }]
        : [];

      const apiMessages = [
        ...systemMessage,
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ];

      const bodyPayload: Record<string, unknown> = {
        model: modelId,
        messages: apiMessages,
        stream: true,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
      };

      // Only include optional params if they have meaningful values
      if (settings.topK > 0) bodyPayload.top_k = settings.topK;
      if (settings.frequencyPenalty > 0) bodyPayload.frequency_penalty = settings.frequencyPenalty;
      if (settings.presencePenalty > 0) bodyPayload.presence_penalty = settings.presencePenalty;

      const directUrl = `${provider.baseUrl}${provider.completionsEndpoint || '/chat/completions'}`;
      let response: Response | null = null;

      // ---- Strategy 1: Try proxy first (for providers that might need it) ----
      const needsProxy = provider.id === 'nvidia' || !provider.isBuiltin;

      if (needsProxy) {
        try {
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              baseUrl: provider.baseUrl,
              apiKey,
              ...bodyPayload,
            }),
          });

          // If proxy returns 404 HTML (proxy not deployed), response is not usable
          const contentType = response.headers.get('content-type') || '';
          if (response.status === 404 || contentType.includes('text/html')) {
            response = null; // Mark as failed, will try direct
          }
        } catch {
          response = null; // Proxy not available
        }
      }

      // ---- Strategy 2: Try direct call (fallback or for CORS-enabled providers) ----
      if (!response) {
        const directHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        };

        // Provider-specific headers
        if (provider.id === 'openrouter') {
          directHeaders['HTTP-Referer'] = window.location.origin;
          directHeaders['X-Title'] = 'AI Chat Vietnam';
        }
        if (provider.id === 'nvidia') {
          directHeaders['Accept'] = 'text/event-stream';
        }

        try {
          response = await fetch(directUrl, {
            method: 'POST',
            headers: directHeaders,
            body: JSON.stringify(bodyPayload),
          });
        } catch (directErr) {
          // Both proxy and direct failed
          if (needsProxy) {
            throw Object.assign(
              new Error(
                `Không thể kết nối đến ${provider.name}. ` +
                `API này không hỗ trợ gọi trực tiếp từ trình duyệt (CORS). ` +
                `Hãy deploy ứng dụng lên Vercel để sử dụng proxy server.`
              ),
              { code: 'CORS' }
            );
          }
          throw directErr;
        }
      }

      // ---- Handle response ----
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
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Không thể đọc response');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

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

      onDone();
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      onError(error.message || 'Đã xảy ra lỗi', error.code);
    }
  }, [provider, apiKey]);

  const resetModels = useCallback(() => {
    setModels([]);
    lastFetchRef.current = '';
  }, []);

  return { models, loadingModels, error, fetchModels, sendMessage, resetModels };
}
