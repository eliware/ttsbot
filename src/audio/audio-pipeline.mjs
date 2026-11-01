import { createJitterBuffer } from '../jitterBuffer.mjs';
import { createAudioResource, StreamType } from '@discordjs/voice';
import { Resampler } from '@eliware/resampler';
import { log as defaultLog } from '@eliware/common';
import { attachAudioStreamErrorHandlers } from './stream-errors.mjs';

export function createAudioPipeline({
  createBuffer = createJitterBuffer,
  createResource = createAudioResource,
  streamType = StreamType,
  ResamplerClass = Resampler,
  log = defaultLog,
}) {
  return function createPipeline(source) {
    const resampler = new ResamplerClass({ inRate: 24000, outRate: 48000, inChannels: 1, outChannels: 2, filterWindow: 8, volume: 1 });
    attachAudioStreamErrorHandlers({ source, resampler, log });
    const jitterBuffer = createBuffer();
    const pcmStream = source.pipe(resampler).pipe(jitterBuffer);
    const resource = createResource(pcmStream, { inputType: streamType.Raw });
    return { source, resampler, jitterBuffer, resource };
  };
}
