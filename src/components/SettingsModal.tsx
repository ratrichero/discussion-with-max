import { ChatSettings, DEFAULT_SETTINGS } from '../types';
import { X, RotateCcw } from 'lucide-react';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  if (!isOpen) return null;

  const handleReset = () => {
    onSettingsChange(DEFAULT_SETTINGS);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Cài đặt nâng cao</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">System Prompt</label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => onSettingsChange({ ...settings, systemPrompt: e.target.value })}
              placeholder="Nhập system prompt để định hướng AI..."
              className="w-full h-24 px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Định nghĩa vai trò và hành vi của AI
            </p>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Temperature</label>
              <span className="text-sm text-slate-600">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => onSettingsChange({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Giá trị cao = sáng tạo hơn, giá trị thấp = chính xác hơn
            </p>
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Max Tokens</label>
              <span className="text-sm text-slate-600">{settings.maxTokens}</span>
            </div>
            <input
              type="range"
              min="256"
              max="8192"
              step="256"
              value={settings.maxTokens}
              onChange={(e) => onSettingsChange({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Giới hạn độ dài phản hồi
            </p>
          </div>

          {/* Top P */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Top P</label>
              <span className="text-sm text-slate-600">{settings.topP}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.topP}
              onChange={(e) => onSettingsChange({ ...settings, topP: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Nucleus sampling - kiểm soát đa dạng từ vựng
            </p>
          </div>

          {/* Top K */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Top K</label>
              <span className="text-sm text-slate-600">{settings.topK}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.topK}
              onChange={(e) => onSettingsChange({ ...settings, topK: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Giới hạn số lượng token được xem xét (0 = không giới hạn)
            </p>
          </div>

          {/* Frequency Penalty */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Frequency Penalty</label>
              <span className="text-sm text-slate-600">{settings.frequencyPenalty}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.frequencyPenalty}
              onChange={(e) => onSettingsChange({ ...settings, frequencyPenalty: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Giảm lặp lại dựa trên tần suất xuất hiện
            </p>
          </div>

          {/* Presence Penalty */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Presence Penalty</label>
              <span className="text-sm text-slate-600">{settings.presencePenalty}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.presencePenalty}
              onChange={(e) => onSettingsChange({ ...settings, presencePenalty: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Khuyến khích đề cập chủ đề mới
            </p>
          </div>
        </div>

        <div className="p-4 border-t flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Đặt lại mặc định
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
