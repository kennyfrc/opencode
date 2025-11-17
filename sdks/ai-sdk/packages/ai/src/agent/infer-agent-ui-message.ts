import type { InferUITools, UIMessage } from '../ui/ui-messages';
import type { InferAgentTools } from './infer-agent-tools';

/**
 * Infer the UI message type of an agent.
 */
export type InferAgentUIMessage<AGENT> = UIMessage<
  never,
  never,
  InferUITools<InferAgentTools<AGENT>>
>;
