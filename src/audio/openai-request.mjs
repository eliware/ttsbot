export function requestSpeechOnce({ client, input, voice, signal }) {
  return client.audio.speech.create({
    model: "tts-1",
    input,
    voice,
    response_format: "pcm",
    stream_format: "audio",
    signal,
  });
}
