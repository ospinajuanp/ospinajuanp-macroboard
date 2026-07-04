import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    es: {
      translation: {
        title: 'ospinajuanp-macroboard',
        connecting: 'Conectando...',
        connected: 'Conectado',
        disconnected: 'Desconectado',
        reconnecting: 'Reconectando...',
      },
    },
    en: {
      translation: {
        title: 'ospinajuanp-macroboard',
        connecting: 'Connecting...',
        connected: 'Connected',
        disconnected: 'Disconnected',
        reconnecting: 'Reconnecting...',
      },
    },
  },
  lng: 'es',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
