import { FastifyPluginAsync } from 'fastify';
import * as path from 'path';
import * as fs from 'fs';
import fp from 'fastify-plugin';
import { generateQRCode, getConnectionUrl } from '../server/qr';
import { createLogger } from '../lib/logger';

const log = createLogger('api-routes');

export interface APIRoutesOptions {
  ip: string;
  port: number;
}

async function apiRoutesImpl(app: import('fastify').FastifyInstance, opts: APIRoutesOptions): Promise<void> {
  app.get('/api/status', async (_request, reply) => {
    const qrCode = await generateQRCode(getConnectionUrl(opts.ip, opts.port));
    return reply.send({
      status: 'online',
      ip: opts.ip,
      port: opts.port,
      qrCode,
      connectionUrl: getConnectionUrl(opts.ip, opts.port),
    });
  });

  app.get('/api/health', async (_request, reply) => {
    return reply.send({ status: 'ok', timestamp: Date.now() });
  });

  app.post('/api/quit', async (_request, reply) => {
    const quitFile = path.join(process.cwd(), '.quit');
    try {
      fs.writeFileSync(quitFile, 'quit');
      log.info('Shutdown requested via /api/quit');
      return reply.send({ status: 'ok', message: 'Server shutdown initiated' });
    } catch (err) {
      log.error('Failed to initiate shutdown', {
        error: err instanceof Error ? err.message : String(err),
      });
      return reply.status(500).send({ status: 'error', message: 'Failed to initiate shutdown' });
    }
  });
}

export const apiRoutes: FastifyPluginAsync<APIRoutesOptions> = fp(apiRoutesImpl, {
  name: 'api-routes',
});