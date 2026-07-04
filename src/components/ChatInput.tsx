import { useState, useRef, useEffect } from 'react';
import { Send, Square, Image as ImageIcon, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSend, disabled, isLoading, onStop }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = () => {
    if ((message.trim() || selectedImages.length > 0) && !disabled && !isLoading) {
      onSend(message.trim(), selectedImages.length > 0 ? selectedImages : undefined);
      setMessage('');
      setSelectedImages([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setSelectedImages(prev => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim() || selectedImages.length > 0) && !disabled && !isLoading;

  return (
    <div className="border-t bg-white p-2 sm:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Image previews */}
        {selectedImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedImages.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Ảnh đã chọn ${index + 1}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end bg-slate-100 rounded-2xl p-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn của bạn... (Shift + Enter để xuống dòng)"
            disabled={disabled || isLoading}
            rows={1}
            className="flex-1 bg-transparent px-3 py-2 resize-none outline-none max-h-[200px] disabled:opacity-50"
          />

          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
            className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Đính kèm ảnh"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Send / Stop button */}
          {isLoading ? (
            <button
              onClick={onStop}
              className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex-shrink-0"
              title="Dừng"
            >
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 text-center mt-2">
          AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
        </p>
      </div>
    </div>
  );
}
