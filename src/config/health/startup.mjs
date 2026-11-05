import { log as defaultLog } from "@eliware/common";
import { getHealthPort } from "./port.mjs";
import { getHealthHost } from "./host.mjs";
import { getListeningHealthPort } from "./listening-port.mjs";
import { logHealthServerListening } from "./startup-log.mjs";
import { startConfiguredHealthServer } from "../server-startup.mjs";

export async function startHealthServer({ log = defaultLog } = {}) {
  const port = getHealthPort();
  const host = getHealthHost();
  const health = await startConfiguredHealthServer(port, undefined, host);
  const listeningPort = getListeningHealthPort(health.server, port);
  logHealthServerListening({ log, host, port: listeningPort });
  return health;
}
