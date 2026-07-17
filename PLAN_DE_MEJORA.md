# PLAN_DE_MEJORA — ospinajuanp-macroboard

**Arquitecto:** Senior Web Consultant
**Fecha:** 2026-07-16
**Stack:** Fastify + ws + obs-websocket-js | Next.js 14 (Pages → App Router) | Vite + React | pnpm workspaces | pkg → Node SEA

---

## Contexto y decisiones de la FASE 1

| # | Decisión | Implicación |
|---|----------|-------------|
| 1 | **SEO:** mínimo. Producto de descarga + ejecución local | Sin esfuerzo agresivo en ranking; sí metadatos básicos, sitemap, robots, OG, `lang` correcto |
| 2 | **Auth WS/API:** Shared secret (token en query/header) | Token generado al arranque, rotable, mostrado en QR junto al existente |
| 3 | **Build .exe:** Node SEA (Single Executable Apps, nativo Node 20+) | Migración completa de `pkg` a `node --experimental-sea-config` + `postject` |
| 4 | **Admin:** Migrar Pages Router → App Router | Mantener `output: 'export'`, aprovechar Metadata API y RSC |
| 5 | **i18n:** Centralizar en `@ospinajuanp-macroboard/shared/i18n` con namespaces | Un solo origen de verdad, sin duplicación entre admin/client/landing |

## Principios rectores

- **Independencia de bloques:** cada bloque puede ejecutarse en cualquier orden. Si bloque B depende conceptualmente de un archivo de A, B lo crea localmente y A lo consolidará después.
- **No regresiones:** cada bloque debe pasar `pnpm typecheck`, `pnpm lint`, y dejar `pnpm dev` funcional.
- **Trazabilidad:** cambios pequeños, commits descriptivos (recomendado pero no obligatorio), un PR por bloque.
- **Compatibilidad:** el server empaquetado debe seguir arrancando el binario con doble click.

---

## Índice de Bloques

| # | Bloque | Paquetes tocados | Esfuerzo |
|---|--------|------------------|----------|
| 1 | Arquitectura y Modularidad del Server | server, shared | M |
| 2 | Seguridad: Validación, Auth Shared Secret y Headers | server | M |
| 3 | Seguridad de Hotkeys (escape PowerShell) | server | S |
| 4 | Performance (Compresión, Cache, Bundle) | server, admin, client | M |
| 5 | SEO Mínimo + Metadata + i18n client-side → RSC-friendly | landing, shared | S |
| 6 | Accesibilidad WCAG 2.1 AA | admin, client, landing | M |
| 7 | Migración Node SEA + Admin App Router | server, admin | L |
| 8 | i18n Centralizado en Shared (namespaces) | shared, admin, client, landing | M |
| 9 | Design System Unificado y Refactor de Componentes | shared, admin, client, landing | L |
| 10 | Testing (Vitest + Playwright) | server, admin, client | L |

**Leyenda:** S = <2h · M = 2–6h · L = >6h

---

## BLOQUE 1 — Arquitectura y Modularidad del Server

### Objetivo
Eliminar el "god class" `DeckStreamServer` (300 líneas en `packages/server/src/index.ts`) y separar responsabilidades en capas claras: **bootstrap → app → routes → handlers → services → infra**. Introducir validación de mensajes WS con **zod** y tipado de errores consistente.

### Archivos afectados
- `packages/server/src/index.ts` (reescribir como bootstrap delgado)
- `packages/server/src/server/http.ts` (convertir a plugin Fastify)
- `packages/server/src/server/websocket.ts` (extraer handlers)
- `packages/server/src/server/config.ts` (tipar errores)
- `packages/server/src/server/obs.ts` (sin cambios funcionales, sólo renombrar si aporta)
- **Nuevos:**
  - `packages/server/src/app.ts` (factoría de Fastify + WS)
  - `packages/server/src/routes/api.routes.ts`
  - `packages/server/src/routes/static.routes.ts`
  - `packages/server/src/ws/handlers.ts` (handlers por tipo de mensaje)
  - `packages/server/src/ws/schemas.ts` (zod schemas)
  - `packages/server/src/services/button.service.ts`
  - `packages/server/src/services/obs.service.ts`
  - `packages/server/src/services/config.service.ts`
  - `packages/server/src/lib/logger.ts` (pino o logger estructurado básico)
  - `packages/server/src/lib/errors.ts`
- `packages/shared/src/index.ts` (añadir `DEFAULT_BUTTONS` o moverlo a shared)

