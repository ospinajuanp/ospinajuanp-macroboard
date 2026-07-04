# ospinajuanp-macroboard

Controlador Virtual de Macros y Escenas para Streamers.

Transforma cualquier dispositivo móvil en un panel de control táctil y personalizable para transmisiones en vivo y automatización de macros.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Desarrollo](#desarrollo)
- [Comandos Disponibles](#comandos-disponibles)
- [Documentación de Librerías](#documentación-de-librerías)
- [Arquitectura](#arquitectura)
- [FAQ](#faq)
- [Licencia](#licencia)

## Descripción

ospinajuanp-macroboard es un software modular micro-SaaS auto-alojado diseñado para Windows. Su propósito es transformar cualquier dispositivo móvil (smartphone o tablet) en un panel de-control táctil y personalizable para transmisiones en vivo.

El sistema se distribuye como un único archivo ejecutable (.exe) portátil, sin necesidad de instalar Node.js o dependencias adicionales.

## Características

- **Zero Setup**: No requiere instalación de Node.js ni librerías adicionales
- **Cuadrícula Dinámica**: Definición de layouts personalizados (ej. 3×2, 4×3, 5×5)
- **Mapeo Individual**: Cada botón configurable con iconos y acciones
- **Comunicación en Tiempo Real**: WebSockets sobre LAN
- **Integración OBS**: Control de escenas via obs-websocket
- **Macros de Teclado**: Simulación de hotkeys globales via robotjs
- **Código QR**: Emparejamiento instantáneo con dispositivos móviles
- **PWA Móvil**: Interfaz responsiva optimizada para pantallas táctiles
- **Soporte Multilingüe**: Español e Inglés

## Requisitos

### Sistema Operativo

- Windows 10/11 (64-bit)

### Software Requerido

| Software | Versión | Descarga |
|----------|---------|----------|
| Node.js | 24+ | [nodejs.org](https://nodejs.org/) |
| pnpm | latest | [pnpm.io](https://pnpm.io/installation) |
| Visual Studio Build Tools | 2022 | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) |
| OBS Studio | 28+ | [obsproject.com](https://obsproject.com/) |

### Visual Studio Build Tools (para robotjs)

1. Descargar desde: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Instalar con las siguientes cargas de trabajo:
   - **Desarrollo de escritorio con C++**
   - **SDK de Windows (Windows SDK)**
   - **Compiladores MSVC (Microsoft Visual C++)**
3. Reiniciar el sistema después de la instalación

### OBS Studio - WebSocket Integrado (OBS 28+)

**A partir de OBS Studio 28 (2022), WebSocket viene incluido nativamente.**

1. Abrir OBS Studio
2. Ir a: **Editar → Configuración → WebSocket**
3. Marcar **"Habilitar servidor WebSocket"**
4. Establecer una contraseña y anotar el puerto (por defecto `4455`)
5. Hacer clic en **"Mostrar conexiones"** para verificar

**Nota sobre la contraseña**: La contraseña de OBS WebSocket es solo un PIN de conexión local entre ospinajuanp-macroboard y OBS en tu PC. No es una contraseña de cuenta ni requiere requisitos especiales de complejidad.

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd ospinajuanp-macroboard
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configuración Inicial

Crear archivo de configuración en `packages/server/config.json`:

```json
{
  "grid": {
    "rows": 4,
    "columns": 3
  },
  "buttons": {},
  "obs": {
    "host": "localhost",
    "port": 4455,
    "password": "tu-contraseña-obs"
  }
}
```

**Importante**: El valor de `password` debe coincidir exactamente con la contraseña que configuraste en OBS Studio (**Editar → Configuración → WebSocket**).

### 4. Configurar IDE (VSCode)

Extensiones recomendadas:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### 5. Configuración OBS

1. Abrir OBS Studio
2. Ir a: Editar → Configuración → WebSocket
3. Habilitar "Habilitar servidor WebSocket"
4. Configurar puerto y contraseña
5. Actualizar `config.json` con los valores

## Estructura del Proyecto

```
ospinajuanp-macroboard/
├── pnpm-workspace.yaml       # Configuración de workspaces
├── package.json              # Paquete root
├── README.md                  # Este archivo
├── packages/
│   ├── shared/               # Tipos y constantes compartidas
│   │   ├── package.json
│   │   └── src/
│   │       └── index.ts
│   ├── server/               # Backend Node.js
│   │   ├── package.json
│   │   └── src/
│   │       └── index.ts
│   ├── admin/                # Panel de administración (Next.js)
│   │   ├── package.json
│   │   └── src/
│   │       └── pages/
│   └── client/               # Cliente móvil PWA (Vite + React)
│       ├── package.json
│       └── src/
│           ├── App.tsx
│           └── main.tsx
```

## Desarrollo

### Scripts Disponibles

Desde la raíz del proyecto:

```bash
# Instalar todas las dependencias
pnpm install

# Construir todos los paquetes
pnpm build

# Desarrollo - todos los paquetes
pnpm dev

# Desarrollo - paquete específico
pnpm --filter @ospinajuanp-macroboard/server dev
pnpm --filter @ospinajuanp-macroboard/admin dev
pnpm --filter @ospinajuanp-macroboard/client dev

# Linting
pnpm lint

# Typecheck
pnpm typecheck
```

### Puertos por Defecto

| Servicio | Puerto | URL |
|----------|--------|-----|
| Server | 3000 | http://localhost:3000 |
| Admin | 3000 | http://localhost:3000/admin |
| Client (PWA) | 3001 | http://localhost:3001 |

### Emparejamiento con Dispositivo Móvil

1. Iniciar el servidor: `pnpm --filter @ospinajuanp-macroboard/server dev`
2. Abrir navegador en el móvil conectado a la misma red LAN
3. Escanear el código QR mostrado en la terminal
4. O acceder manualmente a `http://<IP-DE-LA-PC>:3000`

## Comandos Disponibles

### Desarrollo

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Iniciar todos los paquetes en modo desarrollo |
| `pnpm build` | Construir todos los paquetes para producción |
| `pnpm build:server` | Construir solo el servidor |
| `pnpm build:admin` | Construir solo el admin |
| `pnpm build:client` | Construir solo el cliente |

### Empaquetado

```bash
# Empaquetar para Windows (requiere pkg)
pnpm package

# El ejecutable se generará en packages/server/dist/
```

## Documentación de Librerías

### Core

| Librería | Versión | Documentación |
|----------|---------|---------------|
| [Node.js](https://nodejs.org/) | 18+ | [Docs](https://nodejs.org/docs/) |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | [Docs](https://www.typescriptlang.org/docs/) |
| [pnpm](https://pnpm.io/) | 8.x | [Docs](https://pnpm.io/docs/) |

### Backend (Server)

| Librería | Versión | npm | Documentación |
|----------|---------|-----|---------------|
| [Fastify](https://www.fastify.dev/) | 4.x | [npm](https://www.npmjs.com/package/fastify) | [Docs](https://fastify.dev/docs/) |
| [ws](https://github.com/websockets/ws) | 8.x | [npm](https://www.npmjs.com/package/ws) | [Docs](https://github.com/websockets/ws) |
| [obs-websocket-js](https://github.com/obs-websocket-community-projects/obs-websocket-js) | 5.x | [npm](https://www.npmjs.com/package/obs-websocket-js) | [Docs](https://github.com/obs-websocket-community-projects/obs-websocket-js) |
| [robotjs](https://github.com/windows-robotjs/robotjs) | 0.6.x | [npm](https://www.npmjs.com/package/robotjs) | [Docs](https://github.com/windows-robotjs/robotjs) |
| [qrcode](https://github.com/soldair/node-qrcode) | 1.x | [npm](https://www.npmjs.com/package/qrcode) | [Docs](https://github.com/soldair/node-qrcode) |
| [pkg](https://github.com/vercel/pkg) | 5.x | [npm](https://www.npmjs.com/package/pkg) | [Docs](https://github.com/vercel/pkg) |

### Frontend

| Librería | Versión | npm | Documentación |
|----------|---------|-----|---------------|
| [Next.js](https://nextjs.org/) | 14.x | [npm](https://www.npmjs.com/package/next) | [Docs](https://nextjs.org/docs) |
| [React](https://react.dev/) | 18.x | [npm](https://www.npmjs.com/package/react) | [Docs](https://react.dev/learn) |
| [Vite](https://vitejs.dev/) | 5.x | [npm](https://www.npmjs.com/package/vite) | [Docs](https://vitejs.dev/guide/) |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | [npm](https://www.npmjs.com/package/tailwindcss) | [Docs](https://tailwindcss.com/docs) |
| [i18next](https://www.i18next.com/) | 23.x | [npm](https://www.npmjs.com/package/i18next) | [Docs](https://www.i18next.com/) |

### Desarrollo

| Librería | Versión | Documentación |
|----------|---------|---------------|
| [ESLint](https://eslint.org/) | 8.x | [Docs](https://eslint.org/docs/) |
| [Prettier](https://prettier.io/) | 3.x | [Docs](https://prettier.io/docs/) |

## Arquitectura

### Flujo de Comunicación

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Móvil     │◄──────►│   Server    │◄──────►│     OBS     │
│  (Cliente)  │  WS    │  (Node.js)  │  WS    │   Studio    │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │  Admin UI   │
                       │  (Next.js)  │
                       └─────────────┘
```

### Modelo de Datos

#### Configuración del Grid

```typescript
interface GridConfig {
  rows: number;
  columns: number;
}
```

#### Botón

```typescript
interface Button {
  id: string;
  row: number;
  column: number;
  icon: string;
  action: 'OBS_SCENE' | 'HOTKEY' | 'MACRO';
  payload: string;
  label?: string;
}
```

#### Acción OBS

```typescript
interface OBSAction {
  type: 'OBS_SCENE';
  sceneName: string;
}
```

#### Acción Hotkey

```typescript
interface HotkeyAction {
  type: 'HOTKEY';
  keys: string[]; // ej: ['ctrl', 'shift', 'F1']
}
```

### Protocolo WebSocket

#### Cliente → Servidor

```typescript
// Disparar acción
{
  "type": "TRIGGER",
  "buttonId": "btn_0_1",
  "action": "OBS_SCENE",
  "payload": "Just Chatting"
}

// Actualizar estado del grid
{
  "type": "CONFIG_UPDATE",
  "grid": { "rows": 4, "columns": 3 },
  "buttons": [...]
}
```

#### Servidor → Cliente

```typescript
// Confirmación de acción
{
  "type": "ACTION_ACK",
  "buttonId": "btn_0_1",
  "success": true
}

// Notificación de cambio de estado OBS
{
  "type": "OBS_STATE",
  "micMuted": true,
  "recording": true,
  "currentScene": "Just Chatting"
}
```

## FAQ

### P: ¿Necesito instalar Node.js para ejecutar el programa?

R: No. Una vez empaquetado con `pkg`, el programa se distribuye como un ejecutable portable que incluye Node.js.

### P: ¿Puedo usar ospinajuanp-macroboard en Mac o Linux?

R: El objetivo principal es Windows. Aunque el código podría adaptarse, algunas librerías como robotjs son específicas de Windows.

### P: ¿Cómo obtengo la IP de mi PC?

R: El servidor detecta automáticamente la IP local y muestra un código QR. También puedes escribir `ipconfig` en CMD para encontrarla.

### P: ¿El programa funciona sin conexión a internet?

R: Sí. Todo funciona en tu red local (LAN). No requiere conexión externa.

### P: ¿Necesito una contraseña especial para OBS WebSocket?

R: No. La contraseña de OBS WebSocket es solo un PIN local que tú eliges. Puede ser simple (ej: "stream123") ya que solo conecta ospinajuanp-macroboard con OBS en tu propia PC.

### P: ¿Cómo actualizo la configuración del grid?

R: Accede al panel de administración en `http://localhost:3000/admin` desde tu navegador.

## Troubleshooting

### robotjs no compila

1. Asegúrate de tener Visual Studio Build Tools instalado
2. Ejecuta: `npm rebuild robotjs`
3. Verifica que el path de MSVC esté en tu entorno

### OBS WebSocket no conecta

1. Verifica que OBS Studio tenga WebSocket habilitado (**Editar → Configuración → WebSocket**)
2. Confirma que el puerto (por defecto `4455`) y contraseña en `config.json` coincidan exactamente
3. Asegúrate de que OBS Studio esté corriendo
4. Si usas OBS 27 o anterior, necesitas [descargar el plugin externo](https://obsproject.com/forum-resources/)

### El código QR no escanea

1. Asegúrate de estar en la misma red LAN (WiFi)
2. Verifica el firewall de Windows
3. Prueba accediendo directamente con la IP

## Licencia

MIT License

---

¿Problemas? Abre un issue en el repositorio.
