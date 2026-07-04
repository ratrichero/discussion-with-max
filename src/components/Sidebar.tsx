import { Conversation } from '../types';
import { Plus, MessageSquare, Trash2, Download, Settings, Key, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onExportConversation: (id: string, format: 'markdown' | 'json') => void;
  onOpenSettings: () => void;
  onOpenApiKey: () => void;
  hasApiKey: boolean;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onExportConversation,
  onOpenSettings,
  onOpenApiKey,
  hasApiKey,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full">
      {/* Header with branding */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">AI Chat</h1>
            <p className="text-[10px] text-slate-400">Multi-Provider</p>
          </div>
        </div>
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Cuộc trò chuyện mới</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-xs">
              Chưa có cuộc trò chuyện nào
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                currentConversationId === conv.id
                  ? "bg-slate-700"
                  : "hover:bg-slate-800"
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm">{conv.title}</p>
                <p className="text-[10px] text-slate-500 truncate">
                  {conv.providerId} • {conv.modelId?.split('/').pop()}
                </p>
              </div>
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExportConversation(conv.id, 'markdown');
                  }}
                  className="p-1.5 hover:bg-slate-600 rounded"
                  title="Xuất Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="p-1.5 hover:bg-red-600 rounded"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={onOpenApiKey}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
            hasApiKey 
              ? "hover:bg-slate-800 text-slate-300" 
              : "bg-amber-600 hover:bg-amber-500 text-white"
          )}
        >
          <Key className="w-4 h-4" />
          <span>{hasApiKey ? 'API Keys' : 'Nhập API Key'}</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300"
        >
          <Settings className="w-4 h-4" />
          <span>Cài đặt nâng cao</span>
        </button>
      </div>
    </aside>
  );
}
