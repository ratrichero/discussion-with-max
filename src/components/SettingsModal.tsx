import { useState } from 'react';
import { ChatSettings, DEFAULT_SETTINGS, PromptTemplate } from '../types';
import { X, RotateCcw, Save, Check } from 'lucide-react';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  conversationTitle?: string;
  promptTemplates: PromptTemplate[];
  onSaveTemplate: (name: string, content: string) => void;
  onDeleteTemplate: (id: string) => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange,
  conversationTitle,
  promptTemplates,
  onSaveTemplate,
  onDeleteTemplate,
}: SettingsModalProps) {
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    onSettingsChange(DEFAULT_SETTINGS);
  };

  const handleConfirmSaveTemplate = () => {
    if (templateName.trim() && settings.systemPrompt.trim()) {
      onSaveTemplate(templateName.trim(), settings.systemPrompt);
      setTemplateName('');
      setShowSaveTemplate(false);
    }
  };

  const handleLoadTemplate = (template: PromptTemplate) => {
    onSettingsChange({ ...settings, systemPrompt: template.content });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {conversationTitle
              ? `Cài đặt cho: ${conversationTitle}`
              : 'Cài đặt mặc định'}
          </h2>
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">System Prompt</label>
              <button
                onClick={() => {
                  setTemplateName('');
                  setShowSaveTemplate(!showSaveTemplate);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Lưu làm template"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu làm template
              </button>
            </div>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => onSettingsChange({ ...settings, systemPrompt: e.target.value })}
              placeholder="Nhập system prompt để định hướng AI..."
              className="w-full h-24 px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Định nghĩa vai trò và hành vi của AI
            </p>

            {/* Save template form */}
            {showSaveTemplate && (
              <div className="mt-2 p-2 bg-slate-50 rounded-lg border flex items-center gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Tên template..."
                  className="flex-1 px-2 py-1.5 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmSaveTemplate();
                    if (e.key === 'Escape') setShowSaveTemplate(false);
                  }}
                />
                <button
                  onClick={handleConfirmSaveTemplate}
                  disabled={!templateName.trim() || !settings.systemPrompt.trim()}
                  className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  title="Xác nhận"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowSaveTemplate(false);
                    setTemplateName('');
                  }}
                  className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                  title="Huỷ"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Prompt Templates list */}
            {promptTemplates.length > 0 && (
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Prompt Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {promptTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="group flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors"
                      onClick={() => handleLoadTemplate(template)}
                      title={`Click để dùng: ${template.name}`}
                    >
                      <span>{template.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTemplate(template.id);
                        }}
                        className="ml-0.5 p-0.5 rounded hover:bg-slate-500 transition-colors opacity-60 hover:opacity-100"
                        title="Xoá template"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
