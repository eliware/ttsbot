import { describe, expect, jest, test } from '@jest/globals';
import { createVoiceAssigner } from '../../src/tts/voice-assignment.mjs';

describe('voice assignment', () => {
  test('assigns a voice and persists it', async () => {
    const loadSettings = jest.fn(async () => ({}));
    const saveSettings = jest.fn(async () => {});
    const assignVoice = createVoiceAssigner({
      hasSettings: async () => false,
      loadSettings,
      saveSettings,
      voices: ['a'],
    });
    const state = {};

    await assignVoice('guild', 'next', state);

    expect(state.assignedUserOrder).toEqual(['next']);
    expect(state.assignedVoices.next).toBe('a');
    expect(saveSettings).toHaveBeenCalledWith('guild', 'next', { voice: 'a' });
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
