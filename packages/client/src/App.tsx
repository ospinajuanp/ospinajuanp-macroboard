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
  const [obsConnected, setObsConnected] = useState(true);
  const [obsReconnecting, setObsReconnecting] = useState(false);
  const [buttons, setButtons] = useState<Button[]>([]);
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>({});
  const [obsState, setObsState] = useState({
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
          recording: message.recording || false,
          streaming: message.streaming || false,
          currentScene: message.currentScene || '',
        });
        if (message.obsConnected !== undefined) {
          setObsConnected(message.obsConnected ?? true);
        }
        if (message.obsReconnecting !== undefined) {
          setObsReconnecting(message.obsReconnecting ?? false);
        }
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
        if (message.buttons) setButtons(message.buttons);
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

  const shouldShowOverlay = !connected || (obsReconnecting && !obsConnected);

  return (
    <div className="min-h-screen bg-deckstream-dark text-white flex flex-col">
      {shouldShowOverlay && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex flex-col items-center justify-center z-50">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-deckstream-primary/30 border-t-deckstream-primary rounded-full animate-spin" />
            </div>
            <div className="w-6 h-6 bg-deckstream-primary rounded-full animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Reconectando</h2>
          <p className="text-gray-400">
            {!connected ? 'Esperando conexion con el servidor...' : 'Esperando conexion con OBS...'}
          </p>
        </div>
      )}

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

      <main className="flex-1 p-4 space-y-6">
        {(() => {
          const defaultButtons = buttons.filter(b => b.action === 'OBS_RECORD' || b.action === 'OBS_STREAM');
          const sceneButtons = buttons.filter(b => b.action === 'OBS_SCENE');
          const otherButtons = buttons.filter(b => b.action !== 'OBS_RECORD' && b.action !== 'OBS_STREAM' && b.action !== 'OBS_SCENE');

          const renderButton = (button: Button) => {
            const state = buttonStates[button.id];
            let activeIcon = button.icon || 'play';
            let activeColor = button.color || 'bg-deckstream-primary';
            let isSceneActive = false;

            if (button.action === 'OBS_RECORD') {
              activeIcon = obsState.recording ? 'stop' : 'play';
              activeColor = obsState.recording ? 'bg-red-600 animate-pulse' : 'bg-green-600';
            } else if (button.action === 'OBS_STREAM') {
              activeIcon = obsState.streaming ? 'stop' : 'play';
              activeColor = obsState.streaming ? 'bg-red-600 animate-pulse' : 'bg-green-600';
            } else if (button.action === 'OBS_SCENE' && obsState.currentScene) {
              isSceneActive = obsState.currentScene === button.payload;
            }

            const borderClass = isSceneActive ? 'ring-4 ring-white' : '';
            const className = `w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 font-medium ${activeColor} ${borderClass} ${!connected || state?.pending ? 'opacity-50' : 'active:scale-95'} ${state?.pressed ? 'scale-95 opacity-80' : ''} touch-manipulation`;

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
          };

          return (
            <>
              {defaultButtons.length > 0 && (
                <div className="bg-gray-800/50 rounded-2xl p-4">
                  <h2 className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Control</h2>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {defaultButtons.map(renderButton)}
                  </div>
                </div>
              )}

              {sceneButtons.length > 0 && (
                <div className="bg-gray-800/50 rounded-2xl p-4">
                  <h2 className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Escenas</h2>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {sceneButtons.map(renderButton)}
                  </div>
                </div>
              )}

              {otherButtons.length > 0 && (
                <div className="bg-gray-800/50 rounded-2xl p-4">
                  <h2 className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Otros</h2>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {otherButtons.map(renderButton)}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </main>
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
