export function isRetryableOpenAIError(error) {
  return error?.status === 429 || error?.status >= 500;
}

export function openAIRetryDelay(attempt) {
  return 250 * 2 ** (attempt - 1);
}

export function shouldLogBufferUnderrun(playbackStarted) {
  return playbackStarted === true;
}
