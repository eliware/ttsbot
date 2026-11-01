export function setGuildVoiceConnection(state, connection, textChannelId) {
  state.connection = connection;
  state.linkedTextChannelId = textChannelId;
}

export function clearGuildVoiceConnection(state, { clearQueue = false } = {}) {
  state.connection = null;
  state.linkedTextChannelId = null;
  if (clearQueue) state.queue = [];
}
