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

export async function createHTTPServer(port: number, clientDistPath: string): Promise<HTTPServer> {
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
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8');
      return reply.type('text/html').send(content);
    }
    return reply
      .type('text/html')
      .send('<html><body><h1>ospinajuanp-macroboard Server</h1><p>Cliente no encontrado. Ejecuta build del cliente primero.</p></body></html>');
  });

  app.get('/admin', async (request, reply) => {
    return reply
      .type('text/html')
      .send('<html><body><h1>Admin</h1><p>Panel de administracion en desarrollo.</p></body></html>');
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
