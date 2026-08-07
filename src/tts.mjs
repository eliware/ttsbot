// helper module (kept minimal for POC)
import { Resampler } from '@eliware/resampler';
import fetch from 'node-fetch';
import { Transform } from 'stream';

class PcmFrameAligner extends Transform {
  constructor(frameBytes) {
    super();
    this.frameBytes = frameBytes;
    this.pending = Buffer.alloc(0);
  }

  _transform(chunk, encoding, callback) {
    const input = this.pending.length ? Buffer.concat([this.pending, chunk]) : chunk;
    const alignedLength = input.length - (input.length % this.frameBytes);
    if (alignedLength > 0) this.push(input.subarray(0, alignedLength));
    this.pending = input.subarray(alignedLength);
    callback();
  }

  _flush(callback) {
    this.pending = Buffer.alloc(0);
    callback();
  }
}

export async function streamOpenAIToDiscordPcm(openaiKey, text, voice='coral', instructions='') {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      input: text,
      voice,
      instructions,
      response_format: 'pcm',
      stream_format: 'audio'
    }),
  });
  if (!res.ok || !res.body) throw new Error('OpenAI TTS failed: ' + await res.text());
  const aligner = new PcmFrameAligner(2);
  const resampler = new Resampler({ inRate: 24000, outRate: 48000, inChannels: 1, outChannels: 2 });
  return res.body.pipe(aligner).pipe(resampler);
}
