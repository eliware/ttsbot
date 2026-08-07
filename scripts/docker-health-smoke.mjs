import { execFileSync } from 'node:child_process';

const image = process.argv[2] || 'ttsbot:migration-step-1';
const requestedPort = process.env.DOCKER_SMOKE_PORT || '0';
let hostPort;
const command = [
  '--input-type=module', '-e',
  "import('./src/healthServer.mjs').then(async ({ createHealthServer }) => { await createHealthServer({ host: '0.0.0.0' }).start(); })",
];
const container = `ttsbot-smoke-${process.pid}`;
let containerId;

const cleanup = () => {
  if (containerId) execFileSync('docker', ['rm', '--force', containerId], { stdio: 'ignore' });
};

try {
  containerId = execFileSync('docker', [
    'run', '--detach', '--rm', '--name', container, '-p', `127.0.0.1:${requestedPort}:8080`,
    '--entrypoint', 'node', image, ...command,
  ], { encoding: 'utf8' }).trim();

  hostPort = execFileSync('docker', ['port', containerId, '8080/tcp'], { encoding: 'utf8' }).trim().split(':').pop();

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const request = async (path) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        return await fetch(`http://127.0.0.1:${hostPort}${path}`);
      } catch {
        await sleep(250);
      }
    }
    throw new Error(`Timed out waiting for ${path}`);
  };

  const health = await request('/health');
  if (health.status !== 200 || (await health.json()).status !== 'ok') throw new Error('health check failed');
  const ready = await request('/ready');
  if (ready.status !== 503 || (await ready.json()).status !== 'starting') throw new Error('readiness check failed');
  console.log('Docker health smoke passed');
} finally {
  cleanup();
}
