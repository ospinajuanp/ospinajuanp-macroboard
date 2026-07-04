# ospinajuanp-macroboard

Touch controller for streamers with OBS integration.

## Requirements

- Node.js 18+
- pnpm
- OBS Studio 28+ with WebSocket enabled
- Windows 10/11

## Installation

```bash
git clone <repo-url>
cd ospinajuanp-macroboard
pnpm install
```

## Configuration

Create `packages/server/config.json`:

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

Enable WebSocket in OBS: **Edit → Settings → WebSocket → Enable WebSocket server**

## Run

```bash
pnpm dev
```

- **Admin**: http://localhost:3000/admin
- **Mobile Client**: http://localhost:3000 (or scan QR in terminal)
- **PWA Client**: http://localhost:3001

## Structure

```
packages/
├── server/    # Backend (port 3000)
├── admin/     # Admin panel Next.js (port 3000/admin)
├── client/    # Mobile PWA (port 3001)
└── shared/    # Shared types
```

## Scripts

```bash
pnpm dev          # All packages in dev mode
pnpm build        # Build all
pnpm clean        # Clean build and config.json
pnpm lint         # Lint
pnpm typecheck    # TypeScript
```