### Acciones concretas
1. Crear `lib/logger.ts` con un wrapper sobre `console` que formatee `[ISO timestamp] [LEVEL] [module] message` (sin dependencia externa para no añadir bundle weight).
2. Crear `lib/errors.ts` con `AppError`, `ValidationError`, `UnauthorizedError`, mapeados a HTTP 4xx/5xx.
3. Definir `ws/schemas.ts` con **zod** para `WSClientMessage` discriminated union por `type`. Toda entrada WS pasa por `schema.safeParse()`.
4. Reescribir `http.ts` como plugin Fastify (`fastify-plugin`) registrado en `app.ts`.
5. Mover handlers WS a `ws/handlers.ts`, uno por mensaje (`handleTrigger`, `handleConfigUpdate`, `handleGetScenes`, `handleClientType`). Cada handler recibe dependencias inyectadas (DIP) en lugar de `this.*` del god class.
6. Crear `services/button.service.ts` con la lógica de orquestación (qué hace cada `actionType`).
7. Crear `services/config.service.ts` que envuelve `loadConfig`/`saveConfig` con tipos estrictos y **validación zod** al leer (rechaza archivos corruptos en lugar de caer a defaults silenciosamente).
8. `index.ts` queda en ≤ 30 líneas: instancia `createApp()`, `app.start()`, `setupGracefulShutdown()`.
9. Mover `DEFAULT_BUTTONS` a `shared/src/index.ts` como `const DEFAULT_BUTTONS: readonly Button[]` (consumido por server y client).
10. Documentar en `README.es.md` la nueva estructura interna.

### Criterio de aceptación
- ✅ `index.ts` ≤ 50 líneas.
- ✅ Cada archivo nuevo ≤ 200 líneas, una sola responsabilidad.
- ✅ `pnpm typecheck` pasa en `server`.
- ✅ `pnpm dev` arranca idéntico al estado actual (mismas rutas, mismos mensajes WS).
- ✅ Mensaje WS inválido cierra conexión con `code 1008` y log estructurado (no `try/catch` silencioso).
- ✅ Ningún `console.log` que no pase por `logger`.

---

## BLOQUE 2 — Seguridad: Validación, Auth Shared Secret y Headers

### Objetivo
Proteger el WebSocket y endpoints sensibles (`/api/quit`, `/admin`, `/m`) con un **shared secret** generado al primer arranque, mostrable en QR y en consola. Aplicar headers de seguridad (helmet-style), rate limiting básico y CORS estricto para la API.

### Archivos afectados
- `packages/server/src/server/config.ts` (añadir `auth.secret` al `ServerConfig`)
- `packages/server/src/server/paths.ts` (asegurar persistencia de `secret` en AppData)
- `packages/server/src/app.ts` (registrar hooks de auth y rate limit)
- `packages/server/src/ws/manager.ts` (renombrar `websocket.ts`) → exigir `?token=` o header `Sec-WebSocket-Protocol`
- `packages/server/src/routes/api.routes.ts` → middleware de auth para `/api/quit`
- `packages/shared/src/index.ts` → extender `ServerConfig` con `auth: { secret: string }`
- **Nuevos:**
  - `packages/server/src/middleware/auth.ts`
  - `packages/server/src/middleware/rate-limit.ts` (in-memory token bucket por IP)
  - `packages/server/src/lib/secret.ts` (`crypto.randomBytes(32).toString('base64url')`)

### Acciones concretas
1. Añadir `auth.secret` a `ServerConfig`. Al primer arranque (config sin `auth`), generar uno nuevo con `crypto.randomBytes(32)`, persistirlo y **mostrarlo en consola + QR**.
2. Cambiar el QR actual para que codifique `ws://<ip>:3001?token=<secret>` (cliente lo lee y guarda).
3. **WebSocket:** rechazar conexiones sin `token` válido en query string (mismatch → `close 4401`).
4. **HTTP `/api/quit`:** exigir header `Authorization: Bearer <secret>` (401 si falta).
5. **HTTP `/admin`, `/m`:** servir sin auth (son estáticos), pero marcar cookie `auth=ok` con SameSite=Strict sólo si `Authorization` correcto se envió (cliente lo setea vía fetch al primer load).
6. Rate limit en memoria: máx 30 mensajes WS/min por IP, máx 10 requests/min a `/api/quit`.
7. Registrar `helmet` con CSP permisivo (sin `unsafe-eval`, sólo `self`).
8. CORS: solo `http://localhost:3000`, `http://localhost:3001`, `http://<ip>:3000`, `http://<ip>:3001`. Bloquear todo lo demás para `/api/*`.
9. Eliminar la password OBS por defecto del código (`DEFAULT_CONFIG.obs.password` queda como cadena vacía `''` → forzar al usuario a definirla).
10. Log de intentos de auth fallidos con IP.

