# @ospinajuanp-macroboard/landing

Public landing page and documentation for ospinajuanp-macroboard.

## Vercel Configuration

This package is designed to be deployed on Vercel. When selected in Vercel, the build command will automatically detect it as a Next.js project.

### Manual Configuration

If you need to configure manually in Vercel:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `packages/landing` |
| **Build Command** | `pnpm build` |
| **Output Directory** | `.next` (default) |

### Environment Variables

No environment variables are required for the landing page.

### Deploy Steps

1. Connect your GitHub repository to Vercel
2. Select the `landing` framework
3. Set Root Directory to `packages/landing`
4. Deploy

Or use the Vercel CLI:

```bash
vercel --prod
```

## Development

```bash
pnpm dev
```

Opens on http://localhost:3000

## Build

```bash
pnpm build
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript checks |
