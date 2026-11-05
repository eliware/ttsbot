export function logHealthServerListening({ log, host, port }) {
  log.info("Health server listening", { host, port });
}
