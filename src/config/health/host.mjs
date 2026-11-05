export function getHealthHost(environment = process.env) {
  return environment.HEALTH_HOST?.trim() || "127.0.0.1";
}
