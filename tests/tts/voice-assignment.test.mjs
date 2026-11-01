import { describe, expect, jest, test } from '@jest/globals';
import { createVoiceAssigner } from '../../src/tts/voice-assignment.mjs';

describe('voice assignment', () => {
  test('chooses a least-used voice and persists it', async () => {
    const loadSettings = jest.fn(async () => ({}));
    const saveSettings = jest.fn(async () => {});
    const assignVoice = createVoiceAssigner({
      hasSettings: async () => false,
      loadSettings,
      saveSettings,
      voices: ['a', 'b', 'c'],
      random: () => 0,
    });
    const state = { assignedUserOrder: ['first'], assignedVoices: { first: 'a' } };

    await assignVoice('guild', 'next', state);

    expect(state.assignedUserOrder).toEqual(['first', 'next']);
    expect(state.assignedVoices.next).toBe('b');
    expect(saveSettings).toHaveBeenCalledWith('guild', 'next', { voice: 'b' });
  });

  test('selects among tied least-used voices', async () => {
    const saveSettings = jest.fn(async () => {});
    const assignVoice = createVoiceAssigner({
      hasSettings: async () => false,
      loadSettings: async () => ({}),
      saveSettings,
      voices: ['a', 'b', 'c'],
      random: () => 0.99,
    });
    const state = { assignedUserOrder: [], assignedVoices: { first: 'a' } };

    await assignVoice('guild', 'next', state);

    expect(state.assignedVoices.next).toBe('c');
  });

  test('keeps saved settings and skips repeated allocation', async () => {
    const hasSettings = jest.fn(async () => true);
    const saveSettings = jest.fn();
    const state = {};
    await createVoiceAssigner({ hasSettings, saveSettings })('guild', 'user', state);
    expect(hasSettings).toHaveBeenCalledWith('guild', 'user');
    expect(saveSettings).not.toHaveBeenCalled();
    expect(state).toEqual({});
  });
});
