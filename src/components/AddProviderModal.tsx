import { useState } from 'react';
import { X, Server, Info } from 'lucide-react';
import { Provider } from '../types';

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (provider: Provider, apiKey: string, modelIds: string[]) => void;
}

export function AddProviderModal({ isOpen, onClose, onAdd }: AddProviderModalProps) {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelsText, setModelsText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && baseUrl.trim() && apiKey.trim()) {
      const provider: Provider = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        baseUrl: baseUrl.trim().replace(/\/$/, ''), // Remove trailing slash
        completionsEndpoint: '/chat/completions',
        isBuiltin: false,
      };

      const modelIds = modelsText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      onAdd(provider, apiKey.trim(), modelIds);
      
      // Reset form
      setName('');
      setBaseUrl('');
      setApiKey('');
      setModelsText('');
      onClose();
    }
  };

  // Preset suggestions
  const presets = [
    { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: 'llama-3.1-70b-versatile\nmixtral-8x7b-32768\ngemma2-9b-it' },
    { name: 'Together AI', baseUrl: 'https://api.together.xyz/v1', models: 'meta-llama/Llama-3-70b-chat-hf\nmistralai/Mixtral-8x7B-Instruct-v0.1' },
    { name: 'Fireworks', baseUrl: 'https://api.fireworks.ai/inference/v1', models: 'accounts/fireworks/models/llama-v3p1-70b-instruct' },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setName(preset.name);
    setBaseUrl(preset.baseUrl);
    setModelsText(preset.models);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            Thêm Provider mới
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick presets */}
          <div>
            <label className="block text-sm font-medium mb-2">Mẫu có sẵn</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tên Provider *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="vd: Groq, Together AI..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Base URL *</label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              URL gốc của API (không bao gồm /chat/completions)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Key *</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Nhập API key của provider này"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Danh sách Model IDs</label>
            <textarea
              value={modelsText}
              onChange={(e) => setModelsText(e.target.value)}
              placeholder="Mỗi dòng 1 model ID, ví dụ:&#10;llama-3.1-70b-versatile&#10;mixtral-8x7b-32768"
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Nhập các model ID mà bạn muốn sử dụng (mỗi dòng một ID)
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Provider phải hỗ trợ OpenAI-compatible API format 
              (endpoint /chat/completions với streaming).
            </p>
          </div>
        </form>

        <div className="p-4 border-t flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !baseUrl.trim() || !apiKey.trim()}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thêm Provider
          </button>
        </div>
      </div>
    </div>
  );
}
