import { FastifyPluginAsync } from 'fastify';
import * as path from 'path';
import * as fs from 'fs';
import fp from 'fastify-plugin';
import { createLogger } from '../lib/logger';

const log = createLogger('static-routes');

export interface StaticRoutesOptions {
  clientDistPath: string;
  adminDistPath: string;
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath);
  if (ext === '.js') return 'application/javascript';
  if (ext === '.css') return 'text/css';
  if (ext === '.json') return 'application/json';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.ico') return 'image/x-icon';
  return 'application/octet-stream';
}

function safeRead(filePath: string): Buffer | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) return null;
    return fs.readFileSync(filePath);
  } catch (err) {
    log.warn('Failed to read file', { filePath, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

async function staticRoutesImpl(app: import('fastify').FastifyInstance, opts: StaticRoutesOptions): Promise<void> {
  const { clientDistPath, adminDistPath } = opts;

  app.get('/', async (_request, reply) => {
    const adminIndex = path.join(adminDistPath, 'index.html');
    const content = safeRead(adminIndex);
    if (content) {
      return reply.type('text/html').send(content);
    }
    return reply
      .type('text/html')
      .send('<html><body><h1>ospinajuanp-macroboard</h1><p>Pagina no encontrada.</p></body></html>');
  });

  app.get('/m', async (_request, reply) => {
    const clientIndex = path.join(clientDistPath, 'index.html');
    const content = safeRead(clientIndex);
    if (content) {
      return reply.type('text/html').send(content);
    }
    return reply
      .type('text/html')
      .send(`<html><body><h1>ospinajuanp-macroboard</h1><p>Cliente movil no encontrado. Path: ${clientIndex}</p></body></html>`);
  });

  app.get('/admin', async (_request, reply) => {
    const adminIndex = path.join(adminDistPath, 'admin.html');
    const content = safeRead(adminIndex);
    if (content) {
      return reply.type('text/html').send(content);
    }
    return reply
      .type('text/html')
      .send('<html><body><h1>Admin</h1><p>Admin no encontrado. Ejecuta build del admin primero.</p></body></html>');
  });

  app.get('/admin/:path*', async (request, reply) => {
    const params = request.params as { path?: string };
    const requested = params.path || '';
    const fullPath = path.join(adminDistPath, requested || 'admin.html');
    const content = safeRead(fullPath);
    if (content) {
      return reply.type(getContentType(fullPath)).send(content);
    }
    return reply.status(404).send('Not found');
  });

  app.get('/assets/*', async (request, reply) => {
    const urlPath = request.url.replace('/assets/', '');
    const fullPath = path.join(clientDistPath, 'assets', urlPath);
    const content = safeRead(fullPath);
    if (content) {
      return reply.type(getContentType(fullPath)).send(content);
    }
    return reply.status(404).send('Not found: ' + fullPath);
  });

  app.get('/_next*', async (request, reply) => {
    const urlPath = request.url.replace('/_next', '').replace(/^\//, '');
    const candidates = [
      path.join(clientDistPath, '_next', urlPath),
      path.join(adminDistPath, '_next', urlPath),
    ];
    for (const fullPath of candidates) {
      const content = safeRead(fullPath);
      if (content) {
        return reply.type(getContentType(fullPath)).send(content);
      }
    }
    return reply.status(404).send('Not found: ' + request.url);
  });
}

export const staticRoutes: FastifyPluginAsync<StaticRoutesOptions> = fp(staticRoutesImpl, {
  name: 'static-routes',
});