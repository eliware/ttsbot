import { Readable } from 'node:stream';
import { createJitterBuffer } from '../jitterBuffer.mjs';
import { createAudioResource, StreamType } from '@discordjs/voice';
import { Resampler } from '@eliware/resampler';
import { log as defaultLog } from '@eliware/common';

export function toNodeReadable(body) {
  if (body && typeof body.getReader === 'function') return Readable.fromWeb(body);
  return body;
}

export function createAudioPipeline({
  createBuffer = createJitterBuffer,
  createResource = createAudioResource,
  streamType = StreamType,
  ResamplerClass = Resampler,
  log = defaultLog,
}) {
  return function createPipeline(source) {
    const resampler = new ResamplerClass({ inRate: 24000, outRate: 48000, inChannels: 1, outChannels: 2, filterWindow: 8, volume: 1 });
    source.on('error', (error) => log.error('OpenAI TTS stream error', error));
    resampler.on('error', (error) => log.error('PCM resampler error', error));
    const jitterBuffer = createBuffer();
    const pcmStream = source.pipe(resampler).pipe(jitterBuffer);
    const resource = createResource(pcmStream, { inputType: streamType.Raw });
    return { source, resampler, jitterBuffer, resource };
  };
}
