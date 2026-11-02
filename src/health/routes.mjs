export function createHealthRequestHandler(getReady) {
  return function handleHealthRequest(request, response) {
    if (request.url === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (request.url === "/ready") {
      const ready = getReady();
      response.writeHead(ready ? 200 : 503, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: ready ? "ready" : "starting" }));
      return;
    }
    response.writeHead(404);
    response.end();
  };
}
