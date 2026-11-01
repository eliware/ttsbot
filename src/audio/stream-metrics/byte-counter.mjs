export function attachAudioByteCounter(source) {
  let audioBytes = 0;
  source.on("data", (chunk) => {
    audioBytes += chunk.length;
  });
  return () => audioBytes;
}
