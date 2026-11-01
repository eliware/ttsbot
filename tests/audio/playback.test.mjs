import { EventEmitter } from 'node:events';
import { describe, expect, jest, test } from '@jest/globals';
import { createPlayback, toNodeReadable } from '../../src/audio/playback.mjs';

class FakeStream extends EventEmitter {
  constructor() {
    super();
    this.destroy = jest.fn();
  }

  pipe(destination) {
    return destination;
  }
}

class FakeResampler extends FakeStream {
  constructor(options) {
    super();
    this.options = options;
  }
}

class FakePlayer extends EventEmitter {
  play(resource) {
    this.resource = resource;
    this.emit('play', resource);
  }
}

function createHarness({ responses = [], settings = { voice: 'nova' }, replace, waitForState } = {}) {
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const player = new FakePlayer();
  const connection = { subscribe: jest.fn() };
  const state = { connection, player, current: null };
  const speechCreate = jest.fn(async () => responses.shift());
  const createClient = jest.fn(() => ({ audio: { speech: { create: speechCreate } } }));
  const dependencies = {
    createClient,
    createBuffer: jest.fn(() => new FakeStream()),
    createResource: jest.fn((stream, options) => ({ stream, options })),
    AudioStatus: { Idle: 'idle', Playing: 'playing', Buffering: 'buffering' },
    streamType: { Raw: 'raw' },
    waitForState: waitForState ?? jest.fn(async () => {}),
    connectionStatus: { Ready: 'ready' },
    ResamplerClass: FakeResampler,
    getUserSettings: jest.fn(async () => settings),
    replaceText: replace ?? jest.fn(async (text) => text),
    log,
    now: jest.fn(() => 100),
    delay: jest.fn(async () => {}),
  };
  return { dependencies, log, player, connection, state, speechCreate, createClient };
}

async function completePlayback(playText, harness, text = 'hello', receivedAt = 50) {
  const started = new Promise((resolve) => harness.player.once('play', resolve));
  const completion = playText('guild', text, 'user', 'user#1', receivedAt, harness.state);
  await started;
  const current = harness.state.current;
  current.source.emit('data', Buffer.from('pcm'));
  current.source.emit('end');
  current.resampler.emit('data', Buffer.from('resampled'));
  current.resampler.emit('end');
  harness.player.emit('buffering');
  harness.player.emit('playing');
  harness.player.emit('playing');
  harness.player.emit('buffering');
  harness.player.emit('idle');
  await completion;
}

