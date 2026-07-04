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
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [obsConnected, setObsConnected] = useState(true);
  const [obsReconnecting, setObsReconnecting] = useState(false);

  useEffect(() => {
    if (lastMessage?.type === 'CONFIG_UPDATE' && lastMessage.buttons) {
      const userButtons = lastMessage.buttons.filter((b: Button) => b.id.startsWith('btn_'));
      setButtons(userButtons);
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
    setShowIconPicker(false);
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
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-4 px-2" onClick={handleCancel}>
            <div className="bg-gray-800 rounded-xl p-4 w-full max-w-md my-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{isNewButton ? 'Nuevo Boton' : 'Editar Boton'}</h3>
                <button onClick={handleCancel} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Icono</label>
                  <button
                    onClick={() => setShowIconPicker(true)}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-3 text-left"
                  >
                    <span className="text-2xl">{ICON_OPTIONS.find(i => i.value === editForm.icon)?.label || '?'}</span>
                    <span className="text-gray-300">{ICON_OPTIONS.find(i => i.value === editForm.icon)?.label || 'Seleccionar icono'}</span>
                  </button>
                </div>

                {showIconPicker && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]" onClick={() => setShowIconPicker(false)}>
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Seleccionar Icono</h4>
                        <button onClick={() => setShowIconPicker(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                      </div>
                      <div className="grid grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-2">
                        {ICON_OPTIONS.map((icon) => (
                          <button
                            key={icon.value}
                            onClick={() => {
                              setEditForm({ ...editForm, icon: icon.value });
                              setShowIconPicker(false);
                            }}
                            className={`
                              aspect-square rounded-xl flex flex-col items-center justify-center text-3xl transition-all
                              ${editForm.icon === icon.value ? `${editForm.color || 'bg-deckstream-primary'} ring-2 ring-white scale-110` : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'}
                            `}
                          >
                            <span>{icon.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setEditForm({ ...editForm, color: color.value })}
                        className={`
                          h-10 rounded-lg ${color.value}
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
                     editForm.action === 'HOTKEY' ? 'Selecciona la tecla o combinacion' :
                     'Macro'}
                  </label>
                  {editForm.action === 'HOTKEY' ? (
                    <KeyboardPicker
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

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveButton}
                  className="flex-1 bg-deckstream-primary hover:bg-deckstream-secondary text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={handleDeleteButton}
                  className="px-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 rounded-lg transition-colors"
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

interface KeyboardPickerProps {
  value: string;
  onChange: (keys: string) => void;
}

function KeyboardPicker({ value, onChange }: KeyboardPickerProps) {
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>(value ? value.split('+') : []);
  const [isMinimized, setIsMinimized] = React.useState(false);

  const modifiers = [
    { key: 'ctrl', label: 'Ctrl' },
    { key: 'shift', label: 'Shift' },
    { key: 'alt', label: 'Alt' },
  ];

  const functionKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];

  const letters = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const specialKeys = [
    { key: 'escape', label: 'Esc' },
    { key: 'tab', label: 'Tab' },
    { key: 'space', label: 'Espacio' },
    { key: 'enter', label: 'Enter' },
    { key: 'backspace', label: 'Borrar' },
    { key: 'delete', label: 'Del' },
    { key: 'home', label: 'Home' },
    { key: 'end', label: 'End' },
    { key: 'pageup', label: 'PgUp' },
    { key: 'pagedown', label: 'PgDn' },
    { key: 'insert', label: 'Ins' },
  ];

  const directionKeys = [
    { key: 'up', label: '↑' },
    { key: 'down', label: '↓' },
    { key: 'left', label: '←' },
    { key: 'right', label: '→' },
  ];

  const toggleKey = (key: string) => {
    const newKeys = selectedKeys.includes(key)
      ? selectedKeys.filter(k => k !== key)
      : [...selectedKeys, key];
    setSelectedKeys(newKeys);
    onChange(newKeys.join('+'));
  };

  const isSelected = (key: string) => selectedKeys.includes(key);

  const clearAll = () => {
    setSelectedKeys([]);
    onChange('');
  };

  if (isMinimized) {
    return (
      <div className="bg-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Tecla seleccionada:</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-xs text-deckstream-primary hover:text-deckstream-secondary"
          >
            Expandir
          </button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {selectedKeys.length === 0 ? (
            <span className="text-gray-500 text-sm">Ninguna</span>
          ) : (
            selectedKeys.map(key => (
              <span key={key} className="px-2 py-1 bg-deckstream-primary rounded text-xs font-mono">
                {key.toUpperCase()}
              </span>
            ))
          )}
        </div>
        <button
          onClick={clearAll}
          className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 rounded-lg transition-colors text-xs"
        >
          Borrar Todo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Seleccionado:</span>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-xs text-deckstream-primary hover:text-deckstream-secondary"
        >
          Minimizar
        </button>
      </div>
      <div className="flex gap-1 flex-wrap">
        {selectedKeys.length === 0 ? (
          <span className="text-gray-500 text-sm">Ninguna</span>
        ) : (
          selectedKeys.map(key => (
            <span key={key} className="px-2 py-1 bg-deckstream-primary rounded text-xs font-mono">
              {key.toUpperCase()}
            </span>
          ))
        )}
      </div>

      <div className="border-t border-gray-600 pt-3">
        <div className="text-xs text-gray-400 mb-2">Modificadores</div>
        <div className="flex gap-1 flex-wrap">
          {modifiers.map(mod => (
            <button
              key={mod.key}
              onClick={() => toggleKey(mod.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected(mod.key)
                  ? 'bg-deckstream-primary text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {mod.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-600 pt-3">
        <div className="text-xs text-gray-400 mb-2">Teclas de Funcion</div>
        <div className="flex gap-1 flex-wrap">
          {functionKeys.map(key => (
            <button
              key={key}
              onClick={() => toggleKey(key)}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                isSelected(key)
                  ? 'bg-deckstream-primary text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-600 pt-3">
        <div className="text-xs text-gray-400 mb-2">Letras</div>
        <div className="flex gap-1 flex-wrap">
          {letters.map(key => (
            <button
              key={key}
              onClick={() => toggleKey(key)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                isSelected(key)
                  ? 'bg-deckstream-primary text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-600 pt-3">
        <div className="text-xs text-gray-400 mb-2">Numeros</div>
        <div className="flex gap-1 flex-wrap">
          {numbers.map(key => (
            <button
              key={key}
              onClick={() => toggleKey(key)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                isSelected(key)
                  ? 'bg-deckstream-primary text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-600 pt-3">
        <div className="text-xs text-gray-400 mb-2">Especiales</div>
        <div className="flex gap-1 flex-wrap">
          {specialKeys.map(key => (
            <button
              key={key.key}
              onClick={() => toggleKey(key.key)}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                isSelected(key.key)
                  ? 'bg-deckstream-primary text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-600 pt-3">
        <div className="text-xs text-gray-400 mb-2">Direccion</div>
        <div className="flex gap-1 flex-wrap">
          {directionKeys.map(key => (
            <button
              key={key.key}
              onClick={() => toggleKey(key.key)}
              className={`w-10 h-10 rounded text-lg font-medium transition-colors flex items-center justify-center ${
                isSelected(key.key)
                  ? 'bg-deckstream-primary text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-600 pt-3 flex gap-2">
        <button
          onClick={clearAll}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
        >
          Borrar Todo
        </button>
      </div>
    </div>
  );
}
