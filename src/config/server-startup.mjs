import { createHealthServer } from "../healthServer.mjs";
import { getHealthHost } from "./health/host.mjs";

export async function startConfiguredHealthServer(
  port,
  createServer = createHealthServer,
  host = getHealthHost(),
) {
  const health = createServer({ port, host });
  await health.start();
  return health;
}
