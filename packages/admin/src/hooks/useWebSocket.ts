import { useState, useEffect, useCallback, useRef } from 'react';
import { WSClientMessage, WSServerMessage } from '@ospinajuanp-macroboard/shared';
import { ConnectionStatus } from '../types';

interface UseWebSocketReturn {
  status: ConnectionStatus;
  sendMessage: (message: WSClientMessage) => void;
  lastMessage: WSServerMessage | null;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastMessage, setLastMessage] = useState<WSServerMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (isUnmountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isUnmountedRef.current) {
        setStatus('connected');
      }
    };

    ws.onclose = () => {
      if (isUnmountedRef.current) return;
      setStatus('disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current) {
          connect();
        }
      }, 3000);
    };

    ws.onerror = () => {
      if (isUnmountedRef.current) return;
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
  }, [url]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
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
