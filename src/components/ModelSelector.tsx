import { ModelInfo } from '../types';
import { ChevronDown, Loader2, RefreshCw, Plus, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';
import { NVIDIA_MODEL_CATEGORIES } from '../data/nvidia-free-models';

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  loading?: boolean;
  onRefresh: () => void;
  providerId: string;
  onAddModel?: () => void;
}

export function ModelSelector({ 
  models, 
  selectedModelId, 
  onSelectModel, 
  loading,
  onRefresh,
  providerId,
  onAddModel,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = models.find(m => m.id === selectedModelId);

  const filteredModels = models.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                          m.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category for NVIDIA
  const showCategories = providerId === 'nvidia' && !search;
  const categories = showCategories ? NVIDIA_MODEL_CATEGORIES : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedCategory(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 max-w-xs sm:max-w-sm" ref={dropdownRef}>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 flex-1 min-w-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          ) : (
            <>
              <span className="truncate text-left text-sm">
                {selectedModel?.name || 'Chọn model...'}
              </span>
              <ChevronDown className="w-4 h-4 flex-shrink-0 ml-auto" />
            </>
          )}
        </button>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
          title="Làm mới danh sách"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 w-full sm:w-96 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedCategory(null);
                }}
                placeholder="Tìm model..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Categories for NVIDIA */}
          {showCategories && categories.length > 0 && (
            <div className="p-2 border-b flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium transition-colors",
                  !selectedCategory ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-colors",
                    selectedCategory === cat ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Models list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredModels.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">
                Không tìm thấy model nào
              </p>
            ) : (
              filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                    setSearch('');
                    setSelectedCategory(null);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b last:border-b-0",
                    selectedModelId === model.id && "bg-blue-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{model.name}</p>
                      <p className="text-xs text-slate-500 truncate">{model.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {model.category && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {model.category}
                        </span>
                      )}
                      {model.isCustom && (
                        <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                          Tùy chỉnh
                        </span>
                      )}
                    </div>
                  </div>
                  {model.contextLength && (
                    <p className="text-xs text-slate-400 mt-1">
                      {model.contextLength.toLocaleString()} tokens
                    </p>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Add custom model (for NVIDIA) */}
          {onAddModel && providerId === 'nvidia' && (
            <div className="p-2 border-t">
              <button
                onClick={() => {
                  onAddModel();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Thêm model khác
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
