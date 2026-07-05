import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        nav: {
          home: 'Home',
          docs: 'Documentation',
          contribute: 'Contribute',
        },
        hero: {
          title: 'ospinajuanp-macroboard',
          subtitle: 'Virtual Macro Controller for Streamers',
          description: 'Control OBS scenes, mute audio, trigger hotkeys and macros from your mobile device. Designed for streamers who want a physical controller experience without the hardware.',
          cta: 'Get Started',
          ctaSecondary: 'View on GitHub',
        },
        features: {
          title: 'Features',
          obs: {
            title: 'OBS Integration',
            description: 'Control scenes, mute sources, start/stop recording and streaming directly from your phone.',
          },
          hotkeys: {
            title: 'Hotkey Support',
            description: 'Trigger any keyboard shortcut or combination. Perfect for quick scene switches.',
          },
          macros: {
            title: 'Custom Macros',
            description: 'Create sequences of actions to automate your streaming workflow.',
          },
          mobile: {
            title: 'Mobile PWA',
            description: 'Access your controls from any device with a responsive web interface.',
          },
          qr: {
            title: 'QR Code Access',
            description: 'Share a QR code to let others connect without installing anything.',
          },
          bilingual: {
            title: 'Bilingual Support',
            description: 'Available in English and Spanish. More languages coming soon.',
          },
        },
        sections: {
          howItWorks: 'How It Works',
          screenshotAlt: 'Admin panel screenshot',
          clientAlt: 'Mobile client screenshot',
        },
        footer: {
          description: 'Open source project for streamers.',
          builtWith: 'Built with Next.js, Fastify, and OBS WebSocket.',
        },
      },
    },
    es: {
      translation: {
        nav: {
          home: 'Inicio',
          docs: 'Documentación',
          contribute: 'Contribuir',
        },
        hero: {
          title: 'ospinajuanp-macroboard',
          subtitle: 'Controlador Virtual de Macros para Streamers',
          description: 'Controla escenas de OBS, silenciar audio, activar hotkeys y macros desde tu móvil. Diseñado para streamers que quieren la experiencia de un controlador físico sin el hardware.',
          cta: 'Comenzar',
          ctaSecondary: 'Ver en GitHub',
        },
        features: {
          title: 'Características',
          obs: {
            title: 'Integración OBS',
            description: 'Controla escenas, silenciar fuentes, iniciar/detener grabación y streaming directamente desde tu teléfono.',
          },
          hotkeys: {
            title: 'Soporte de Hotkeys',
            description: 'Activa cualquier atajo de teclado o combinación. Perfecto para cambios rápidos de escena.',
          },
          macros: {
            title: 'Macros Personalizados',
            description: 'Crea secuencias de acciones para automatizar tu flujo de trabajo de streaming.',
          },
          mobile: {
            title: 'PWA Móvil',
            description: 'Accede a tus controles desde cualquier dispositivo con una interfaz web responsiva.',
          },
          qr: {
            title: 'Acceso por QR',
            description: 'Comparte un código QR para que otros se conecten sin instalar nada.',
          },
          bilingual: {
            title: 'Soporte Bilingüe',
            description: 'Disponible en inglés y español. Más idiomas próximamente.',
          },
        },
        sections: {
          howItWorks: 'Cómo Funciona',
          screenshotAlt: 'Captura del panel de administración',
          clientAlt: 'Captura del cliente móvil',
        },
        footer: {
          description: 'Proyecto de código abierto para streamers.',
          builtWith: 'Construido con Next.js, Fastify, y OBS WebSocket.',
        },
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
