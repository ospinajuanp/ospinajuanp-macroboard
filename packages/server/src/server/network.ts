import * as os from 'os';

export function getLocalIP(): string {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }

  return '127.0.0.1';
}

export function getNetworkInfo(): { ip: string; interface: string }[] {
  const networks: { ip: string; interface: string }[] = [];
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        networks.push({ ip: alias.address, interface: name });
      }
    }
  }

  return networks;
}
