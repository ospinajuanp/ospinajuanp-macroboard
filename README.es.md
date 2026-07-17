# ospinajuanp-macroboard

Panel de control táctil para streamers con integración OBS.

## Requisitos

- Node.js 18+
- pnpm
- OBS Studio 28+ con WebSocket habilitado
- Windows 10/11

## Instalación

```bash
git clone <repo-url>
cd ospinajuanp-macroboard
pnpm install
```

## Configuración

Crear `packages/server/config.json`:

```json
{
  "buttons": [],
  "autoOpen": true,
  "obs": {
    "host": "localhost",
    "port": 4455,
    "password": ""
  }
}
```

> La contraseña OBS debe configurarse antes del primer arranque (no hay valor por defecto).

Habilitar WebSocket en OBS: **Editar → Configuración → WebSocket → Habilitar servidor WebSocket**

## Ejecutar

```bash
pnpm dev
```

- **Admin**: http://localhost:3000/admin
- **Cliente móvil**: http://localhost:3000/m (o escanear QR en terminal)

## Estructura

```
packages/
├── server/    # Backend (puerto 3000)
├── admin/     # Panel admin Next.js (puerto 3000/admin)
├── client/    # Cliente móvil PWA (puerto 3001)
├── landing/   # Sitio público (Vercel)
└── shared/    # Tipos compartidos e i18n
```

## Estructura interna del server

```
packages/server/src/
├── index.ts                # Bootstrap (<60 líneas)
├── app.ts                  # Factoría de Fastify + WS Manager
├── lib/
│   ├── logger.ts           # Logger estructurado sin dependencias
│   └── errors.ts           # AppError, ValidationError, etc.
├── ws/
│   ├── schemas.ts          # Zod schemas para mensajes WS
│   ├── handlers.ts         # Handlers puros por tipo de mensaje
│   └── manager.ts          # WebSocketManager (conexión, broadcast)
├── services/
│   ├── button.service.ts   # Orquestación de acciones (OBS, hotkeys)
│   └── config.service.ts   # Persistencia + validación zod
├── routes/
│   ├── api.routes.ts       # /api/status, /api/health, /api/quit
│   └── static.routes.ts    # /, /m, /admin, /assets, /_next
└── server/                 # Adaptadores de infraestructura
    ├── obs.ts              # Cliente OBS WebSocket
    ├── robot.ts            # PowerShell SendKeys (hotkeys)
    ├── network.ts          # IP local
    ├── qr.ts               # Generación de QR
    └── paths.ts            # Rutas (packaged vs dev)
```

## Scripts

```bash
pnpm dev          # Todo en modo desarrollo
pnpm build        # Construir todo
pnpm clean        # Limpiar build y config.json
pnpm lint         # Linting
pnpm typecheck    # TypeScript
```

## Licencia

Este proyecto está licenciado bajo la [Polyform Noncommercial License 1.0.0](LICENSE.md).

Eres libre de ver, fork y modificar el código para uso personal, educativo o de portafolio.
**El uso comercial no está permitido** sin un acuerdo escrito separado del autor.

(c) 2026 Juan Pablo Ospina Restrepo.
