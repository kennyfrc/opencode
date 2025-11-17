export async function processTextStream({
  stream,
  onTextPart,
}: {
  stream: ReadableStream<Uint8Array>;
  onTextPart: (chunk: string) => Promise<void> | void;
}): Promise<void> {
  const decoder = new TextDecoderStream() as unknown as ReadableWritablePair<
    string,
    Uint8Array<ArrayBufferLike>
  >;
  const reader = stream.pipeThrough(decoder).getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    await onTextPart(value);
  }
}
