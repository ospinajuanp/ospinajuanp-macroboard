import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { GridConfig, Button, ActionType, WSClientMessage } from '@ospinajuanp-macroboard/shared';

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

function generateButtonId(row: number, column: number): string {
  return `btn_${row}_${column}`;
}

export default function AdminPage() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL);
  const [rows, setRows] = useState(4);
  const [columns, setColumns] = useState(3);
  const [buttons, setButtons] = useState<Record<string, Button>>({});
  const [selectedButton, setSelectedButton] = useState<{ row: number; column: number } | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [editForm, setEditForm] = useState<Partial<Button>>({});

  useEffect(() => {
    if (lastMessage?.type === 'CONFIG_UPDATE' && lastMessage.grid && lastMessage.buttons) {
      setRows(lastMessage.grid.rows);
      setColumns(lastMessage.grid.columns);
      setButtons(lastMessage.buttons);
    }
  }, [lastMessage]);

  const handleGridSizeChange = () => {
    sendMessage({
      type: 'CONFIG_UPDATE',
      grid: { rows, columns },
      buttons,
    });
  };

  const handleButtonClick = (row: number, column: number) => {
    if (editMode) {
      setSelectedButton({ row, column });
      const buttonId = generateButtonId(row, column);
      const existingButton = buttons[buttonId];
      setEditForm(existingButton || { action: 'HOTKEY', payload: '' });
    }
  };

  const handleSaveButton = () => {
    if (!selectedButton) return;

    const buttonId = generateButtonId(selectedButton.row, selectedButton.column);
    const newButton: Button = {
      id: buttonId,
      row: selectedButton.row,
      column: selectedButton.column,
      icon: editForm.icon || 'play',
      action: editForm.action || 'HOTKEY',
      payload: editForm.payload || '',
      label: editForm.label,
      color: editForm.color,
    };

    const newButtons = { ...buttons, [buttonId]: newButton };
    setButtons(newButtons);
    setSelectedButton(null);
    setEditForm({});

    sendMessage({
      type: 'CONFIG_UPDATE',
      grid: { rows, columns },
      buttons: newButtons,
    });
  };

  const handleDeleteButton = () => {
    if (!selectedButton) return;

    const buttonId = generateButtonId(selectedButton.row, selectedButton.column);
    const newButtons = { ...buttons };
    delete newButtons[buttonId];
    setButtons(newButtons);
    setSelectedButton(null);
    setEditForm({});

    sendMessage({
      type: 'CONFIG_UPDATE',
      grid: { rows, columns },
      buttons: newButtons,
    });
  };

  const getButtonByPosition = (row: number, column: number): Button | undefined => {
    return buttons[generateButtonId(row, column)];
  };

  return (
    <div className="min-h-screen bg-deckstream-dark text-white p-6">
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
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editMode ? 'bg-deckstream-accent text-white' : 'bg-deckstream-primary text-white'
              }`}
            >
              {editMode ? 'Modo Vista' : 'Modo Edicion'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Configuracion del Grid</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Filas</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Columnas</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={columns}
                  onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <button
              onClick={handleGridSizeChange}
              className="w-full bg-deckstream-primary hover:bg-deckstream-secondary text-white font-medium py-2 rounded-lg transition-colors"
            >
              Aplicar Cambios
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Vista Previa del Grid</h2>
            <div
              className="grid gap-2"
              style={{ gridTemplateRows: `repeat(${rows}, 1fr)`, gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: rows * columns }).map((_, index) => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                const button = getButtonByPosition(row, col);
                const iconOption = ICON_OPTIONS.find(i => i.value === button?.icon);

                return (
                  <button
                    key={index}
                    onClick={() => handleButtonClick(row, col)}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center
                      transition-all duration-150 font-medium text-2xl
                      ${button ? button.color || 'bg-deckstream-primary' : 'bg-gray-700'}
                      ${editMode ? 'ring-2 ring-deckstream-accent' : ''}
                      ${selectedButton?.row === row && selectedButton?.column === col ? 'ring-4 ring-white' : ''}
                    `}
                  >
                    {button ? (
                      <>
                        <span className="text-2xl">{iconOption?.label || '?'}</span>
                        {button.label && <span className="text-xs mt-1">{button.label}</span>}
                      </>
                    ) : (
                      <span className="text-gray-500">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedButton && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                Editar Boton ({selectedButton.row + 1}, {selectedButton.column + 1})
              </h3>

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
                {buttons[generateButtonId(selectedButton.row, selectedButton.column)] && (
                  <button
                    onClick={handleDeleteButton}
                    className="px-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  onClick={() => { setSelectedButton(null); setEditForm({}); }}
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
                  <th className="pb-2">Posicion</th>
                  <th className="pb-2">Icono</th>
                  <th className="pb-2">Tipo</th>
                  <th className="pb-2">Accion</th>
                  <th className="pb-2">Etiqueta</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(buttons).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No hay botones configurados. Haz click en &quot;Modo Edicion&quot; para agregar botones.
                    </td>
                  </tr>
                ) : (
                  Object.values(buttons).map((button) => (
                    <tr key={button.id} className="border-b border-gray-700">
                      <td className="py-3">({button.row + 1}, {button.column + 1})</td>
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
