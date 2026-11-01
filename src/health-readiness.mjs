export function createHealthReadiness() {
  let ready = false;
  return {
    getReady: () => ready,
    setReady(value) {
      ready = value === true;
    },
  };
}
