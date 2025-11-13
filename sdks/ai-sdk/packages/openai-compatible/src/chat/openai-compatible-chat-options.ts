import { z } from 'zod/v4';

export type OpenAICompatibleChatModelId = string;

export const openaiCompatibleProviderOptions = z.object({
  user: z.string().optional(),

  reasoningEffort: z.string().optional(),

  textVerbosity: z.string().optional(),

  /** Inline reasoning when providers reject reasoning_content. */
  reasoningFallback: z.enum(['angle-brackets']).optional(),
});

export type OpenAICompatibleProviderOptions = z.infer<
  typeof openaiCompatibleProviderOptions
>;