### Criterio de aceptación
- ✅ Conexión WS sin token → rechaza en < 100 ms con `4401`.
- ✅ Conexión WS con token incorrecto → rechaza idéntico.
- ✅ `curl -X POST http://localhost:3000/api/quit` sin auth → 401.
- ✅ `curl -X POST -H "Authorization: Bearer <secret>" http://localhost:3000/api/quit` → 200 y server se apaga.
- ✅ Tras 50 mensajes WS en 60 s, las siguientes conexiones de esa IP reciben `429`.
- ✅ `helmet` reporta headers CSP, X-Frame-Options, X-Content-Type-Options en response.
- ✅ QR generado en consola codifica la URL con token (verificable escaneándolo).

---

## BLOQUE 3 — Seguridad de Hotkeys (escape PowerShell)

### Objetivo
Eliminar la **inyección de comandos PowerShell** en `packages/server/src/server/robot.ts`. El `payload` actual (proveniente del admin) se interpola directamente al comando `powershell -Command "..."` con sólo escape de comillas simples.

### Archivos afectados
- `packages/server/src/server/robot.ts`
- `packages/server/src/server/robot.test.ts` (nuevo, ver Bloque 10)

### Acciones concretas
1. Whitelist estricta: validar que cada `key` esté en `POWERSHELL_KEY_MAP` o sea `[a-z]`, `[A-Z]`, `[0-9]` de un solo carácter. Si no, lanzar `ValidationError("Invalid hotkey key: <key>")`.
2. Construir el comando PowerShell usando **base64 encoding** para evitar inyecciones por caracteres especiales:
   ```
   powershell -EncodedCommand <base64>
   ```
   El UTF-16LE del script se codifica a base64 y se pasa como argumento.
3. Eliminar `typeString` o, si se conserva, validar input contra regex `/^[A-Za-z0-9 .,!?\-_@#\$%\^&\*\(\)\[\]]+$/` y escapar siempre con base64.
4. Documentar en JSDoc que `pressHotkey` rechaza keys desconocidas con `Error`, no silencio.
5. Añadir logging de cada hotkey ejecutado: `keys`, `psCommandLength`, `success`.

### Criterio de aceptación
- ✅ Test: `pressHotkey(['ctrl', 'shift', "evil'; calc; '"])` lanza `Error`, no ejecuta PowerShell.
- ✅ Test: hotkey válido `['ctrl', 'a']` se ejecuta correctamente vía `-EncodedCommand`.
- ✅ Cualquier carácter de control (`\n`, `\r`, `\t`, `;`, `&`, `|`) en keys → rechazado.
- ✅ `grep -n "SendWait('${" packages/server/src/server/robot.ts` no devuelve resultados (no quedan interpolaciones crudas).

---

## BLOQUE 4 — Performance (Compresión, Cache, Bundle)

### Objetivo
Reducir TTFB de estáticos servidos por Fastify y el bundle JS del cliente móvil. Activar compresión, configurar cache-control, analizar bundle e implementar code splitting en admin.

### Archivos afectados
- `packages/server/src/routes/static.routes.ts`
- `packages/server/src/app.ts` (registrar `@fastify/compress`, `@fastify/static` opcional)
- `packages/server/package.json` (añadir `@fastify/compress`)
- `packages/client/vite.config.ts` (manualChunks, terser)
- `packages/client/src/App.tsx` (lazy load de secciones)
- `packages/admin/next.config.js` (después de migrar en Bloque 7)
- `packages/landing/next.config.js` (compresión si aplica en Vercel; configurar `images`)

### Acciones concretas
1. **Server:**
   - Registrar `@fastify/compress` con umbral 1 KB, Brotli si el cliente lo soporta.
   - Añadir `Cache-Control: public, max-age=31536000, immutable` para `/assets/*` con hash de Vite.
   - Añadir `Cache-Control: no-cache` para `index.html` (para updates sin invalidación manual).
   - Añadir `ETag` automático (Fastify ya lo hace, verificar).
   - Streaming de archivos grandes (`reply.send(fs.createReadStream(path))` en lugar de `fs.readFileSync + send`).
2. **Client (Vite):**
   - Configurar `build.rollupOptions.output.manualChunks: { react: ['react', 'react-dom'], i18n: ['i18next', 'react-i18next'] }`.
   - Activar `build.minify: 'terser'` con `drop_console: true` para producción.
   - Lazy load con `React.lazy` para componentes pesados (KeyboardPicker, modal de edición).
