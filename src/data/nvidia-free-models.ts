import { ModelInfo } from '../types';

// Hardcoded list of NVIDIA NIM free models (updated June 2026)
// Source: build.nvidia.com/models with "Free Endpoint" filter
// Users can add more models manually if needed

export const NVIDIA_FREE_MODELS: ModelInfo[] = [
  // 🔥 Coding & Development (Verified Working)
  {
    id: 'minimaxai/minimax-m2.7',
    name: 'MiniMax M2.7 (230B MoE)',
    category: 'Coding',
    contextLength: 128000,
  },
  {
    id: 'qwen/qwen3-coder-480b-a35b-instruct',
    name: 'Qwen3 Coder 480B',
    category: 'Coding',
    contextLength: 256000,
  },
  {
    id: 'nvidia/llama-3.3-nemotron-super-49b-v1',
    name: 'Nemotron Super 49B',
    category: 'Coding',
    contextLength: 128000,
  },
  {
    id: 'nvidia/nemotron-3-super-120b-a12b',
    name: 'Nemotron 3 Super 120B',
    category: 'Coding',
    contextLength: 128000,
  },

  // 💬 General Purpose (Verified Working)
  {
    id: 'moonshotai/kimi-k2.6',
    name: 'Kimi K2.6 (Moonshot)',
    category: 'General',
    contextLength: 128000,
  },
  {
    id: 'google/gemma-4-31b-it',
    name: 'Gemma 4 31B',
    category: 'General',
    contextLength: 128000,
  },
  {
    id: 'z-ai/glm-5.2',
    name: 'GLM 5.2 (Zhipu)',
    category: 'General',
    contextLength: 128000,
  },
  {
    id: 'meta/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    category: 'General',
    contextLength: 128000,
  },
  {
    id: 'meta/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    category: 'General',
    contextLength: 128000,
  },
  {
    id: 'meta/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    category: 'General',
    contextLength: 128000,
  },
  {
    id: 'mistralai/mistral-large-3-675b-instruct-2512',
    name: 'Mistral Large 3 675B',
    category: 'General',
    contextLength: 128000,
  },

  // 🧠 Reasoning
  {
    id: 'deepseek-ai/deepseek-r1',
    name: 'DeepSeek R1',
    category: 'Reasoning',
    contextLength: 64000,
  },
  {
    id: 'deepseek-ai/deepseek-v3.1',
    name: 'DeepSeek V3.1',
    category: 'Reasoning',
    contextLength: 64000,
  },
  {
    id: 'qwen/qwen3.5-397b-a17b',
    name: 'Qwen 3.5 397B',
    category: 'Reasoning',
    contextLength: 128000,
  },

  // 🌐 More Models
  {
    id: 'microsoft/phi-4-multimodal-instruct',
    name: 'Phi-4 Multimodal',
    category: 'Multimodal',
    contextLength: 16000,
  },
  {
    id: 'microsoft/phi-4',
    name: 'Phi-4',
    category: 'General',
    contextLength: 16000,
  },
  {
    id: 'nvidia/nemotron-mini-4b-instruct',
    name: 'Nemotron Mini 4B',
    category: 'Edge',
    contextLength: 4096,
  },
  {
    id: 'ibm/granite-3.3-8b-instruct',
    name: 'Granite 3.3 8B (IBM)',
    category: 'General',
    contextLength: 8192,
  },
];

// Group models by category for better UI
export const NVIDIA_MODEL_CATEGORIES = [
  'Coding',
  'General',
  'Reasoning',
  'Multimodal',
  'Edge',
] as const;
