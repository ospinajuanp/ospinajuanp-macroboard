import { useState, useEffect, useCallback, useRef } from 'react';
import { WSClientMessage, WSServerMessage, Button } from '@ospinajuanp-macroboard/shared';
import { ConnectionStatus } from '../types';

interface UseWebSocketReturn {
  status: ConnectionStatus;
  sendMessage: (message: WSClientMessage) => void;
  lastMessage: WSServerMessage | null;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WSServerMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setStatus('connected');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setStatus('disconnected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSServerMessage;
        setLastMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    wsRef.current = ws;
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WSClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { status, sendMessage, lastMessage };
}