3. **Admin (Next.js, post-Bloque 7):**
   - `dynamic()` para componentes cliente pesados.
   - Verificar `next.config.js` tiene `swcMinify: true` (default en 14).
4. **Landing:**
   - Usar `next/image` (con `unoptimized: true` por static export) si se añaden imágenes.
   - Preconnect a fuentes si se usan web fonts (de momento no hay).

### Criterio de aceptación
- ✅ `curl -H "Accept-Encoding: br" -I http://localhost:3000/assets/...` devuelve `content-encoding: br`.
- ✅ `Accept-Encoding: gzip` → `content-encoding: gzip`.
- ✅ Tamaño inicial de JS del cliente ≤ 120 KB gzipped (medido con `pnpm build && du -h packages/client/dist/assets/*.js`).
- ✅ `manualChunks` separa `react`, `i18n`, app en chunks distintos.
- ✅ Lighthouse Performance score del cliente (modo mobile, simulated) ≥ 90.

---

## BLOQUE 5 — SEO Mínimo + Metadata + Lang dinámico

### Objetivo
Aunque el SEO no es prioridad, sentar las bases técnicas: metadatos por página, OG/Twitter cards, sitemap, robots, lang dinámico, JSON-LD mínimo en landing.

### Archivos afectados
- `packages/landing/src/pages/index.tsx` (exportar `metadata`)
- `packages/landing/src/pages/docs.tsx`
- `packages/landing/src/pages/contribute.tsx`
- `packages/landing/src/pages/_document.tsx` (setear `lang` dinámico)
- `packages/landing/src/components/Seo.tsx` (nuevo helper)
- `packages/landing/src/components/LanguageSwitcher.tsx` (cambiar `document.documentElement.lang`)
- `packages/landing/public/robots.txt` (nuevo)
- `packages/landing/public/sitemap.xml` (nuevo, o generado en build)
- `packages/landing/next.config.js` (configurar i18n routing si se usa App Router)
- `packages/shared/src/seo/defaults.ts` (nuevo, metadata por namespace)
- `packages/admin/src/pages/index.tsx` y `admin.tsx` (añadir `noindex`)

### Acciones concretas
1. Crear `shared/src/seo/defaults.ts` con objeto `SEO_DEFAULTS` (title template, description, ogImage URL, canonical, themeColor).
2. Crear componente `<Seo />` en landing que renderice `<Head>` con título, description, canonical, og:*, twitter:*.
3. Añadir `metadata` export (después de migrar a App Router en Bloque 7) o `<Head>` (Pages Router) en `index.tsx`, `docs.tsx`, `contribute.tsx`.
4. Lang dinámico: `LanguageSwitcher` cambia `document.documentElement.lang` además de `i18next.language`.
5. Crear `public/robots.txt` que permita todo y apunte al sitemap.
6. Crear `public/sitemap.xml` estático (3 páginas en EN, 3 en ES = 6 URLs).
7. JSON-LD mínimo (`SoftwareApplication` schema) en `index.tsx` con nombre, descripción, autor, licencia, OS, precio `0`.
8. Añadir favicon (placeholder SVG inline en `_document.tsx` mientras se genera uno real).
9. Admin: `<meta name="robots" content="noindex,nofollow" />` en `_app.tsx`.
10. Cliente PWA: añadir `manifest.webmanifest` (PWA real), icono 192/512.

### Criterio de aceptación
- ✅ `curl http://localhost:3000/` contiene `<title>`, `<meta name="description">`, `<meta property="og:title">`.
- ✅ `curl http://localhost:3000/robots.txt` devuelve `User-agent: *` + `Sitemap:`.
- ✅ `curl http://localhost:3000/sitemap.xml` devuelve XML válido con 6 `<url>`.
- ✅ `<html lang>` cambia a `es` o `en` al pulsar el LanguageSwitcher (verificable en DevTools).
- ✅ Admin: `view-source:http://localhost:3000/admin` contiene `noindex`.
- ✅ Lighthouse SEO ≥ 95 en landing.

---

## BLOQUE 6 — Accesibilidad WCAG 2.1 AA

### Objetivo
Cumplir AA en admin, cliente y landing: navegación por teclado, foco visible, aria labels, contraste, modales accesibles, mensajes de error.

