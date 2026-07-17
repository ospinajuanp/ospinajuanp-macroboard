import * as path from 'path';
import { createApp } from './app';
import { getConfigPath, isPackaged } from './server/paths';
import { createLogger } from './lib/logger';

const log = createLogger('bootstrap');
const DEFAULT_PORT = 3000;

function resolveStaticPaths() {
  const base = isPackaged()
    ? path.dirname(process.execPath)
    : path.resolve(path.dirname(__filename), '..', '..', '..');
  return {
    clientDistPath: path.join(base, 'static', 'client'),
    adminDistPath: path.join(base, 'static', 'admin'),
  };
}

async function main(): Promise<void> {
  log.info('ospinajuanp-macroboard starting');
  const { clientDistPath, adminDistPath } = resolveStaticPaths();

  const app = await createApp({
    httpPort: DEFAULT_PORT,
    clientDistPath,
    adminDistPath,
    configPath: getConfigPath(),
  });

  app.configService.load();
  await app.start();

  const quitInterval = isPackaged()
    ? setInterval(() => {
        const quitFile = path.join(process.cwd(), '.quit');
        if (require('fs').existsSync(quitFile)) {
          try { require('fs').unlinkSync(quitFile); } catch {}
          void app.shutdown().then(() => process.exit(0));
        }
      }, 1000)
    : null;

  let shuttingDown = false;
  const gracefulShutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    log.info('Shutting down', { signal });
    if (quitInterval) clearInterval(quitInterval);
    await app.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
}

main().catch((err) => {
  log.error('Fatal error', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});