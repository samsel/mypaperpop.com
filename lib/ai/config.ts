import { env } from '@/lib/env';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { PaperLayout } from './prompts/image';

export const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });

export const GEMINI_MODEL_ID = 'gemini-2.5-flash-lite' as const;

export const chatModel = google(GEMINI_MODEL_ID);

/** Model instance used for the search-grounding pre-step (same model). */
export const searchGroundingModel = google(GEMINI_MODEL_ID);

/** Provider options for Gemini 2.5 calls — minimal thinking for fast responses. */
export const geminiProviderOptions = {
  google: { thinkingLevel: 'minimal' as const },
};

export const chatConfig = {
  maxHistoryMessages: 500,
} as const;

export const imageConfig = {
  apiUrl: 'https://api.x.ai/v1/images/generations',
  editApiUrl: 'https://api.x.ai/v1/images/edits',
  apiKey: env.XAI_API_KEY,
  model: 'grok-imagine-image-quality',
  defaultPaperLayout: {
    orientation: 'portrait',
    aspectRatio: '3:4',
    widthPx: 850,
    heightPx: 1100,
  } satisfies PaperLayout,
  resolution: '1k',
} as const;
