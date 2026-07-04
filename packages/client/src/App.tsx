import { useState, useEffect } from 'react';

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:3000`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-deckstream-dark text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-deckstream-primary mb-4">DeckStream</h1>
        <p className="text-gray-400">
          {connected ? 'Conectado' : 'Conectando...'}
        </p>
      </div>
    </div>
  );
}

export default App;
