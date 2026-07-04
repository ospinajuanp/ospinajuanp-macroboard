import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        title: 'ospinajuanp-macroboard Admin',
        connected: 'Connected',
        connecting: 'Connecting...',
        disconnected: 'Disconnected',
        obsConnected: 'OBS: Connected',
        obsDisconnected: 'OBS: Disconnected',
        loadScenes: 'Load Scenes',
        obsNotConnected: 'OBS is not connected. Reconnecting...',
        buttons: 'Buttons',
        newButton: 'New Button',
        editButton: 'Edit Button',
        icon: 'Icon',
        selectIcon: 'Select Icon',
        color: 'Color',
        actionType: 'Action Type',
        sceneName: 'Scene Name',
        selectKey: 'Select key or combination',
        macro: 'Macro',
        macroName: 'Macro name',
        label: 'Label (optional)',
        shortName: 'Short name',
        save: 'Save',
        delete: 'Delete',
        cancel: 'Cancel',
        configuredButtons: 'Configured Buttons',
        type: 'Type',
        action: 'Action',
        noButtonsConfigured: 'No buttons configured.',
      },
    },
    es: {
      translation: {
        title: 'ospinajuanp-macroboard Admin',
        connected: 'Conectado',
        connecting: 'Conectando...',
        disconnected: 'Desconectado',
        obsConnected: 'OBS: Conectado',
        obsDisconnected: 'OBS: Desconectado',
        loadScenes: 'Cargar Escenas',
        obsNotConnected: 'OBS no esta conectado. Reconectando...',
        buttons: 'Botones',
        newButton: 'Nuevo Boton',
        editButton: 'Editar Boton',
        icon: 'Icono',
        selectIcon: 'Seleccionar Icono',
        color: 'Color',
        actionType: 'Tipo de Accion',
        sceneName: 'Nombre de Escena',
        selectKey: 'Selecciona la tecla o combinacion',
        macro: 'Macro',
        macroName: 'Nombre del macro',
        label: 'Etiqueta (opcional)',
        shortName: 'Nombre corto',
        save: 'Guardar',
        delete: 'Eliminar',
        cancel: 'Cancelar',
        configuredButtons: 'Botones Configurados',
        type: 'Tipo',
        action: 'Accion',
        noButtonsConfigured: 'No hay botones configurados.',
      },
    },
  },
  lng: savedLanguage || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});

export default i18n;
