import Fastify from 'fastify';
import * as path from 'path';
import * as fs from 'fs';
import { getLocalIP, getNetworkInfo } from './network';
import { generateQRCode, getConnectionUrl } from './qr';

export interface HTTPServer {
  app: ReturnType<typeof Fastify>;
  ip: string;
  port: number;
  qrDataUrl: string;
}

export async function createHTTPServer(port: number, clientDistPath: string, adminDistPath: string): Promise<HTTPServer> {
  const app = Fastify({ logger: false });

  const ip = getLocalIP();
  const networks = getNetworkInfo();

  console.log('\n========================================');
  console.log('  ospinajuanp-macroboard Server');
  console.log('========================================');
  console.log(`  IP Local: ${ip}`);
  console.log(`  Puerto:   ${port}`);
  if (networks.length > 1) {
    console.log('  Redes disponibles:');
    networks.forEach((n) => console.log(`    - ${n.interface}: ${n.ip}`));
  }
  console.log('========================================\n');

  app.get('/', async (request, reply) => {
    const adminIndexPath = path.join(adminDistPath, 'index.html');
    if (fs.existsSync(adminIndexPath)) {
      const content = fs.readFileSync(adminIndexPath, 'utf-8');
      return reply.type('text/html').send(content);
    }
    return reply
      .type('text/html')
      .send('<html><body><h1>ospinajuanp-macroboard</h1><p>Pagina no encontrada.</p></body></html>');
  });

  app.get('/m', async (request, reply) => {
    const clientIndexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(clientIndexPath)) {
      const content = fs.readFileSync(clientIndexPath, 'utf-8');
      return reply.type('text/html').send(content);
    }
    return reply
      .type('text/html')
      .send('<html><body><h1>ospinajuanp-macroboard</h1><p>Cliente movil no encontrado.</p></body></html>');
  });

  app.get('/admin', async (request, reply) => {
    const adminIndexPath = path.join(adminDistPath, 'admin.html');
    if (fs.existsSync(adminIndexPath)) {
      const content = fs.readFileSync(adminIndexPath, 'utf-8');
      return reply.type('text/html').send(content);
    }
    return reply
      .type('text/html')
      .send('<html><body><h1>Admin</h1><p>Admin no encontrado. Ejecuta build del admin primero.</p></body></html>');
  });

  app.get('/admin/:path*', async (request, reply) => {
    const params = request.params as { path?: string };
    const filePath = params.path || '';
    const fullPath = path.join(adminDistPath, filePath || 'admin.html');
    if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
      const ext = path.extname(fullPath);
      const contentType = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'text/html';
      const content = fs.readFileSync(fullPath, 'utf-8');
      return reply.type(contentType).send(content);
    }
    return reply.status(404).send('Not found');
  });

  app.get('/assets/:path*', async (request, reply) => {
    const params = request.params as { path?: string };
    const filePath = params.path || '';
    const fullPath = path.join(clientDistPath, 'assets', filePath);
    if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
      const ext = path.extname(fullPath);
      const contentType = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream';
      const content = fs.readFileSync(fullPath);
      return reply.type(contentType).send(content);
    }
    return reply.status(404).send('Not found');
  });

  app.get('/_next*', async (request, reply) => {
    const urlPath = request.url.replace('/_next', '').replace(/^\//, '');
    const clientNextPath = path.join(clientDistPath, '_next', urlPath);
    const adminNextPath = path.join(adminDistPath, '_next', urlPath);
    console.log('DEBUG _next request:', request.url, '-> urlPath:', urlPath);
    if (fs.existsSync(clientNextPath) && !fs.statSync(clientNextPath).isDirectory()) {
      const ext = path.extname(clientNextPath);
      const contentType = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream';
      return reply.type(contentType).send(fs.readFileSync(clientNextPath));
    }
    if (fs.existsSync(adminNextPath) && !fs.statSync(adminNextPath).isDirectory()) {
      const ext = path.extname(adminNextPath);
      const contentType = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream';
      return reply.type(contentType).send(fs.readFileSync(adminNextPath));
    }
    return reply.status(404).send('Not found: ' + request.url);
  });

  app.get('/api/status', async (request, reply) => {
    const qrDataUrl = await generateQRCode(getConnectionUrl(ip, port));
    return reply.send({
      status: 'online',
      ip,
      port,
      qrCode: qrDataUrl,
      connectionUrl: getConnectionUrl(ip, port),
    });
  });

  app.get('/api/health', async (request, reply) => {
    return reply.send({ status: 'ok', timestamp: Date.now() });
  });

  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Servidor HTTP iniciado en http://${ip}:${port}`);
  } catch (error) {
    console.error('Error starting HTTP server:', error);
    throw error;
  }

  return {
    app,
    ip,
    port,
    qrDataUrl: await generateQRCode(getConnectionUrl(ip, port)),
  };
}

export async function stopHTTPServer(server: HTTPServer): Promise<void> {
  await server.app.close();
}