describe('TTS playback', () => {
  test('converts Web streams and preserves already streamable bodies', () => {
    const webStream = new ReadableStream({ start(controller) { controller.close(); } });
    const readable = toNodeReadable(webStream);
    const body = {};

    expect(typeof readable.pipe).toBe('function');
    expect(toNodeReadable(body)).toBe(body);
  });

  test('requests, streams, logs, and cleans up playback resources', async () => {
    const body = new FakeStream();
    const response = { body };
    const harness = createHarness({ responses: [response] });
    const playText = createPlayback(harness.dependencies);

    await completePlayback(playText, harness);

    expect(harness.createClient).toHaveBeenCalledTimes(1);
    expect(harness.speechCreate).toHaveBeenCalledWith(expect.objectContaining({
      input: 'hello', voice: 'nova', model: 'tts-1', response_format: 'pcm', stream_format: 'audio',
    }));
    expect(harness.dependencies.createResource).toHaveBeenCalledWith(
      expect.any(FakeStream), { inputType: 'raw' },
    );
    expect(harness.connection.subscribe).toHaveBeenCalledWith(harness.player);
    expect(harness.log.warn).toHaveBeenCalledWith('Discord audio buffer underrun', { guildId: 'guild', userId: 'user' });
    expect(harness.log.debug).toHaveBeenCalledWith('OpenAI TTS first audio byte', expect.any(Object));
    expect(harness.log.debug).toHaveBeenCalledWith('Discord audio playback started', expect.any(Object));
    expect(body.destroy).toHaveBeenCalledTimes(1);
    expect(harness.state.current).toBeNull();
  });

  test('caches one OpenAI client across queued playback', async () => {
    const harness = createHarness({ responses: [{ body: new FakeStream() }, { body: new FakeStream() }] });
    const playText = createPlayback(harness.dependencies);

    await completePlayback(playText, harness, 'first');
    await completePlayback(playText, harness, 'second');

    expect(harness.createClient).toHaveBeenCalledTimes(1);
    expect(harness.speechCreate).toHaveBeenCalledTimes(2);
  });

  test('skips invalid text, missing connections, and unready connections', async () => {
    const waitForState = jest.fn(async () => { throw new Error('not ready'); });
    const harness = createHarness({ waitForState });
    const playText = createPlayback(harness.dependencies);

    await playText('guild', '', 'user', '', 0, harness.state);
    await playText('guild', 'x'.repeat(2001), 'user', '', 0, harness.state);
    harness.state.connection = null;
    await playText('guild', 'hello', 'user', '', 0, harness.state);
    harness.state.connection = {};
    await playText('guild', 'hello', 'user', '', 0, harness.state);

    expect(waitForState).toHaveBeenCalledTimes(1);
    expect(harness.log.warn).toHaveBeenNthCalledWith(1, 'No voice connection for guild', 'guild');
    expect(harness.log.warn).toHaveBeenNthCalledWith(2, 'Voice connection was not ready for guild', 'guild');
    expect(harness.speechCreate).not.toHaveBeenCalled();
  });

  test('uses coral when no user voice exists and keeps the original text after replacement errors', async () => {
    const replaceError = new Error('replacement failed');
    const body = new FakeStream();
    const harness = createHarness({
      responses: [{ body }], settings: {},
      replace: jest.fn(async () => { throw replaceError; }),
    });
    const playText = createPlayback(harness.dependencies);

    await completePlayback(playText, harness);

    expect(harness.speechCreate).toHaveBeenCalledWith(expect.objectContaining({ input: 'hello', voice: 'coral' }));
    expect(harness.log.error).toHaveBeenCalledWith('Replacements error', replaceError);
  });

  test('stops when OpenAI fails or cancels the request', async () => {
    const requestError = { status: 401 };
    const failed = createHarness({ responses: [] });
    failed.speechCreate.mockRejectedValue(requestError);
    const failedPlayText = createPlayback(failed.dependencies);
    await failedPlayText('guild', 'hello', 'user', '', 0, failed.state);
    expect(failed.log.error).toHaveBeenCalledWith('OpenAI TTS request error', requestError);

    const aborted = createHarness({ responses: [] });
    aborted.speechCreate.mockImplementation(() => {
      aborted.state.current.controller.abort();
      throw new Error('request aborted');
    });
    await createPlayback(aborted.dependencies)('guild', 'hello', 'user', '', 0, aborted.state);
    expect(aborted.log.debug).toHaveBeenCalledWith('OpenAI TTS request aborted', { guildId: 'guild', userId: 'user' });
  });

  test('cancels an audio body when its request is aborted after the response', async () => {
    const cancel = jest.fn();
    const response = { body: { cancel } };
    const harness = createHarness({ responses: [response] });
    harness.speechCreate.mockImplementation(() => {
      harness.state.current.controller.abort();
      return response;
    });

    await createPlayback(harness.dependencies)('guild', 'hello', 'user', '', 0, harness.state);

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(harness.log.debug).toHaveBeenCalledWith('Discarding canceled OpenAI TTS response', { guildId: 'guild', userId: 'user' });
  });

  test('reports missing and non-streamable audio bodies', async () => {
    const missing = createHarness({ responses: [{}] });
    await createPlayback(missing.dependencies)('guild', 'hello', 'user', '', 0, missing.state);
    expect(missing.log.error).toHaveBeenCalledWith('OpenAI TTS response did not include an audio body');

    const invalid = createHarness({ responses: [{ body: {} }] });
    await createPlayback(invalid.dependencies)('guild', 'hello', 'user', '', 0, invalid.state);
    expect(invalid.log.error).toHaveBeenCalledWith('OpenAI TTS response body is not streamable');
  });

  test('logs stream errors and tolerates cleanup failures', async () => {
    const body = new FakeStream();
    body.destroy.mockImplementation(() => { throw new Error('body cleanup failed'); });
    const harness = createHarness({ responses: [{ body }] });
    const playText = createPlayback({
      ...harness.dependencies,
      createBuffer: () => {
        const buffer = new FakeStream();
        buffer.destroy.mockImplementation(() => { throw new Error('buffer cleanup failed'); });
        return buffer;
      },
      ResamplerClass: class extends FakeResampler {
        destroy = jest.fn(() => { throw new Error('resampler cleanup failed'); });
      },
    });
    const completion = playText('guild', 'hello', 'user', '', 0, harness.state);
    await new Promise((resolve) => harness.player.once('play', resolve));
    const current = harness.state.current;
    const streamError = new Error('source error');
    const resamplerError = new Error('resampler error');
    current.source.emit('error', streamError);
    current.resampler.emit('error', resamplerError);
    harness.player.emit('idle');
    await completion;

    expect(harness.log.error).toHaveBeenCalledWith('OpenAI TTS stream error', streamError);
    expect(harness.log.error).toHaveBeenCalledWith('PCM resampler error', resamplerError);
  });
});
