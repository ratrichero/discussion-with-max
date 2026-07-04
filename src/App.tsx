import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Settings, Sparkles } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { ProviderSelector } from './components/ProviderSelector';
import { ModelSelector } from './components/ModelSelector';
import { SettingsModal } from './components/SettingsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AddModelModal } from './components/AddModelModal';
import { AddProviderModal } from './components/AddProviderModal';
import { ErrorBubble } from './components/ErrorBubble';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProvider } from './hooks/useProvider';
import { 
  Conversation, 
  Message, 
  ChatSettings, 
  DEFAULT_SETTINGS,
  Provider,
  BUILTIN_PROVIDERS,
  ProviderApiKeys,
  ModelInfo,
} from './types';

function App() {
  // Provider & API Keys state
  const [providers, setProviders] = useLocalStorage<Provider[]>('providers', BUILTIN_PROVIDERS);
  const [apiKeys, setApiKeys] = useLocalStorage<ProviderApiKeys>('provider-api-keys', {});
  const [selectedProviderId, setSelectedProviderId] = useLocalStorage('selected-provider', 'openrouter');
  const [customModels, setCustomModels] = useLocalStorage<ModelInfo[]>('custom-models', []);
  
  // Chat state
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', []);
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>('current-conversation', null);
  const [selectedModelId, setSelectedModelId] = useLocalStorage('selected-model', '');
  const [settings, setSettings] = useLocalStorage<ChatSettings>('chat-settings', DEFAULT_SETTINGS);
  
  // UI state
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [chatError, setChatError] = useState<{ message: string; code?: string } | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current provider
  const currentProvider = providers.find(p => p.id === selectedProviderId) || null;
  const currentApiKey = apiKeys[selectedProviderId] || '';
  
  // Filter custom models for current provider
  const providerCustomModels = customModels.filter(m => 
    (m as ModelInfo & { providerId?: string }).providerId === selectedProviderId
  );

  const { models, loadingModels, error, fetchModels, sendMessage, resetModels } = useProvider(
    currentProvider,
    currentApiKey,
    providerCustomModels
  );

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, streamingContent]);

  // Fetch models when provider or API key changes
  useEffect(() => {
    if (currentApiKey && currentProvider) {
      fetchModels();
    }
  }, [currentApiKey, selectedProviderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show API key modal if no key for current provider
  useEffect(() => {
    if (currentProvider && !currentApiKey) {
      setShowApiKey(true);
    }
  }, [currentProvider, currentApiKey]);

  // Reset model selection when provider changes
  useEffect(() => {
    setSelectedModelId('');
    resetModels();
  }, [selectedProviderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set default model when models are loaded
  useEffect(() => {
    if (models.length > 0 && !selectedModelId) {
      setSelectedModelId(models[0].id);
    }
  }, [models, selectedModelId, setSelectedModelId]);

  // Save API key for provider
  const handleSaveApiKey = (key: string) => {
    setApiKeys(prev => ({ ...prev, [selectedProviderId]: key }));
  };

  // Add custom model
  const handleAddModel = (modelId: string, name: string) => {
    const newModel: ModelInfo & { providerId: string } = {
      id: modelId,
      name,
      isCustom: true,
      providerId: selectedProviderId,
    };
    setCustomModels(prev => [...prev, newModel]);
    // Refresh to include new model
    setTimeout(fetchModels, 100);
  };

  // Add custom provider
  const handleAddProvider = (provider: Provider, apiKey: string, modelIds: string[]) => {
    // Add provider
    setProviders(prev => [...prev, provider]);
    
    // Save API key
    setApiKeys(prev => ({ ...prev, [provider.id]: apiKey }));
    
    // Add models as custom models
    const newModels: (ModelInfo & { providerId: string })[] = modelIds.map(id => ({
      id,
      name: id, // Use ID as name for custom providers
      isCustom: true,
      providerId: provider.id,
    }));
    setCustomModels(prev => [...prev, ...newModels]);
    
    // Switch to new provider
    setSelectedProviderId(provider.id);
  };

  // Create new conversation
  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Cuộc trò chuyện mới',
      messages: [],
      modelId: selectedModelId,
      providerId: selectedProviderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setShowSidebar(false);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Export conversation
  const handleExportConversation = (id: string, format: 'markdown' | 'json') => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'markdown') {
      content = `# ${conv.title}\n\n`;
      content += `> Model: ${conv.modelId}\n> Provider: ${conv.providerId}\n\n`;
      content += conv.messages.map(m => {
        const role = m.role === 'user' ? '**Bạn:**' : '**AI:**';
        return `${role}\n\n${m.content}\n\n---\n`;
      }).join('\n');
      filename = `${conv.title}.md`;
      mimeType = 'text/markdown';
    } else {
      content = JSON.stringify(conv, null, 2);
      filename = `${conv.title}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!currentApiKey || !selectedModelId || !currentProvider) return;

    let targetConversation = currentConversation;

    // Create new conversation if none exists
    if (!targetConversation) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [],
        modelId: selectedModelId,
        providerId: selectedProviderId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      targetConversation = newConversation;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...(targetConversation.messages || []), userMessage];
    
    setConversations(convs => 
      convs.map(c => 
        c.id === targetConversation!.id 
          ? { 
              ...c, 
              messages: updatedMessages,
              title: c.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : c.title,
              updatedAt: Date.now() 
            }
          : c
      )
    );

    // Start streaming
    setIsStreaming(true);
    setStreamingContent('');
    setChatError(null);
    setLastUserMessage(content);

    await sendMessage(
      updatedMessages,
      selectedModelId,
      settings,
      // onChunk
      (chunk) => {
        setStreamingContent(prev => prev + chunk);
      },
      // onDone
      () => {
        setIsStreaming(false);
        setStreamingContent(prev => {
          if (prev) {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: prev,
              timestamp: Date.now(),
            };
            setConversations(convs =>
              convs.map(c =>
                c.id === targetConversation!.id
                  ? { ...c, messages: [...updatedMessages, assistantMessage], updatedAt: Date.now() }
                  : c
              )
            );
          }
          return '';
        });
      },
      // onError
      (errorMsg, errorCode) => {
        setIsStreaming(false);
        setStreamingContent('');
        setChatError({ message: errorMsg, code: errorCode });
      }
    );
  };

  // Retry last message
  const handleRetry = useCallback(() => {
    setChatError(null);
    if (lastUserMessage) {
      if (currentConversation) {
        const msgs = currentConversation.messages;
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg?.role === 'user') {
          setConversations(convs =>
            convs.map(c =>
              c.id === currentConversation.id
                ? { ...c, messages: msgs.slice(0, -1) }
                : c
            )
          );
        }
      }
      handleSendMessage(lastUserMessage);
    }
  }, [lastUserMessage, currentConversation]);

  return (
    <div className="h-screen flex bg-slate-100">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 h-full
        transform transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={(id) => {
            setCurrentConversationId(id);
            setShowSidebar(false);
          }}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onExportConversation={handleExportConversation}
          onOpenSettings={() => setShowSettings(true)}
          onOpenApiKey={() => setShowApiKey(true)}
          hasApiKey={!!currentApiKey}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-2 sm:px-4 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="items-center gap-2 text-blue-600 hidden sm:flex">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">AI Chat</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end min-w-0">
            <ProviderSelector
              providers={providers}
              selectedProviderId={selectedProviderId}
              onSelectProvider={setSelectedProviderId}
              onAddProvider={() => setShowAddProvider(true)}
              apiKeys={apiKeys}
            />
            <ModelSelector
              models={models}
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
              loading={loadingModels}
              onRefresh={fetchModels}
              providerId={selectedProviderId}
              onAddModel={selectedProviderId === 'nvidia' ? () => setShowAddModel(true) : undefined}
            />
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              title="Cài đặt"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Chào mừng đến với AI Chat!</h2>
              <p className="text-slate-500 max-w-md mb-6 text-sm sm:text-base">
                Trò chuyện với các model AI từ {currentProvider?.name || 'nhiều provider'}. 
                Chọn model ở trên và bắt đầu cuộc hội thoại.
              </p>
              {!currentApiKey && currentProvider && (
                <button
                  onClick={() => setShowApiKey(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Nhập API Key để bắt đầu
                </button>
              )}
              {error && (
                <p className="text-red-500 mt-4 text-sm">{error}</p>
              )}
            </div>
          ) : (
            <div className="pb-4">
              {currentConversation.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isStreaming && streamingContent && (
                <MessageBubble
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingContent,
                    timestamp: Date.now(),
                  }}
                  isStreaming
                />
              )}
              {chatError && (
                <ErrorBubble
                  error={chatError.message}
                  errorCode={chatError.code}
                  providerName={currentProvider?.name}
                  onRetry={handleRetry}
                  onSwitchModel={() => {
                    setChatError(null);
                  }}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={!currentApiKey || !selectedModelId}
          isLoading={isStreaming}
        />
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
      <ApiKeyModal
        isOpen={showApiKey}
        onClose={() => setShowApiKey(false)}
        provider={currentProvider}
        apiKey={currentApiKey}
        onSave={handleSaveApiKey}
      />
      <AddModelModal
        isOpen={showAddModel}
        onClose={() => setShowAddModel(false)}
        onAdd={handleAddModel}
        providerId={selectedProviderId}
      />
      <AddProviderModal
        isOpen={showAddProvider}
        onClose={() => setShowAddProvider(false)}
        onAdd={handleAddProvider}
      />
    </div>
  );
}

export default App;
