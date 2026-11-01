export function getHealthPort(environment = process.env) {
  const port = Number.parseInt(environment.HEALTH_PORT || '3040', 10);
  return Number.isFinite(port) ? port : 3040;
}
