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
  "grid": { "rows": 4, "columns": 3 },
  "buttons": {},
  "obs": {
    "host": "localhost",
    "port": 4455,
    "password": "Cualquiera1234"
  }
}
```

Habilitar WebSocket en OBS: **Editar → Configuración → WebSocket → Habilitar servidor WebSocket**

## Ejecutar

```bash
pnpm dev
```

- **Admin**: http://localhost:3000/admin
- **Cliente móvil**: http://localhost:3000 (o escanear QR en terminal)
- **Cliente PWA**: http://localhost:3001

## Estructura

```
packages/
├── server/    # Backend (puerto 3000)
├── admin/     # Panel admin Next.js (puerto 3000/admin)
├── client/    # Cliente móvil PWA (puerto 3001)
└── shared/    # Tipos compartidos
```

## Scripts

```bash
pnpm dev          # Todo en modo desarrollo
pnpm build        # Construir todo
pnpm clean        # Limpiar build y config.json
pnpm lint         # Linting
pnpm typecheck    # TypeScript
```
