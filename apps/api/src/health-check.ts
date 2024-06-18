import { format } from 'node:util';

const port = Number.parseInt(process.env['PORT'] ?? '3030') || 3030;

async function healthCheck() {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort('Request timeout');
  }, 1_000);

  const response = await fetch(`http://localhost:${port}/health-check`, {
    signal: controller.signal,
  });
  process.stdout.write(`CODE: ${response.status}\n`);
  process.stdout.write(`STATUS: ${response.statusText}\n`);

  process.exitCode = response.status === 200 ? 0 : 1;
}

healthCheck().catch((error) => {
  process.stderr.write(`ERROR: ${format(error)}\n`);
  process.exitCode = 1;
});