### Archivos afectados
- `packages/admin/src/pages/admin.tsx` (SortableButton, KeyboardPicker, modales)
- `packages/admin/src/components/SortableButton.tsx` (extraer)
- `packages/admin/src/components/ButtonEditor.tsx` (extraer modal)
- `packages/client/src/App.tsx` (botones, status badges)
- `packages/client/src/components/ButtonGrid.tsx` (extraer)
- `packages/landing/src/components/Navbar.tsx`, `LanguageSwitcher.tsx` (focus visible, aria-current)
- **Nuevos:**
  - `packages/shared/src/a11y/` con `useFocusTrap`, `useEscapeKey`, `announce()` helper
  - `packages/shared/src/a11y/index.ts`

### Acciones concretas
1. **Focus management:**
   - Crear `useFocusTrap(ref)` que confine tab dentro del modal mientras esté abierto.
   - Crear `useEscapeKey(handler)` hook compartido.
   - Al abrir modal → focus al primer input; al cerrar → focus al elemento que lo abrió.
2. **Aria:**
   - Botones del cliente: `aria-label="<button.label || icon description>"`, `aria-pressed` para estados toggle.
   - Status badges: `role="status"` con `aria-live="polite"`.
   - Language switcher: `aria-label="Cambiar idioma"`, `aria-current="true"` cuando activo.
   - Modales: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apuntando al título.
   - KeyboardPicker: cada botón con `aria-pressed` y `aria-keyshortcuts`.
3. **Contraste:**
   - Auditar con axe-core. Ajustar `text-gray-400` sobre `bg-gray-800` (de momento ya pasa), pero verificar el spinner de "Reconnecting" sobre `bg-black/60` (icono blanco sobre fondo negro/blur → pasa).
   - Estados disabled con suficiente contraste (no usar sólo opacidad).
4. **Skip link:** añadir `<a href="#main" class="sr-only focus:not-sr-only">Saltar al contenido</a>` en landing y admin.
5. **Touch targets:** botones de cerrar (`×`) en admin son `w-4 h-4` (16 px) → aumentar a `w-8 h-8` o `min-h-[44px] min-w-[44px]` para AA móvil.
6. **Reduced motion:** envolver animaciones (`animate-pulse`, `animate-shake`, `animate-spin`) en `@media (prefers-reduced-motion: no-preference)` o desactivarlas con Tailwind `motion-safe:`.
7. **Errores:** `aria-invalid` + `aria-describedby` en inputs del ButtonEditor. Mensaje de error en `<p role="alert">`.

### Criterio de aceptación
- ✅ `axe-core` (CLI) reporta 0 violaciones serias/ críticas en `/admin`, `/`, `/docs`.
- ✅ Navegación completa por teclado en admin: Tab llega a todos los botones, Enter activa, Esc cierra modales.
- ✅ `<html lang>` cambia al seleccionar idioma.
- ✅ Todos los botones icon-only tienen `aria-label`.
- ✅ Modales atrapan foco (verificable: Tab no sale del modal).
- ✅ Lighthouse Accessibility ≥ 95 en las 3 páginas.

---

## BLOQUE 7 — Migración Node SEA + Admin App Router

### Objetivo
Dos migraciones infra: (a) reemplazar `pkg` (deprecado) por **Node SEA** nativo de Node 20+; (b) migrar Admin de **Pages Router a App Router** manteniendo `output: 'export'`.

### Archivos afectados
- `packages/server/package.json` (quitar `pkg`, añadir scripts SEA)
- `packages/server/scripts/build-sea.js` (nuevo)
- `packages/server/scripts/prepare-package.js` (adaptar)
- `packages/server/sea-config.json` (nuevo)
- `packages/admin/src/pages/admin.tsx` → `app/admin/page.tsx` (con client component)
- `packages/admin/src/pages/index.tsx` → `app/page.tsx`
- `packages/admin/src/pages/_app.tsx` → `app/layout.tsx`
- `packages/admin/src/pages/_document.tsx` → `app/layout.tsx` (Html/Head/Body)
- `packages/admin/src/i18n.ts` → sigue pero se importa desde `app/layout.tsx`
- `packages/admin/src/components/*` (nuevos al migrar)
- `packages/admin/next.config.js` (mantener `output: 'export'`)
- `README.es.md` y `README.md` (actualizar instrucciones de build)

### Acciones concretas
**Node SEA:**
1. Quitar `pkg` de devDependencies.
2. Compilar TS a JS con `tsc` (igual que antes).
3. Crear `sea-config.json`: `{ "main": "dist/index.js", "output": "dist/sea-prep.blob", "disableExperimentalSEAWarning": true }`.
4. Añadir script `build:sea`: `node --experimental-sea-config sea-config.json && postject dist/sea-prep.blob NODE_SEA_BLOB dist/ospinajuanp-macroboard.exe --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`.
5. Adaptar `paths.ts`: `isPackaged()` ahora detecta `process.env.NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2` (no `.pkg`).
6. Documentar: requiere Node 20 LTS para build, pero el .exe resultante corre en cualquier Windows 10/11 sin Node instalado.
7. Probar bundle: el .exe arranca, sirve `/admin`, `/m`, `/api/status`, y se conecta a OBS.

