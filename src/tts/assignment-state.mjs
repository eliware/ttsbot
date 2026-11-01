export function ensureAssignmentState(state) {
  state.assignedUserOrder ??= [];
  state.assignedVoices ??= {};
  return state;
}
