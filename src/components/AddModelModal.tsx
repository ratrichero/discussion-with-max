import { useState } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (modelId: string, name: string) => void;
  providerId: string;
}

export function AddModelModal({ isOpen, onClose, onAdd, providerId }: AddModelModalProps) {
  const [modelId, setModelId] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modelId.trim() && name.trim()) {
      onAdd(modelId.trim(), name.trim());
      setModelId('');
      setName('');
      onClose();
    }
  };

  const getHelpUrl = () => {
    if (providerId === 'nvidia') {
      return 'https://build.nvidia.com/models?filters=nimType%3Anim_type_preview';
    }
    return null;
  };

  const helpUrl = getHelpUrl();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Thêm model mới
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Model ID</label>
            <input
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="vd: deepseek-ai/deepseek-v4-pro"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Nhập đúng ID của model từ provider
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tên hiển thị</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="vd: DeepSeek V4 Pro"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          {helpUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 Tìm Model ID tại{' '}
                <a 
                  href={helpUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium underline hover:no-underline"
                >
                  trang model catalog
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!modelId.trim() || !name.trim()}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm model
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
