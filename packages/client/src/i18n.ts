import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        title: 'ospinajuanp-macroboard',
        connecting: 'Connecting...',
        connected: 'Connected',
        disconnected: 'Disconnected',
        reconnecting: 'Reconnecting...',
        waitingServer: 'Waiting for server connection...',
        waitingOBS: 'Waiting for OBS connection...',
        recording: 'Recording',
        rec: 'Rec',
        live: 'Live',
        stream: 'Stream',
        control: 'Control',
        scenes: 'Scenes',
        others: 'Others',
        page: 'Page',
        language: 'Language',
        english: 'English',
        spanish: 'Spanish',
      },
    },
    es: {
      translation: {
        title: 'ospinajuanp-macroboard',
        connecting: 'Conectando...',
        connected: 'Conectado',
        disconnected: 'Desconectado',
        reconnecting: 'Reconectando...',
        waitingServer: 'Esperando conexion con el servidor...',
        waitingOBS: 'Esperando conexion con OBS...',
        recording: 'Grabando',
        rec: 'Rec',
        live: 'En Vivo',
        stream: 'Stream',
        control: 'Control',
        scenes: 'Escenas',
        others: 'Otros',
        page: 'Pagina',
        language: 'Idioma',
        english: 'Ingles',
        spanish: 'Espanol',
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
