import { Readable } from "node:stream";

export function toNodeReadable(body) {
  if (body && typeof body.getReader === "function") return Readable.fromWeb(body);
  return body;
}
