import { Provider } from '../types';
import { ChevronDown, Plus, Server } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

interface ProviderSelectorProps {
  providers: Provider[];
  selectedProviderId: string;
  onSelectProvider: (providerId: string) => void;
  onAddProvider: () => void;
  apiKeys: Record<string, string>;
}

export function ProviderSelector({
  providers,
  selectedProviderId,
  onSelectProvider,
  onAddProvider,
  apiKeys,
}: ProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasApiKey = (providerId: string) => !!apiKeys[providerId];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-slate-50 transition-colors min-w-[140px] sm:min-w-[160px]"
      >
        <Server className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <span className="truncate flex-1 text-left text-sm font-medium">
          {selectedProvider?.name || 'Chọn...'}
        </span>
        <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b bg-slate-50">
            <p className="text-xs text-slate-500 font-medium px-2">Chọn Provider</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  onSelectProvider(provider.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3",
                  selectedProviderId === provider.id && "bg-blue-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold",
                  provider.id === 'openrouter' ? 'bg-purple-500' :
                  provider.id === 'nvidia' ? 'bg-green-600' :
                  'bg-slate-500'
                )}>
                  {provider.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{provider.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {provider.isBuiltin ? 'Tích hợp sẵn' : 'Tùy chỉnh'}
                  </p>
                </div>
                {hasApiKey(provider.id) ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Đã cấu hình
                  </span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                    Chưa có key
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="p-2 border-t">
            <button
              onClick={() => {
                onAddProvider();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Thêm Provider mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
