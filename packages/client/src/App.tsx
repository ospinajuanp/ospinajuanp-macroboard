import { useState, useEffect, useCallback } from 'react';
import { WSClientMessage, WSServerMessage, GridConfig, Button, ActionType } from '@ospinajuanp-macroboard/shared';
import { useTranslation } from 'react-i18next';

const WS_URL = `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;

const ACTION_ICONS: Record<ActionType, string> = {
  OBS_SCENE: '🎬',
  HOTKEY: '⌨',
  MACRO: '⚡',
};

interface ButtonState {
  pressed: boolean;
  success?: boolean;
}

function App() {
  const { t } = useTranslation();
  const [connected, setConnected] = useState(false);
  const [grid, setGrid] = useState<GridConfig>({ rows: 4, columns: 3 });
  const [buttons, setButtons] = useState<Record<string, Button>>({});
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
        break;
      case 'CONFIG_UPDATE':
        if (message.grid) setGrid(message.grid);
        if (message.buttons) setButtons(message.buttons);
        break;
      case 'ACTION_ACK':
        if (message.buttonId) {
          setButtonStates((prev) => ({
            ...prev,
            [message.buttonId!]: { pressed: false, success: message.success },
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
      [button.id]: { pressed: true },
    }));

    const message: WSClientMessage = {
      type: 'TRIGGER',
      buttonId: button.id,
      action: button.action,
      payload: button.payload,
    };

    wsRef.current.send(JSON.stringify(message));
  };

  const getButtonByPosition = (row: number, col: number): Button | undefined => {
    return buttons[`btn_${row}_${col}`];
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
            icon="🎤"
            label={obsState.micMuted ? 'Muted' : 'Mic'}
            active={obsState.micMuted}
            variant={obsState.micMuted ? 'danger' : 'success'}
          />
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
        <div
          className="grid gap-3 max-w-md mx-auto"
          style={{
            gridTemplateRows: `repeat(${grid.rows}, minmax(80px, 1fr))`,
            gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
          }}
        >
          {Array.from({ length: grid.rows * grid.columns }).map((_, index) => {
            const row = Math.floor(index / grid.columns);
            const col = index % grid.columns;
            const button = getButtonByPosition(row, col);
            const state = buttonStates[button?.id || ''];
            const icon = button?.icon || 'play';

            const iconMap: Record<string, string> = {
              play: '▶',
              pause: '⏸',
              stop: '⏹',
              mic: '🎤',
              cam: '📷',
              scene: '🎬',
              alert: '🔔',
              key: '⌨',
            };

            return (
              <button
                key={index}
                onClick={() => button && sendAction(button)}
                disabled={!button || !connected}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center
                  transition-all duration-150 font-medium
                  ${!button ? 'bg-gray-800/50 cursor-default' : 'bg-deckstream-primary active:scale-95'}
                  ${state?.pressed ? 'scale-95 opacity-80' : ''}
                  ${state?.success === false ? 'bg-red-600' : ''}
                  ${state?.success === true ? 'bg-green-600' : ''}
                  touch-manipulation
                `}
              >
                {button ? (
                  <>
                    <span className="text-3xl">{iconMap[icon] || iconMap.play}</span>
                    {button.label && (
                      <span className="text-xs mt-1 opacity-80">{button.label}</span>
                    )}
                    <span className="text-lg mt-1">{ACTION_ICONS[button.action]}</span>
                  </>
                ) : (
                  <span className="text-gray-600">-</span>
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

import React from 'react';

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
