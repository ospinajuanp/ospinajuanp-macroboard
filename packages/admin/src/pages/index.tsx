import { useState, useEffect } from 'react';

interface StatusResponse {
  status: string;
  ip: string;
  port: number;
  qrCode: string;
  connectionUrl: string;
}

export default function HomePage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-deckstream-dark text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-deckstream-primary mb-8">ospinajuanp-macroboard</h1>

      {status ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Conectar Móvil</h2>
          <img src={status.qrCode} alt="QR Code" className="mx-auto mb-4 rounded-lg" />
          <p className="text-gray-400 mb-2">O escanea el código QR</p>
          <p className="font-mono text-deckstream-primary bg-gray-700 px-4 py-2 rounded-lg">
            {status.connectionUrl}/m
          </p>
          <a
            href="/admin"
            className="inline-block mt-6 px-6 py-3 bg-deckstream-primary hover:bg-deckstream-secondary rounded-lg font-medium transition-colors"
          >
            Ir al Admin
          </a>
        </div>
      ) : (
        <p className="text-gray-400">Conectando...</p>
      )}
    </main>
  );
}
