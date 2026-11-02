import { createAudioPipeline } from "../pipeline.mjs";
import { createOpenAIClient } from "../client.mjs";
import { createJitterBuffer } from "../../jitterBuffer.mjs";
import {
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
  entersState,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { Resampler } from "@eliware/resampler";
import { sleep } from "../delay.mjs";
import { isRetryableOpenAIError, openAIRetryDelay } from "../../ttsPolicies.mjs";
import { log as defaultLog } from "@eliware/common";

export function createPlaybackDependencies(options = {}) {
  const {
    createClient,
    createBuffer = createJitterBuffer,
    createResource = createAudioResource,
    AudioStatus = AudioPlayerStatus,
    streamType = StreamType,
    waitForState = entersState,
    connectionStatus = VoiceConnectionStatus,
    ResamplerClass = Resampler,
    getUserSettings,
    replaceText,
    isRetryable = isRetryableOpenAIError,
    retryDelay = openAIRetryDelay,
    log = defaultLog,
    now = () => performance.now(),
    delay = sleep,
  } = options;
  return {
    AudioStatus,
    waitForState,
    connectionStatus,
    getUserSettings,
    replaceText,
    isRetryable,
    retryDelay,
    log,
    now,
    delay,
    buildPipeline: createAudioPipeline({
      createBuffer,
      createResource,
      streamType,
      ResamplerClass,
      log,
    }),
    getOpenAIClient: createOpenAIClient({ createClient }),
  };
}
