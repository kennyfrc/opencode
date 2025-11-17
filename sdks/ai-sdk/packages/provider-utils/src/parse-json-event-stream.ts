import {
  type EventSourceMessage,
  EventSourceParserStream,
} from 'eventsource-parser/stream';
import { type ParseResult, safeParseJSON } from './parse-json';
import { type FlexibleSchema } from './schema';

/**
 * Parses a JSON event stream into a stream of parsed JSON objects.
 */
export function parseJsonEventStream<T>({
  stream,
  schema,
}: {
  stream: ReadableStream<Uint8Array>;
  schema: FlexibleSchema<T>;
}): ReadableStream<ParseResult<T>> {
  const decoder = new TextDecoderStream() as unknown as ReadableWritablePair<
    string,
    Uint8Array<ArrayBufferLike>
  >;
  return stream
    .pipeThrough(decoder)
    .pipeThrough(new EventSourceParserStream())
    .pipeThrough(
      new TransformStream<EventSourceMessage, ParseResult<T>>({
        async transform({ data }, controller) {
          // ignore the 'DONE' event that e.g. OpenAI sends:
          if (data === '[DONE]') {
            return;
          }

          controller.enqueue(await safeParseJSON({ text: data, schema }));
        },
      }),
    );
}
