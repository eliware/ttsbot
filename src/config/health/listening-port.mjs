export function getListeningHealthPort(server, fallbackPort) {
  const address = server.address();
  return address && typeof address === "object" ? address.port : fallbackPort;
}
