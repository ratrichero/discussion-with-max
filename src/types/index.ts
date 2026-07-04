export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokenUsage?: TokenUsage;
  images?: string[];
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

export type ApiContent = string | Array<TextContent | ImageContent>;

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  providerId: string;
  createdAt: number;
  updatedAt: number;
  settings?: ChatSettings;
}

export interface ModelInfo {
  id: string;
  name: string;
  category?: string;
  contextLength?: number;
  isCustom?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  modelsEndpoint?: string;
  completionsEndpoint?: string;
  isBuiltin: boolean;
  filterFreeOnly?: boolean;
  models?: ModelInfo[]; // For hardcoded models (NVIDIA) or custom providers
}

export interface ProviderApiKeys {
  [providerId: string]: string;
}

export interface CustomModel {
  providerId: string;
  modelId: string;
  name: string;
}

export interface ChatSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  systemPrompt: 'Bạn là một trợ lý AI thông minh và hữu ích. Hãy trả lời bằng tiếng Việt.',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  topK: 0,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

// Built-in providers
export const BUILTIN_PROVIDERS: Provider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    modelsEndpoint: '/models',
    completionsEndpoint: '/chat/completions',
    isBuiltin: true,
    filterFreeOnly: true,
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    modelsEndpoint: '/models',
    completionsEndpoint: '/chat/completions',
    isBuiltin: true,
    filterFreeOnly: false, // Uses hardcoded list instead
  },
];
