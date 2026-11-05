import { log as defaultLog } from "@eliware/common";
import { getHealthPort } from "./port.mjs";
import { getListeningHealthPort } from "./listening-port.mjs";
import { logHealthServerListening } from "./startup-log.mjs";
import { startConfiguredHealthServer } from "../server-startup.mjs";

export async function startHealthServer({ log = defaultLog } = {}) {
  const port = getHealthPort();
  const health = await startConfiguredHealthServer(port);
  const listeningPort = getListeningHealthPort(health.server, port);
  logHealthServerListening({ log, port: listeningPort });
  return health;
}