**App Router:**
1. Crear `app/` directory, mover lógica de páginas a `app/admin/page.tsx`, `app/page.tsx`, `app/layout.tsx`.
2. `app/layout.tsx` declara `<html lang>`, importa CSS, importa `i18n`.
3. Componentes interactivos marcados con `'use client'` en la primera línea.
4. Mover `admin.tsx` (827 líneas) a `app/admin/page.tsx` y **romperlo en subcomponentes** (`SortableButton`, `ButtonEditor`, `KeyboardPicker`, `SceneLoader`) en `app/admin/_components/`.
5. Aprovechar Metadata API: `export const metadata = { title, description, robots: { index: false } }`.
6. Verificar `next build` produce `out/admin.html`, `out/index.html`, `out/_next/...`.

### Criterio de aceptación
- ✅ `pnpm --filter @ospinajuanp-macroboard/server package` produce `dist/ospinajuanp-macroboard.exe` ejecutable.
- ✅ El .exe arranca haciendo doble click, sin Node instalado, sin consola parpadeante si se usa el `launcher.vbs` documentado.
- ✅ Dentro del .exe: `process.env.NODE_SEA_FUSE_*` está definido y los paths apuntan a `dirname(process.execPath)`.
- ✅ `pnpm --filter @ospinajuanp-macroboard/admin build` produce `out/` con `admin.html` funcional.
- ✅ `/admin` y `/` (Fastify) sirven los estáticos correctamente.
- ✅ Metadata API: `view-source:` muestra `<title>` distinto en `/` vs `/admin`.
- ✅ Sin warnings de `pkg` ni de Pages Router deprecation en consola.

---

## BLOQUE 8 — i18n Centralizado en Shared (namespaces)

### Objetivo
Unificar todos los strings i18n en `@ospinajuanp-macroboard/shared/i18n` con namespaces (`common`, `admin`, `client`, `landing`, `errors`), eliminando duplicación entre admin/client/landing.

### Archivos afectados
- **Nuevos:**
  - `packages/shared/src/i18n/index.ts`
  - `packages/shared/src/i18n/locales/en/common.ts`
  - `packages/shared/src/i18n/locales/en/admin.ts`
  - `packages/shared/src/i18n/locales/en/client.ts`
  - `packages/shared/src/i18n/locales/en/landing.ts`
  - `packages/shared/src/i18n/locales/en/errors.ts`
  - (mismo para `es/`)
  - `packages/shared/src/i18n/types.ts` (tipos de keys para autocomplete)
- `packages/shared/package.json` (añadir `i18next` como peerDep opcional o dep)
- `packages/shared/src/index.ts` (re-exportar `i18n` setup)
- `packages/admin/src/i18n.ts` → deprecado, importar de `@ospinajuanp-macroboard/shared/i18n`
- `packages/client/src/i18n.ts` → idem
- `packages/landing/src/i18n.ts` → idem

### Acciones concretas
1. Crear estructura de namespaces (`common`, `admin`, `client`, `landing`, `errors`).
2. Consolidar strings existentes de los 3 paquetes en el nuevo árbol.
3. Tipar las claves con TypeScript para autocompletado en `useTranslation`:
   ```ts
   declare module 'react-i18next' {
     interface CustomTypeOptions {
       defaultNS: 'common';
       resources: typeof import('@ospinajuanp-macroboard/shared/i18n').resources;
     }
   }
   ```
4. Cada paquete importa sólo los namespaces que necesita:
   ```ts
   import { setupI18n } from '@ospinajuanp-macroboard/shared/i18n';
   setupI18n(['admin', 'common']);
   ```
5. Mantener `localStorage` de preferencia de idioma.
6. Añadir tests que verifiquen que no quedan claves huérfanas entre namespaces y locales.

### Criterio de aceptación
- ✅ `grep -rn "translation: {" packages/{admin,client,landing}/src/i18n.ts` devuelve 0 resultados.
- ✅ Cambiar un string en `shared/src/i18n/locales/en/common.ts` se refleja en los 3 paquetes tras rebuild.
- ✅ `useTranslation('admin')` autocompleta las claves en TypeScript.
- ✅ Build de los 3 paquetes pasa sin warnings de claves faltantes.

