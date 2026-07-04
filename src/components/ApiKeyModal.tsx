import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ExternalLink, Key } from 'lucide-react';
import { Provider } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  apiKey: string;
  onSave: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, provider, apiKey, onSave }: ApiKeyModalProps) {
  const [key, setKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  // Sync key when modal opens with different provider
  useEffect(() => {
    setKey(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen || !provider) return null;

  const handleSave = () => {
    onSave(key.trim());
    onClose();
  };

  const getKeyHelpUrl = () => {
    switch (provider.id) {
      case 'openrouter':
        return 'https://openrouter.ai/keys';
      case 'nvidia':
        return 'https://build.nvidia.com/settings/api-keys';
      default:
        return null;
    }
  };

  const getKeyPlaceholder = () => {
    switch (provider.id) {
      case 'openrouter':
        return 'sk-or-v1-...';
      case 'nvidia':
        return 'nvapi-...';
      default:
        return 'Nhập API key...';
    }
  };

  const helpUrl = getKeyHelpUrl();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-500" />
            API Key - {provider.name}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={getKeyPlaceholder()}
                className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {helpUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Bạn cần API Key từ {provider.name} để sử dụng.{' '}
                <a 
                  href={helpUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium underline hover:no-underline"
                >
                  Lấy API Key tại đây
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500">
            🔒 API Key được lưu cục bộ trên trình duyệt của bạn và không được gửi đến bất kỳ server nào khác.
          </p>
        </div>

        <div className="p-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
