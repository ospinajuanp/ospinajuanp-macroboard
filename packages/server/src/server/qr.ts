import QRCode from 'qrcode';

export async function generateQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#6366f1',
        light: '#0f172a',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

export function getConnectionUrl(ip: string, port: number, path: string = '/m'): string {
  return `http://${ip}:${port}${path}`;
}