---

## BLOQUE 9 — Design System Unificado y Refactor de Componentes

### Objetivo
Unificar paleta, tipografía, espaciado e iconografía entre admin/client/landing. Romper los monolitos `admin.tsx` (827 líneas) y `App.tsx` (351 líneas) en componentes pequeños y testeables. Añadir error boundaries y dark/light theme toggle.

### Archivos afectados
- **Nuevos:**
  - `packages/shared/src/design/tokens.ts` (paleta, spacing, radii, shadows)
  - `packages/shared/src/design/icons.ts` (mapping icon → SVG inline)
  - `packages/shared/src/components/ErrorBoundary.tsx`
  - `packages/shared/src/components/Toast.tsx`
  - `packages/shared/src/components/ThemeProvider.tsx`
  - `packages/shared/src/components/Button.tsx` (variantes: primary, ghost, danger, sizes)
- `packages/admin/src/styles/globals.css` (importar design tokens)
- `packages/client/src/styles/index.css` (idem)
- `packages/landing/src/styles/globals.css` (idem)
- `packages/admin/src/pages/admin.tsx` → romper en:
  - `admin/_components/ButtonGrid.tsx`
  - `admin/_components/ButtonEditor.tsx`
  - `admin/_components/KeyboardPicker.tsx`
  - `admin/_components/SceneLoader.tsx`
  - `admin/_components/SortableButton.tsx`
  - `admin/_components/StatusBar.tsx`
  - `admin/_components/ReconnectingOverlay.tsx`
- `packages/client/src/App.tsx` → romper en:
  - `components/ButtonGrid.tsx`
  - `components/StatusBar.tsx`
  - `components/ReconnectingOverlay.tsx`
  - `components/PageNavigation.tsx`
  - `hooks/useButtonWebSocket.ts`
- `packages/admin/tailwind.config.js` (consumir tokens compartidos)
- `packages/client/tailwind.config.js` (idem)
- `packages/landing/tailwind.config.js` (idem)

### Acciones concretas
1. **Tokens:** crear `design/tokens.ts` con constantes TS exportadas a Tailwind via `theme.extend` en cada `tailwind.config.js`.
2. **Paleta unificada:** `macroboard-primary: '#6366f1'`, `macroboard-secondary: '#8b5cf6'`, `macroboard-accent: '#ec4899'`, `macroboard-dark: '#0f172a'`. Eliminar `deckstream-*`.
3. **Iconos:** sustituir emojis (`▶ ⏸ 🎤 📷 🎬`) por SVGs inline desde `lucide-react` (añadir como dep en shared), accesibles (`aria-hidden` decorativos, `aria-label` cuando transmiten info).
4. **Error boundaries:** envolver cada root de admin y client con `<ErrorBoundary fallback={<ErrorScreen />}>`. Log a servidor vía `/api/client-error`.
5. **Toast system:** feedback consistente (save success, error de OBS, etc.) en admin y client.
6. **Theme:** dark por defecto, toggle a light. Persistir en `localStorage`. Respetar `prefers-color-scheme` en primer load.
7. **Refactor admin.tsx:** extraer componentes en `app/admin/_components/` (post Bloque 7). Cada uno ≤ 150 líneas.
8. **Refactor App.tsx (client):** mover lógica de WebSocket a `useButtonWebSocket()` hook. Mover UI a componentes presentacionales.
9. **Loading states:** skeletons en lugar de spinners donde aplique.

### Criterio de aceptación
- ✅ Ningún archivo `.tsx` de UI > 200 líneas.
- ✅ `grep -rn "deckstream-" packages/` devuelve 0.
- ✅ `grep -rn "[🎤📷🎬🔔🎵⚡🎨]" packages/{admin,client}/src/` devuelve 0 (sólo SVGs).
- ✅ Error boundary: tirar `throw new Error("test")` en cualquier componente → muestra fallback, no rompe la app.
- ✅ Theme toggle: cambia `dark:` classes en `<html>`, persiste tras reload.
- ✅ `lucide-react` instalado en `shared`, consumido por los 3 paquetes.

---

## BLOQUE 10 — Testing (Vitest + Playwright)

### Objetivo
Establecer pirámide de tests: unitarios (server, hooks), integración (Fastify + WS), E2E (Playwright contra dev server).

