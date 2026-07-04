import React, { useState, useEffect, useCallback } from 'react';
import { WSClientMessage, WSServerMessage, Button, ActionType } from '@ospinajuanp-macroboard/shared';
import { useTranslation } from 'react-i18next';

const WS_URL = `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;

const ACTION_ICONS: Record<ActionType, string> = {
  OBS_SCENE: '🎬',
  HOTKEY: '⌨',
  MACRO: '⚡',
};

interface ButtonState {
  pressed: boolean;
  pending?: boolean;
  success?: boolean;
}

function App() {
  const { t } = useTranslation();
  const [connected, setConnected] = useState(false);
  const [buttons, setButtons] = useState<Button[]>([]);
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>({});
  const [obsState, setObsState] = useState({
    micMuted: false,
    recording: false,
    streaming: false,
    currentScene: '',
  });
  const [lastMessage, setLastMessage] = useState<string>('');
  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setConnected(true);
      setLastMessage('Conexion establecida');
      ws.send(JSON.stringify({ type: 'CLIENT_TYPE', clientType: 'mobile' }));
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setLastMessage('Error de conexion');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSServerMessage;
        handleServerMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    wsRef.current = ws;
  }, []);

  const handleServerMessage = (message: WSServerMessage) => {
    switch (message.type) {
      case 'OBS_STATE':
        setObsState({
          micMuted: message.micMuted || false,
          recording: message.recording || false,
          streaming: message.streaming || false,
          currentScene: message.currentScene || '',
        });
        setButtonStates((prev) => {
          const newStates: Record<string, ButtonState> = {};
          Object.entries(prev).forEach(([id, state]) => {
            if (state.pending) {
              newStates[id] = { ...state, pending: false };
            } else {
              newStates[id] = state;
            }
          });
          return newStates;
        });
        break;
      case 'CONFIG_UPDATE':
        if (message.grid) setGrid(message.grid);
        if (message.buttons) {
          console.log('[CONFIG_UPDATE] received, count:', message.buttons.length);
          message.buttons.forEach((b, i) => {
            console.log(`  [${i}] ${b.id} color=${b.color}`);
          });
          setButtons(message.buttons);
        }
        break;
      case 'ACTION_ACK':
        if (message.buttonId) {
          setButtonStates((prev) => ({
            ...prev,
            [message.buttonId!]: { pressed: false, pending: false, success: message.success },
          }));
          setTimeout(() => {
            setButtonStates((prev) => {
              const newStates = { ...prev };
              delete newStates[message.buttonId!];
              return newStates;
            });
          }, 500);
        }
        break;
    }
    setLastMessage(JSON.stringify(message));
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const sendAction = (button: Button) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    setButtonStates((prev) => ({
      ...prev,
      [button.id]: { pressed: true, pending: true },
    }));

    const message: WSClientMessage = {
      type: 'TRIGGER',
      buttonId: button.id,
      action: button.action,
      payload: button.payload,
    };

    wsRef.current.send(JSON.stringify(message));
  };

  const iconMap: Record<string, string> = {
    play: '▶',
    pause: '⏸',
    stop: '⏹',
    mic: '🎤',
    cam: '📷',
    scene: '🎬',
    alert: '🔔',
    key: '⌨',
    star: '⭐',
    heart: '❤️',
    fire: '🔥',
    bolt: '⚡',
  };

  return (
    <div className="min-h-screen bg-deckstream-dark text-white flex flex-col">
      <header className="p-4 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-deckstream-primary">ospinajuanp-macroboard</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            connected ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div className="flex gap-2 text-xs overflow-x-auto pb-1">
          <StatusBadge
            icon="⏺"
            label={obsState.recording ? 'Recording' : 'Rec'}
            active={obsState.recording}
            variant={obsState.recording ? 'danger' : 'default'}
          />
          <StatusBadge
            icon="🔴"
            label={obsState.streaming ? 'Live' : 'Stream'}
            active={obsState.streaming}
            variant={obsState.streaming ? 'danger' : 'default'}
          />
          {obsState.currentScene && (
            <StatusBadge icon="🎬" label={obsState.currentScene} variant="info" />
          )}
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {buttons.map((button) => {
            const state = buttonStates[button.id];

            let isActive = false;
            let activeIcon = button.icon || 'play';
            let activeColor = button.color || 'bg-deckstream-primary';

            if (button.action === 'OBS_RECORD') {
              isActive = obsState.recording;
              activeIcon = isActive ? 'stop' : 'play';
              activeColor = isActive ? 'bg-red-600 animate-pulse' : 'bg-green-600';
            } else if (button.action === 'OBS_STREAM') {
              isActive = obsState.streaming;
              activeIcon = isActive ? 'stop' : 'play';
              activeColor = isActive ? 'bg-red-600 animate-pulse' : 'bg-green-600';
            }

            const className = `w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 font-medium ${activeColor} ${!connected || state?.pending ? 'opacity-50' : 'active:scale-95'} ${state?.pressed ? 'scale-95 opacity-80' : ''} touch-manipulation`;

            if (button.id.startsWith('btn_')) {
              console.log('[BUTTON RENDER]', button.id, 'color:', button.color, 'className includes:', activeColor);
            }

            return (
              <button
                key={button.id}
                onClick={() => sendAction(button)}
                disabled={!connected || state?.pending}
                className={className}
              >
                <span className="text-3xl">{iconMap[activeIcon] || iconMap.play}</span>
                {button.label && (
                  <span className="text-xs mt-1 opacity-80">{button.label}</span>
                )}
                {state?.pending && (
                  <span className="text-xs mt-1 opacity-80">...</span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-gray-500">
        {t('connected')}
      </footer>
    </div>
  );
}

interface StatusBadgeProps {
  icon: string;
  label: string;
  active?: boolean;
  variant?: 'default' | 'success' | 'danger' | 'info';
}

function StatusBadge({ icon, label, active, variant = 'default' }: StatusBadgeProps) {
  const variantClasses = {
    default: active ? 'bg-deckstream-primary' : 'bg-gray-700',
    success: 'bg-green-600',
    danger: 'bg-red-600 animate-pulse',
    info: 'bg-deckstream-secondary',
  };

  return (
    <span className={`px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap ${variantClasses[variant]}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

export default App;
