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
    id: 'minimaxai/minimax-m3',
    name: 'MiniMax M3',
    category: 'Coding',
    contextLength: 128000,
  },
  {
    id: 'z-ai/glm-5.2',
    name: 'GLM 5.2 (Zhipu)',
    category: 'General',
    contextLength: 128000,
  },
  {
    id: 'deepseek-ai/deepseek-v4-pro',
    name: 'Deepseek 4 Pro',
    category: 'Agentic',
    contextLength: 16384,
  },
  {
    id: 'deepseek-ai/deepseek-v4-flash',
    name: 'Deepseek 4 Flash',
    category: 'Agentic',
    contextLength: 16384,
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
    category: 'Agentic',
    contextLength: 128000,
  },
  {
    id: 'meta/llama-3.3-70b-instruct',
    name: 'Meta Llama 3.3-70B',
    category: 'Coding',
    contextLength: 128000,
  },
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Meta Llama 3.2-90 Vision',
    category: 'General',
    contextLength: 128000,
  },
  {
    id: 'meta/llama-4-maverick-17b-128e-instruct',
    name: 'Meta Maverick 4 Vision',
    category: 'General',
    contextLength: 128000,
  },
// 🧠 Reasoning
  {
    id: 'mistralai/mistral-large-3-675b-instruct-2512',
    name: 'Mistral Large 3 675B',
    category: 'General',
    contextLength: 128000,
  },
  {
    id: 'mistralai/mistral-medium-3.5-128b',
    name: 'Mistral Medium 3.5 12B',
    category: 'General',
    contextLength: 128000,
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
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    name: 'Nemotron Ultra 550b',
    category: 'Agent',
    contextLength: 128000,
  },

  // 🌐 More Models
  {
    id: 'stepfun-ai/step-3.5-flash',
    name: 'Step 3.5',
    category: 'General',
    contextLength: 8192,
  },
 {
    id: 'sarvamai/sarvam-m',
    name: 'Sarvam M',
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