### Archivos afectados
- **Nuevos:**
  - `vitest.config.ts` (root, con proyectos por paquete)
  - `packages/server/vitest.config.ts`
  - `packages/admin/vitest.config.ts`
  - `packages/client/vitest.config.ts`
  - `packages/server/src/server/robot.test.ts`
  - `packages/server/src/server/config.test.ts`
  - `packages/server/src/ws/handlers.test.ts`
  - `packages/server/src/services/button.service.test.ts`
  - `packages/client/src/hooks/useButtonWebSocket.test.ts`
  - `packages/admin/src/components/ButtonEditor.test.tsx`
  - `packages/shared/src/i18n/i18n.test.ts`
  - `e2e/playwright.config.ts`
  - `e2e/admin.spec.ts`
  - `e2e/client.spec.ts`
  - `e2e/landing.spec.ts`
  - `e2e/ws-flow.spec.ts`
- `package.json` (root) → añadir scripts `test`, `test:unit`, `test:e2e`, `test:coverage`
- `.github/workflows/ci.yml` (opcional, si se quiere CI)

### Acciones concretas
1. **Vitest config por paquete**, usando `happy-dom` para client/admin y entorno `node` para server.
2. **Tests unitarios server:**
   - `robot.test.ts`: hotkeys válidos generan comando base64; inválidos lanzan error; `'; calc; '` no se inyecta.
   - `config.test.ts`: JSON corrupto cae a defaults sin crashear; backup se crea antes de overwrite.
   - `handlers.test.ts`: mensaje TRIGGER sin `buttonId` → ACTION_ACK success=false; OBS_MUTE sin conexión → success=false.
   - `button.service.test.ts`: orquestación correcta por actionType.
3. **Tests unitarios frontend:**
   - `useButtonWebSocket.test.ts`: reintenta conexión tras `onclose`; ignora mensajes malformados.
   - `ButtonEditor.test.tsx`: muestra KeyboardPicker cuando action=HOTKEY; muestra input cuando action=OBS_SCENE.
   - `i18n.test.ts`: claves EN y ES son el mismo set (no hay claves faltantes).
4. **Playwright E2E:**
   - `landing.spec.ts`: carga `/`, cambia idioma, ve metadatos correctos.
   - `admin.spec.ts`: conecta al WS mock, añade botón, ve feedback visual.
   - `client.spec.ts`: simula móvil (viewport 375x667), click en botón, ve ACK.
   - `ws-flow.spec.ts`: levanta server real en puerto random, conecta dos clientes WS (mobile + admin), verifica broadcast.
5. **Coverage:** objetivo ≥ 70% en `server/src/services/` y `server/src/ws/`.
6. Script `pnpm test` corre unit; `pnpm test:e2e` corre Playwright con servidor autoarrancado.

### Criterio de aceptación
- ✅ `pnpm test` ejecuta unit tests de los 4 paquetes, todos verdes.
- ✅ `pnpm test:e2e` levanta el server en background, ejecuta Playwright, termina limpio.
- ✅ Coverage report muestra ≥ 70% en `server/src/services/button.service.ts` y `server/src/ws/handlers.ts`.
- ✅ El test de inyección PowerShell detecta payloads maliciosos (no se puede falsear el test sin desactivar el escape).
- ✅ Test E2E del flujo WS valida que un trigger desde mobile llega al admin en < 200 ms.

---

## Recomendación de orden de ejecución (referencial, NO obligatoria)

Aunque los bloques son independientes, este orden minimiza retrabajo:

1. **Bloque 1** (arquitectura) sienta bases — facilita los demás.
2. **Bloque 8** (i18n shared) desbloquea refactors de los paquetes.
3. **Bloque 9** (design system) consolidá UI antes de añadir features.
4. **Bloque 2 + 3** (seguridad) en paralelo.
5. **Bloque 4** (performance) tras diseño estable.
6. **Bloque 5** (SEO) tras migración App Router (Bloque 7).
7. **Bloque 6** (a11y) tras refactor de componentes (Bloque 9).
8. **Bloque 7** (Node SEA + App Router) al final, por ser la migración infra más sensible.
9. **Bloque 10** (testing) puede ejecutarse en cualquier momento, pero aporta más valor tras el refactor.

---

## Próximo paso

Cuando apruebes este plan, ejecuta la **FASE 3** diciéndome qué bloque arrancar (ej. "Ejecuta el Bloque 1"). Trabajaré **únicamente** en ese bloque y al terminar te entregaré:

- Resumen de cambios (archivos tocados, líneas +/-).
- Cómo probarlo localmente.
- Riesgos o pendientes detectados.
- Quedaré a la espera de tu siguiente instrucción.

¿Apruebas el plan o quieres ajustar algo (agregar/quitar bloques, cambiar criterios, fusionar)?