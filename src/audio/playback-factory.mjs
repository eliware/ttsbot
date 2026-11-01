import { createAudioPipeline } from './audio-pipeline.mjs';
import { createOpenAIClient } from './client.mjs';

export function createPlaybackDependencies({
  createClient, createBuffer, createResource, streamType, ResamplerClass, log,
}) {
  return {
    buildPipeline: createAudioPipeline({ createBuffer, createResource, streamType, ResamplerClass, log }),
    getOpenAIClient: createOpenAIClient({ createClient }),
  };
}
