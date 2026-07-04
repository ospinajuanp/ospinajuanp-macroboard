import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button, ActionType } from '@ospinajuanp-macroboard/shared';

const WS_URL = `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;

const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: 'OBS_SCENE', label: 'Cambiar Escena OBS' },
  { value: 'HOTKEY', label: 'Atajo de Teclado' },
  { value: 'MACRO', label: 'Macro' },
];

const ICON_OPTIONS = [
  { value: 'play', label: '▶' },
  { value: 'pause', label: '⏸' },
  { value: 'stop', label: '⏹' },
  { value: 'mic', label: '🎤' },
  { value: 'cam', label: '📷' },
  { value: 'scene', label: '🎬' },
  { value: 'alert', label: '🔔' },
  { value: 'key', label: '⌨' },
  { value: 'star', label: '⭐' },
  { value: 'heart', label: '❤️' },
  { value: 'fire', label: '🔥' },
  { value: 'bolt', label: '⚡' },
];

const COLOR_OPTIONS = [
  { value: 'bg-red-600', label: 'Rojo' },
  { value: 'bg-orange-600', label: 'Naranja' },
  { value: 'bg-yellow-500', label: 'Amarillo' },
  { value: 'bg-green-600', label: 'Verde' },
  { value: 'bg-teal-600', label: 'Teal' },
  { value: 'bg-blue-600', label: 'Azul' },
  { value: 'bg-indigo-600', label: 'Indigo' },
  { value: 'bg-purple-600', label: 'Morado' },
  { value: 'bg-pink-600', label: 'Rosa' },
  { value: 'bg-gray-600', label: 'Gris' },
];

export default function AdminPage() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL);
  const [buttons, setButtons] = useState<Button[]>([]);
  const [selectedButtonId, setSelectedButtonId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Button>>({});
  const [isNewButton, setIsNewButton] = useState(false);
  const [obsConnected, setObsConnected] = useState(true);
  const [obsReconnecting, setObsReconnecting] = useState(false);

  useEffect(() => {
    if (lastMessage?.type === 'CONFIG_UPDATE' && lastMessage.buttons) {
      setButtons(lastMessage.buttons);
    }
    if (lastMessage?.type === 'OBS_STATE') {
      if (lastMessage.obsConnected !== undefined) {
        setObsConnected(lastMessage.obsConnected ?? true);
      }
      if (lastMessage.obsReconnecting !== undefined) {
        setObsReconnecting(lastMessage.obsReconnecting ?? false);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (status !== 'connected' && selectedButtonId) {
      handleCancel();
    }
  }, [status]);

  const handleAddButton = () => {
    setSelectedButtonId('__new__');
    setIsNewButton(true);
    setEditForm({ icon: 'play', action: 'HOTKEY', payload: '', label: '', color: 'bg-blue-600' });
  };

  const handleButtonClick = (button: Button) => {
    setSelectedButtonId(button.id);
    setIsNewButton(false);
    setEditForm({ ...button });
  };

  const handleSaveButton = () => {
    if (!selectedButtonId) return;

    let newButtons: Button[];
    if (isNewButton) {
      const newButton: Button = {
        id: `btn_${Date.now()}`,
        icon: editForm.icon || 'play',
        action: editForm.action || 'HOTKEY',
        payload: editForm.payload || '',
        label: editForm.label || '',
        color: editForm.color || 'bg-blue-600',
      };
      newButtons = [...buttons, newButton];
    } else {
      newButtons = buttons.map((b) =>
        b.id === selectedButtonId
          ? {
              ...b,
              icon: editForm.icon || b.icon,
              action: editForm.action || b.action,
              payload: editForm.payload ?? b.payload,
              label: editForm.label ?? b.label,
              color: editForm.color ?? b.color,
            }
          : b
      );
    }
    setButtons(newButtons);
    setSelectedButtonId(null);
    setEditForm({});
    setIsNewButton(false);

    sendMessage({ type: 'CONFIG_UPDATE', buttons: newButtons });
  };

  const handleCancel = () => {
    setSelectedButtonId(null);
    setEditForm({});
    setIsNewButton(false);
  };

  const handleQuickDelete = (buttonId: string) => {
    const newButtons = buttons.filter((b) => b.id !== buttonId);
    setButtons(newButtons);
    sendMessage({ type: 'CONFIG_UPDATE', buttons: newButtons });
  };

  const handleDeleteButton = () => {
    if (!selectedButtonId) return;

    const newButtons = buttons.filter((b) => b.id !== selectedButtonId);
    setButtons(newButtons);
    setSelectedButtonId(null);
    setEditForm({});
    setIsNewButton(false);

    sendMessage({ type: 'CONFIG_UPDATE', buttons: newButtons });
  };

  const shouldShowOverlay = status !== 'connected' || (obsReconnecting && !obsConnected);

  return (
    <div className="min-h-screen bg-deckstream-dark text-white p-6">
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
            {status !== 'connected' ? 'Esperando conexion con el servidor...' : 'Esperando conexion con OBS...'}
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-deckstream-primary mb-2">
            ospinajuanp-macroboard Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              status === 'connected' ? 'bg-green-600' :
              status === 'connecting' ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              {status === 'connected' ? 'Conectado' :
               status === 'connecting' ? 'Conectando...' : 'Desconectado'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              obsConnected ? 'bg-green-600/50' : 'bg-red-600/50'
            }`}>
              OBS: {obsConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </header>

        <div className={`mb-6 bg-gray-800 rounded-xl p-6 ${!obsConnected ? 'opacity-50 pointer-events-none select-none' : ''}`}>
          {!obsConnected && (
            <div className="text-center text-gray-400 py-4 mb-4">
              OBS no esta conectado. Reconectando...
            </div>
          )}
          <h2 className="text-xl font-semibold mb-4">Botones</h2>
          <div className="flex flex-wrap gap-3">
            {buttons.map((button) => {
              const iconOption = ICON_OPTIONS.find(i => i.value === button.icon);
              return (
                <div key={button.id} className="relative group">
                  <button
                    onClick={() => handleButtonClick(button)}
                    className={`
                      w-16 h-16 rounded-xl flex flex-col items-center justify-center
                      transition-all duration-150 font-medium text-xl
                      ${button.color || 'bg-deckstream-primary'}
                      ${selectedButtonId === button.id ? 'ring-4 ring-white' : ''}
                    `}
                  >
                    <span>{iconOption?.label || '?'}</span>
                    {button.label && <span className="text-xs mt-0.5">{button.label}</span>}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuickDelete(button.id); }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            <button
              onClick={handleAddButton}
              className="w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-150 font-medium text-xl border-2 border-dashed border-gray-500 text-gray-500 hover:border-deckstream-primary hover:text-deckstream-primary"
            >
              <span>+</span>
            </button>
          </div>
        </div>

        {selectedButtonId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCancel}>
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold mb-4">{isNewButton ? 'Nuevo Boton' : 'Editar Boton'}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Icono</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon.value}
                        onClick={() => setEditForm({ ...editForm, icon: icon.value })}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-2xl
                          ${editForm.icon === icon.value ? `${editForm.color || 'bg-deckstream-primary'} ring-2 ring-white` : 'bg-gray-700'}
                        `}
                      >
                        {icon.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setEditForm({ ...editForm, color: color.value })}
                        className={`
                          aspect-square rounded-lg ${color.value}
                          ${editForm.color === color.value ? 'ring-2 ring-white' : ''}
                        `}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tipo de Accion</label>
                  <select
                    value={editForm.action || 'HOTKEY'}
                    onChange={(e) => setEditForm({ ...editForm, action: e.target.value as ActionType })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    {ACTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {editForm.action === 'OBS_SCENE' ? 'Nombre de Escena' :
                     editForm.action === 'HOTKEY' ? 'Presiona las teclas...' :
                     'Macro'}
                  </label>
                  {editForm.action === 'HOTKEY' ? (
                    <KeyboardRecorder
                      value={editForm.payload || ''}
                      onChange={(keys) => setEditForm({ ...editForm, payload: keys })}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editForm.payload || ''}
                      onChange={(e) => setEditForm({ ...editForm, payload: e.target.value })}
                      placeholder={
                        editForm.action === 'OBS_SCENE' ? 'Just Chatting' :
                        'Nombre del macro'
                      }
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Etiqueta (opcional)</label>
                  <input
                    type="text"
                    value={editForm.label || ''}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    placeholder="Nombre corto"
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveButton}
                  className="flex-1 bg-deckstream-primary hover:bg-deckstream-secondary text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={handleDeleteButton}
                  className="px-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Botones Configurados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Icono</th>
                  <th className="pb-2">Tipo</th>
                  <th className="pb-2">Accion</th>
                  <th className="pb-2">Etiqueta</th>
                </tr>
              </thead>
              <tbody>
                {buttons.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No hay botones configurados.
                    </td>
                  </tr>
                ) : (
                  buttons.map((button) => (
                    <tr key={button.id} className="border-b border-gray-700">
                      <td className="py-3">{ICON_OPTIONS.find(i => i.value === button.icon)?.label || '?'}</td>
                      <td className="py-3">{ACTION_TYPES.find(t => t.value === button.action)?.label}</td>
                      <td className="py-3 font-mono text-sm">{button.payload}</td>
                      <td className="py-3">{button.label || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KeyboardRecorderProps {
  value: string;
  onChange: (keys: string) => void;
}

function KeyboardRecorder({ value, onChange }: KeyboardRecorderProps) {
  const [recording, setRecording] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!recording) return;
    e.preventDefault();

    const keys: string[] = [];
    if (e.ctrlKey) keys.push('ctrl');
    if (e.shiftKey) keys.push('shift');
    if (e.altKey) keys.push('alt');

    const key = e.key.toUpperCase();
    if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(key)) {
      keys.push(key);
    }

    if (keys.length > 0) {
      onChange(keys.join('+'));
    }
  };

  return (
    <div
      tabIndex={0}
      onFocus={() => setRecording(true)}
      onBlur={() => setRecording(false)}
      onKeyDown={handleKeyDown}
      className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-white text-center cursor-text font-mono ${
        recording ? 'ring-2 ring-deckstream-primary' : ''
      }`}
    >
      {value || (recording ? 'Presiona las teclas...' : 'Click para grabar')}
    </div>
  );
}
