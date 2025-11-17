import type { UIMessageStreamOptions } from '../generate-text';
import type { Output } from '../generate-text/output';
import type { ToolSet } from '../generate-text/tool-set';
import type { InferUIMessageChunk } from '../ui-message-stream';
import { convertToModelMessages } from '../ui/convert-to-model-messages';
import type { InferUITools, UIMessage } from '../ui/ui-messages';
import { validateUIMessages } from '../ui/validate-ui-messages';
import type { AsyncIterableStream } from '../util/async-iterable-stream';
import type { Agent } from './agent';

/**
 * Runs the agent and stream the output as a UI message stream.
 *
 * @param agent - The agent to run.
 * @param messages - The input UI messages.
 *
 * @returns The UI message stream.
 */
export async function createAgentUIStream<
  CALL_OPTIONS = never,
  TOOLS extends ToolSet = {},
  OUTPUT extends Output = never,
  MESSAGE_METADATA = unknown,
>({
  agent,
  messages,
  options,
  ...uiMessageStreamOptions
}: {
  agent: Agent<CALL_OPTIONS, TOOLS, OUTPUT>;
  messages: unknown[];
  options?: CALL_OPTIONS;
} & UIMessageStreamOptions<
  UIMessage<MESSAGE_METADATA, never, InferUITools<TOOLS>>
>): Promise<
  AsyncIterableStream<
    InferUIMessageChunk<UIMessage<MESSAGE_METADATA, never, InferUITools<TOOLS>>>
  >
> {
  const validatedMessages = await validateUIMessages<
    UIMessage<MESSAGE_METADATA, never, InferUITools<TOOLS>>
  >({
    messages,
    tools: agent.tools,
  });

  const modelMessages = convertToModelMessages(validatedMessages, {
    tools: agent.tools,
  });

  const result = await agent.stream({
    prompt: modelMessages,
    options: options as CALL_OPTIONS,
  });

  return result.toUIMessageStream(uiMessageStreamOptions);
}
