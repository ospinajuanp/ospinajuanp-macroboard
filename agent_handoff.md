# Transferencia de Contexto para Agentes — ospinajuanp-macroboard

## Proyecto

`ospinajuanp-macroboard` es un monorepo TypeScript para controlar OBS Studio desde un navegador móvil en la misma red local. El servidor Windows expone HTTP/Fastify en `0.0.0.0:3000`, un WebSocket independiente en `:3001`, sirve el panel administrativo y el cliente móvil como estáticos, se conecta a OBS WebSocket (`4455` por defecto) y ejecuta hotkeys mediante PowerShell `SendKeys`. No existe base de datos ni backend remoto: la única persistencia de negocio es `config.json`.

El workspace contiene cinco paquetes:

- `@ospinajuanp-macroboard/server`: Node.js 18+, Fastify 4, `ws`, Zod, `obs-websocket-js`, QR, seguridad Fastify y empaquetado Windows con `pkg`.
- `@ospinajuanp-macroboard/shared`: contratos TypeScript, botones por defecto y helpers del token.
- `@ospinajuanp-macroboard/admin`: Next.js 14 Pages Router, export estático, React 18, Tailwind y `@dnd-kit`.
- `@ospinajuanp-macroboard/client`: SPA móvil Vite 5 + React 18 + Tailwind; se presenta como PWA, pero aún no tiene manifest ni service worker.
- `@ospinajuanp-macroboard/landing`: Next.js 14 Pages Router para landing/documentación, pensado para Vercel y no servido por el binario local.

Estado auditado el 2026-07-21: la modularización del servidor está committeada; la autenticación por secreto compartido, cabeceras de seguridad y limitación de tasa están implementados sólo en el árbol de trabajo. Server, shared, admin y landing pasan typecheck; client no pasa typecheck; lint no puede ejecutarse por falta/inaccesibilidad de ESLint; no hay pruebas ni CI. Licencia: PolyForm Noncommercial 1.0.0, no permite uso comercial sin acuerdo separado.

## Repositorio

- **GitHub / URL:** `https://github.com/ospinajuanp/ospinajuanp-macroboard` (remote `origin` configurado por SSH como `git@github.com:ospinajuanp/ospinajuanp-macroboard.git`).
- **Rama:** `main`, siguiendo `origin/main`; HEAD auditado: `69cfb41`.
- **Estado del Árbol de Trabajo:** Pendiente de commit. Antes de generar este handoff había 13 archivos versionados modificados (`admin`, `client`, `server`, `shared`, `pnpm-lock.yaml`) y nuevos módulos sin seguimiento bajo `packages/server/src/{lib,middleware,plugins}`, `packages/shared/src/auth/`, además de `config.json` raíz. `agent_handoff.md` es también un archivo nuevo de esta auditoría. No hacer reset/clean ni sobrescribir estos cambios sin revisarlos.
- **Dato sensible local:** `config.json` raíz está sin seguimiento, no está cubierto por `.gitignore` y contiene un `auth.secret` válido. No copiar su valor a documentación, logs nuevos ni commits. `packages/server/config.json` sí está ignorado, pero contiene formato legado incompatible con el esquema actual.
- **Artefactos ignorados presentes:** `.quit`, `node_modules/`, `.next/`, `out/`, `dist/`, `*.tsbuildinfo` y el instalador `.exe` generado. No tratarlos como fuente de verdad.

## Convenciones Clave

- **Enrutamiento y Estado:** El servidor es la autoridad de configuración. Fastify sirve `/`, `/m`, `/admin`, `/assets/*`, `/_next*` y `/api/*` en `3000`; `WebSocketManager` escucha en `3001`. Admin usa Next Pages Router (`/`, `/admin`), landing usa Pages Router (`/`, `/docs`, `/contribute`) y client es una SPA sin router. Admin/client mantienen estado React local; no hay Redux, Zustand, Context global ni framework de obtención de datos. Al conectar, el servidor envía `CONFIG_UPDATE` y `OBS_STATE`; cada cambio del admin se persiste y se rebroadcast. `DEFAULT_BUTTONS` se agrega al transmitir, no se persiste deliberadamente.
- **Enrutamiento y Estado:** El flujo móvil normal es QR/URL `/m?token=...` → `adoptTokenFromUrl()` → `localStorage` → URL `ws://<host>:3001?token=...` → `CLIENT_TYPE mobile` → `TRIGGER` → `ACTION_ACK`. `CLIENT_TYPE` es metadato, no autorización. Admin no envía actualmente `CLIENT_TYPE admin`.
- **Datos y Persistencia:** `ConfigService` valida con Zod, mantiene caché en memoria y escribe JSON sincrónicamente. En ejecución no empaquetada la ruta es `process.cwd()/config.json`; bajo `pkg`, `%USERPROFILE%/AppData/Roaming/ospinajuanp-macroboard/config.json`. Antes de cada escritura copia un único `.backup`. No hay migraciones, transacciones, escritura atómica, locking, DB ni API externa de persistencia.
- **Datos y Persistencia:** El token se guarda en `localStorage['macroboard_auth_token']`; el idioma se guarda por separado en `localStorage['language']` en admin/client/landing. OBS host/port/password y `autoOpen` sólo se leen de JSON al arrancar; no existe UI/API para cambiarlos y requieren reinicio.
- **Estilo y Reglas de Código:** TypeScript estricto, imports ES, comillas simples, punto y coma y dos espacios predominan. Server sigue capas `bootstrap → app → routes/ws → services → infra`; dependencias de handlers se inyectan. Validar entradas externas con Zod y usar tipos de `@ospinajuanp-macroboard/shared`. UI usa componentes funcionales y Tailwind; aliases `@/*` existen en admin/client/landing. No editar artefactos generados.
- **Estilo y Reglas de Código:** Los schemas Zod del servidor son más estrictos que las interfaces WS compartidas; al cambiar el protocolo hay que actualizar ambos lados. `WSClientMessage`/`WSServerMessage` son interfaces con campos opcionales, no uniones discriminadas exhaustivas. `Button.id` es identidad de React, DnD, ACK y persistencia: debe ser único y estable.
- **Estilo y Reglas de Código:** No existe configuración ESLint/Prettier en el repo ni dependencia directa de ESLint. Los scripts de lint declarados no son hoy una garantía ejecutable. Admin y landing permiten imports/variables no usados; client activa `noUnusedLocals` y `noUnusedParameters`.
- **Estilo y Reglas de Código:** i18n está duplicado en tres módulos (`admin`, `client`, `landing`), con inglés por defecto y español como segundo locale. Gran parte de admin y landing sigue hardcodeada fuera de i18next.
- **Variables de Entorno:** Sólo se consumen `LOG_LEVEL` (`debug|info|warn|error`, sin validación), `NO_COLOR=1` y `PKG_EXECPATH`/`process.pkg` para detección de empaquetado. No hay `.env.example`; `dotenv` está declarado pero nunca inicializado. `OBS_WEBSOCKET_PORT`, `OBS_WEBSOCKET_PASSWORD` y `SERVER_PORT`, mostradas en la landing, no están implementadas. HTTP `3000`, WS `3001` y OBS `4455` están hardcodeados/configurados por JSON, no por env.

## Consideraciones Importantes (CRÍTICO)

- **No commitear el secreto local:** `config.json:8-10` contiene el secreto compartido activo y está sin ignorar. `git add .` lo incluiría. Además, `pnpm clean` borra el `config.json` raíz y puede rotar/perder el token usado por navegadores.
- **`/api/status` anula gran parte de la autenticación:** `packages/server/src/routes/api.routes.ts:18-30` es público y devuelve `connectionUrl` y QR con el secret completo. Como Fastify escucha en todas las interfaces (`packages/server/src/app.ts:99`), cualquier equipo de la LAN que consulte el endpoint obtiene credenciales para WS y `/api/quit`.
- **Token sin TLS y expuesto por diseño:** URLs, QR y OBS usan `http://`/`ws://` (`packages/server/src/server/qr.ts:19-26`, `packages/server/src/server/obs.ts:140-142`). El secret también se imprime completo y dentro de URLs en cada arranque, no sólo en el primero (`packages/server/src/app.ts:152-170`). No funciona detrás de HTTPS por mixed content sin añadir TLS/WSS.
- **No existe autorización por rol:** `CLIENT_TYPE` sólo asigna una propiedad (`packages/server/src/ws/manager.ts:165-168`). Cualquier cliente con el token puede enviar `CONFIG_UPDATE`, `GET_SCENES` y `TRIGGER`; no hay separación mobile/admin.
- **`TRIGGER` confía en acción y payload del cliente:** `buttonId` no se resuelve contra la configuración. El servidor ejecuta `message.action`/`message.payload` directamente (`packages/server/src/ws/handlers.ts:41-55`). Un cliente autenticado puede ejecutar acciones que no corresponden a ningún botón.
- **Inyección PowerShell pendiente:** una key desconocida se transforma en `{<INPUT>}` y se interpola dentro de `powershell -Command` ejecutado con shell (`packages/server/src/server/robot.ts:47-70`). Combinado con el `TRIGGER` arbitrario, un poseedor del token puede suministrar caracteres de PowerShell. El Bloque 3 de `PLAN_DE_MEJORA.md` aún no está implementado.
- **Migración de config destructiva:** el schema actual requiere `buttons: Button[]` y `auth.secret` (`packages/server/src/services/config.service.ts:21-26`). El `packages/server/config.json` local legado usa `buttons` como objeto, incluye `grid` y carece de `auth`; al arrancar desde el paquete, la validación falla, todo cae a defaults, se genera secret y se sobreescribe el archivo tras crear sólo un `.backup`. También se pierde la configuración OBS previa.
- **La ruta de config depende del CWD:** ejecutar `node` desde raíz usa `./config.json`; ejecutar el script pnpm del server normalmente usa `packages/server/config.json`. Son dos estados locales distintos. No asumir que editar uno afecta al proceso que está corriendo.
- **`pnpm dev` raíz no es funcional como orquestador:** server, admin y landing compiten por `3000`; Vite client y WebSocket server compiten por `3001`. Además, `server:dev` compila una vez y no observa cambios. Levantar todos los paquetes en paralelo requiere rediseñar puertos/proxy/scripts.
- **Estáticos de desarrollo apuntan al lugar equivocado:** el server no empaquetado busca `<repo>/static/{client,admin}` (`packages/server/src/index.ts:9-16`), mientras `prepare-package.js` copia a `packages/server/dist/static/*` (`packages/server/scripts/prepare-package.js:5-37`). En dev, `/`, `/m` y `/admin` suelen devolver fallbacks aunque existan builds.
- **Detección `isPackaged()` errónea en Windows:** `process.execPath.endsWith('.exe')` (`packages/server/src/server/paths.ts:4-8`) también es verdadero para `node.exe`. Un desarrollo Windows puede usar AppData y buscar estáticos junto a Node como si fuera el binario empaquetado.
- **Client no compila por tipos:** `packages/client/src/App.tsx:6` importa `ActionType` sin usar; `App.tsx:119` lee `message.grid` y llama `setGrid`, pero `WSServerMessage` no tiene `grid` y no existe ese setter. `vite build` no ejecuta `tsc` por sí solo, por lo que puede generar un bundle con este bug aunque `pnpm typecheck` falle.
- **Admin descarta IDs que no empiecen por `btn_`:** al recibir configuración filtra con `b.id.startsWith('btn_')` (`packages/admin/src/pages/admin.tsx:205-209`), no con `isDefaultButton`. Un botón de usuario con otro prefijo desaparece del editor y el siguiente guardado puede eliminarlo de la persistencia.
- **Defaults pueden duplicarse:** el server siempre prepende `DEFAULT_BUTTONS` al transmitir (`packages/server/src/ws/handlers.ts:68-70,92-96`) pero no rechaza un `CONFIG_UPDATE` que ya incluya IDs `default_*`. Tampoco valida IDs duplicados; esto rompe keys de React/DnD y hace ambiguos los ACK.
- **Flujo de token admin incompleto:** un token escrito manualmente sólo actualiza estado React; no se llama `writeAuthToken` (`packages/admin/src/pages/admin.tsx:167-175`). Si el servidor cierra con `4401`, el hook deja de reconectar, pero el modal no reaparece porque `token !== null`; el usuario puede quedar bloqueado hasta recargar/limpiar storage. Client, en cambio, reconecta cada 3 s incluso ante `4401`, creando un loop infinito con token inválido (`packages/client/src/App.tsx:73-76`).
- **La cookie de `/api/auth` no autentica nada:** se crea `macroboard_auth=1` (`packages/server/src/routes/api.routes.ts:55-64`) pero ninguna ruta ni middleware la lee. La sesión efectiva sigue siendo bearer/query token.
- **Rate limit WS es compartido y eludible:** 30 mensajes/minuto por IP incluye todas las conexiones de esa IP y puede bloquear admin+móvil detrás del mismo proxy; a la vez confía en `x-forwarded-for` sin proxy confiable (`packages/server/src/ws/manager.ts:38-42,89-95`). No hay `maxPayload`, control de handshakes ni rate limit de auth fallida.
- **WebSocket start no se espera:** `new WebSocketServer({ port })` retorna antes de `listening`; el app loguea éxito inmediatamente (`packages/server/src/app.ts:102-103`). Si `3001` está ocupado, HTTP puede quedar activo mientras WS sólo emite un error asíncrono.
- **Persistencia síncrona/no atómica:** `copyFileSync` + `writeFileSync` bloquean el event loop y una interrupción puede truncar el JSON (`packages/server/src/services/config.service.ts:124-145`). `CONFIG_UPDATE` no devuelve ACK/error al admin si el guardado falla.
- **Posible traversal y filtración de paths en estáticos:** rutas wildcard hacen `path.join` con datos de URL sin comprobar confinamiento (`packages/server/src/routes/static.routes.ts:73-106`). `request.url` puede incluir query strings; los 404/fallbacks exponen paths absolutos y las lecturas son síncronas.
- **`/api/quit` sólo se observa empaquetado:** la ruta escribe `.quit`, pero el intervalo que cierra el proceso sólo existe si `isPackaged()` (`packages/server/src/index.ts:33-41`). En dev responde 200 sin apagar el server. Hay un `.quit` ignorado presente; CWD incorrecto puede dejarlo huérfano o cerrar un binario posterior.
- **OBS reconnection no es indefinida:** se limita a cinco intentos lineales y depende de `ConnectionClosed` (`packages/server/src/server/obs.ts:92-103`). No distingue shutdown voluntario, puede programar reconexión al cerrar y emite callbacks duplicados mediante `updateState` + `broadcastOBSConnection` (`obs.ts:39-51`). Polling de 2 s puede solaparse.
- **Heurística de micrófono sensible a mayúsculas:** convierte nombres a lowercase, pero `excludeNames` contiene `Stereo` con mayúscula (`packages/server/src/server/obs.ts:169-182`), por lo que esa exclusión no funciona.
- **`MACRO` no hace nada y devuelve ACK exitoso:** `ButtonService` sólo loguea y retorna (`packages/server/src/services/button.service.ts:69-71`). Admin/landing publicitan macros como funcionalidad, pero no ejecutan secuencias.
- **No es una PWA real:** client no tiene `manifest.webmanifest`, iconos, service worker ni registro. Sólo incluye meta tags móviles en `packages/client/index.html:5-8`. Las afirmaciones de README/landing sobre PWA son aspiracionales.
- **Estado interno de `KeyboardPicker` queda desactualizado:** `selectedKeys` se inicializa desde `value` una sola vez y no se resincroniza (`packages/admin/src/pages/admin.tsx:667-669`). Cambiar de botón sin remount puede mostrar/guardar una combinación anterior.
- **Riesgos de hidratación/i18n:** admin y landing leen `localStorage` durante inicialización cliente, mientras SSR genera inglés (`packages/{admin,landing}/src/i18n.ts:4-6`). Un locale `es` persistido puede diferir del HTML prerenderizado. Landing mantiene `<html lang="en">` fijo y client declara `lang="es"` aunque i18n default sea inglés.
- **Empaquetado no es realmente un único archivo:** el `.exe` necesita `static/client` y `static/admin` externos. El instalador los copia, pero descargar sólo el `.exe` como sugiere README deja las UIs sin assets.
- **Ubicación de uninstall incorrecta:** server guarda config en AppData del usuario (`packages/server/src/server/paths.ts:17-22`), mientras Inno Setup borra `{commonappdata}` (`packages/server/scripts/installer.iss:50-54`). La desinstalación deja config y secret reales.
- **`next start` de admin es inválido:** admin usa `output: 'export'` (`packages/admin/next.config.js:2-6`), por lo que debe servirse como archivos estáticos; su script `next start -p 3000` no es compatible.

## Archivos Relevantes y Arquitectura

### Raíz / workspace

- `package.json`: metadatos, engines, scripts recursivos y entrada del flujo build/package.
- `pnpm-workspace.yaml`: incluye todos los paquetes bajo `packages/*`.
- `pnpm-lock.yaml`: lockfile v9; resuelve actualmente TypeScript 5.9.3, Next 14.2.35, React 18.3.1, Fastify 4.29.1 y las dependencias de seguridad no committeadas.
- `tsconfig.json`: base Node 18 para server/shared; `rootDir=src`, `outDir=dist`.
- `.gitignore`: excluye builds, envs, `packages/server/config.json`, `.quit`, tsbuildinfo e instaladores, pero no el `config.json` raíz.
- `README.md` / `README.es.md`: instalación, OBS, rutas, packaging y troubleshooting; varias rutas/comandos/claims están desactualizados respecto del árbol de trabajo.
- `PLAN_DE_MEJORA.md`: roadmap de diez bloques. Bloque 1 está mayormente aplicado; Bloque 2 está en árbol de trabajo; Bloques 3-10 siguen abiertos.
- `public.md`: material de publicación/marketing; útil para intención de producto, no para contratos técnicos.
- `LICENSE.md`: PolyForm Noncommercial 1.0.0.
- `skills-lock.json` / `.agents/skills/`: skills de asistencia para agentes; no forman parte del runtime de Macroboard.

### Contratos compartidos

- `packages/shared/src/index.ts`: `Button`, `ActionType`, `ServerConfig`, contratos WS, `DEFAULT_BUTTONS`, split defaults/user y reexports auth.
- `packages/shared/src/auth/token.ts`: adopción/limpieza del token desde query, `localStorage`, construcción de URL WS y bearer headers.
- `packages/shared/tsconfig.json`: genera JS + declaraciones; la librería DOM añadida localmente es necesaria para los helpers browser.

### Servidor

- `packages/server/src/index.ts`: bootstrap, resolución de estáticos, start, monitor `.quit` empaquetado y señales SIGINT/SIGTERM.
- `packages/server/src/app.ts`: composition root; carga config, registra seguridad/rutas, crea OBS/hotkeys/services/WS, propaga estado y abre admin.
- `packages/server/src/plugins/security.ts`: Helmet/CSP, allowlist CORS, cookie y rate limit Fastify no global.
- `packages/server/src/middleware/auth.ts`: extracción/verificación bearer y prehandler 401.
- `packages/server/src/middleware/rate-limit.ts`: fixed-window limiter en memoria usado por WS.
- `packages/server/src/routes/api.routes.ts`: `GET /api/status`, `GET /api/health`, `POST /api/quit`, `POST /api/auth`.
- `packages/server/src/routes/static.routes.ts`: serving manual y síncrono de admin/client exports.
- `packages/server/src/ws/schemas.ts`: schemas Zod para `TRIGGER`, `CONFIG_UPDATE`, `CLIENT_TYPE`, `GET_SCENES` y `Button`.
- `packages/server/src/ws/manager.ts`: servidor WS, auth query token, clientes, rate limit, parse/validate, dispatch y broadcast.
- `packages/server/src/ws/handlers.ts`: ACK de acciones, persistencia/broadcast de botones, carga de escenas y builders de mensajes iniciales.
- `packages/server/src/services/config.service.ts`: schema y defaults, caché, carga, generación del secret, backup y persistencia.
- `packages/server/src/services/button.service.ts`: dispatch de `ActionType` hacia OBS o hotkeys; `MACRO` no implementado.
- `packages/server/src/server/obs.ts`: adaptador `obs-websocket-js`, eventos, polling, reconexión, escenas, mute, grabación y streaming.
- `packages/server/src/server/robot.ts`: traducción de teclas y ejecución PowerShell; área crítica de seguridad y Windows-only.
- `packages/server/src/server/network.ts`: selecciona la primera IPv4 externa y enumera interfaces; VPN/adaptadores virtuales pueden producir un QR con IP incorrecta.
- `packages/server/src/server/qr.ts`: QR data URI y URLs HTTP/WS con token.
- `packages/server/src/server/paths.ts`: detección packaged y rutas de config/static.
- `packages/server/src/lib/secret.ts`: generación Base64URL de 32 bytes y comparación con `timingSafeEqual`.
- `packages/server/src/lib/errors.ts`: jerarquía `AppError`; sólo parte de ella está utilizada y no hay error handler Fastify global.
- `packages/server/src/lib/logger.ts`: logger estructurado sin dependencia; convive todavía con varios `console.error`.
- `packages/server/scripts/prepare-package.js`: construye client/admin y copia sus estáticos/scripts a `server/dist`.
- `packages/server/scripts/installer.iss`: instalador Inno Setup para `.exe` + estáticos.
- `packages/server/scripts/tray.ps1`: tray legado/deshabilitado; fuerza el cierre del proceso y no se instala actualmente.

### Panel administrativo

- `packages/admin/next.config.js`: Next Pages Router con `output: 'export'` y salida `out/`.
- `packages/admin/src/pages/_app.tsx`: CSS global e inicialización i18n por side effect.
- `packages/admin/src/pages/index.tsx`: landing local/QR; consume `/api/status`; hoy duplica `/m` al mostrar `connectionUrl`.
- `packages/admin/src/pages/admin.tsx`: monolito de 899 líneas con token UI, estado OBS, CRUD, DnD, escenas, modal, icon/color picker y hotkey picker.
- `packages/admin/src/hooks/useWebSocket.ts`: conexión/reconexión 3 s; detiene retries en close `4401`.
- `packages/admin/src/i18n.ts`: recursos EN/ES locales y persistencia de idioma.
- `packages/admin/src/types/index.ts`: `ConnectionStatus` y tipos administrativos parcialmente sin uso.
- `packages/admin/tailwind.config.js`: tokens `deckstream-*` y forms plugin.

### Cliente móvil

- `packages/client/vite.config.ts`: Vite/React, alias `@`, host LAN, puerto `3001`, salida `dist/assets`.
- `packages/client/src/main.tsx`: root React StrictMode e imports de CSS/i18n.
- `packages/client/src/App.tsx`: token, WS/reconnect, estado OBS/botones, ACK visual, agrupación y paginación de 12 botones.
- `packages/client/src/i18n.ts`: recursos EN/ES locales y persistencia.
- `packages/client/src/index.css` / `tailwind.config.js`: tema táctil, colores runtime safelisteados y animación shake.
- `packages/client/index.html`: shell móvil; no contiene manifest ni service worker.

### Landing pública

- `packages/landing/next.config.js`: Next Pages Router estándar; se despliega separado del binario.
- `packages/landing/src/pages/{index,docs,contribute}.tsx`: home, documentación y contribución; contenido parcialmente hardcodeado y docs de env no implementadas.
- `packages/landing/src/pages/_app.tsx`: inicializa i18n y estilos.
- `packages/landing/src/pages/_document.tsx`: `lang="en"` fijo y favicon inexistente.
- `packages/landing/src/components/Navbar.tsx`: navegación desktop y language switcher.
- `packages/landing/src/components/LanguageSwitcher.tsx`: selector EN/ES con guard de mount; `'use client'` no cambia nada en Pages Router.
- `packages/landing/src/components/Hero.tsx`, `Features.tsx`, `Footer.tsx`: UI pública y enlaces del proyecto.
- `packages/landing/src/i18n.ts`: recursos EN/ES propios.
- `packages/landing/README.md`: configuración manual de Vercel; no requiere env.

## Modelos de Datos y Esquema

### Config persistida

```ts
interface ServerConfig {
  buttons: Button[];
  autoOpen?: boolean;
  obs: {
    host: string;       // Zod: 1..255 chars
    port: number;       // entero 1..65535
    password: string;   // máximo 256
  };
  auth: {
    secret: string;     // schema 20..128; validación adicional Base64URL
  };
}
```

Defaults reales: `buttons=[]`, `obs.host='localhost'`, `obs.port=4455`, `obs.password=''`, secret vacío que se reemplaza por 32 bytes aleatorios Base64URL. `autoOpen` ausente equivale a `true` en `app.ts`. El schema no acepta propiedades como modelo funcional (`grid` queda descartado al parsear) y no migra configuraciones antiguas.

### Botones y acciones

```ts
type ActionType =
  | 'OBS_SCENE'
  | 'OBS_MUTE'
  | 'OBS_RECORD'
  | 'OBS_STREAM'
  | 'HOTKEY'
  | 'MACRO';

interface Button {
  id: string;       // Zod 1..128
  icon: string;     // Zod 1..64
  action: ActionType;
  payload: string;  // Zod máximo 4096
  label?: string;   // máximo 64
  color?: string;   // máximo 64; normalmente clase Tailwind bg-*
}
```

No hay validación semántica acción/payload, formato de color, unicidad de IDs ni allowlist de hotkeys. `OBSAction` y `HotkeyAction` existen en shared pero no forman una unión usada por `Button`.

Botones incorporados y no persistidos:

```ts
[
  { id: 'default_record', action: 'OBS_RECORD', icon: 'stop', label: 'Rec' },
  { id: 'default_stream', action: 'OBS_STREAM', icon: 'play', label: 'Stream' }
]
```

### Protocolo WebSocket

Mensajes cliente validados por Zod:

- `TRIGGER`: `{ type, buttonId, action, payload? }`.
- `CONFIG_UPDATE`: `{ type, buttons?: Button[] }`, máximo 500 botones sólo por WS.
- `CLIENT_TYPE`: `{ type, clientType: 'mobile' | 'admin' }`.
- `GET_SCENES`: `{ type }`.

Mensajes servidor:

- `CONFIG_UPDATE`: array con defaults + botones persistidos.
- `OBS_STATE`: `micMuted`, `recording`, `streaming`, `currentScene?`, y en broadcasts de `app` también `obsConnected`/`obsReconnecting`.
- `ACTION_ACK`: `buttonId`, `success`.
- `OBS_SCENES`: `scenes: string[]`.

`WSServerMessage` no contiene `grid`. Mensaje inválido/malformed cierra con `1008`; auth inválida cierra con `4401`; rate limit cierra con `1013`. No existe mensaje de error general ni ACK de configuración.

### Estado OBS en memoria

```ts
interface OBSState {
  connected: boolean;
  reconnecting: boolean;
  currentScene: string | null;
  recording: boolean;
  streaming: boolean;
  micMuted: boolean;
}
```

Se actualiza por eventos OBS y polling cada 2 s. No se persiste. Los clientes reconstruyen subconjuntos locales y usan `buttonId` para estado pending/success.

## Compilación y Scripts

Requisitos declarados: Node `>=18`, pnpm `>=8`, Windows 10/11 para runtime empaquetado/hotkeys, OBS Studio 28+ con WebSocket habilitado. El lockfile v9 fue generado con una versión moderna de pnpm; conviene usar pnpm 9+ aunque el engine admita 8.

### Raíz

- `pnpm dev`: `pnpm -r --parallel --stream dev`; actualmente falla por colisiones `3000/3001`.
- `pnpm build`: build recursivo de los cinco paquetes.
- `pnpm build:server|admin|client|landing`: builds filtrados.
- `pnpm clean`: borra `.next`, `dist`, `out` en paquetes y el `config.json` raíz; no borra `packages/server/config.json`.
- `pnpm lint`: lint recursivo; auditado en rojo por `eslint: Permission denied`/`spawn ENOENT` desde shared.
- `pnpm typecheck`: typecheck recursivo; actualmente rojo por client.
- `pnpm package`: build completo y luego package del server.

### Por paquete

- Shared: `build=tsc`, `dev=tsc --watch`, `typecheck=tsc --noEmit`.
- Server: `dev=tsc && node dist/index.js` (sin watch), `build=tsc`, `start=node dist/index.js`, `prepackage=node scripts/prepare-package.js`, `package=pkg dist/index.js --targets node18-win-x64`, `prepare-installer` crea el directorio.
- Admin: `dev=next dev -p 3000`, `build=next build` → export `out/`; no usar su `start` mientras `output: export` siga activo.
- Client: `dev=vite --port 3001`, `build=vite build`, `preview=vite preview` (4173 por defecto).
- Landing: `dev/start` en `3000`, `build=next build` → `.next`; Vercel root `packages/landing`.

### Empaquetado para Windows

1. Compilar server/shared y frontends.
2. `prepare-package.js` vuelve a construir client/admin y copia `client/dist`, `admin/out` y scripts a `packages/server/dist/static|scripts`.
3. `pkg` produce `packages/server/dist/ospinajuanp-macroboard.exe` target Node 18 Windows x64.
4. Inno Setup usa `packages/server/scripts/installer.iss` para incluir `.exe` + `dist/static` en `Program Files` y opcionalmente crear acceso directo.

El system tray está deshabilitado; `tray.ps1` sigue en fuentes pero el installer no lo copia. El plan propone reemplazar `pkg` (deprecado) por Node SEA 20+, todavía no implementado.

### Verificación de esta auditoría

- `pnpm --filter @ospinajuanp-macroboard/server typecheck`: pasa.
- `pnpm --filter @ospinajuanp-macroboard/shared typecheck`: pasa.
- `pnpm --filter @ospinajuanp-macroboard/admin typecheck`: pasa.
- `pnpm --filter @ospinajuanp-macroboard/landing typecheck`: pasa.
- `pnpm --filter @ospinajuanp-macroboard/client typecheck`: falla con cuatro errores en `App.tsx:6,119` (`ActionType`, `grid`, `setGrid`).
- `pnpm lint`: falla antes de analizar código porque ESLint no está disponible correctamente.
- Tests: no existen archivos `*.test.*`/`*.spec.*`, configuración Vitest/Jest/Playwright ni workflow CI.
- Build/runtime/OBS/installer no se reejecutaron durante la auditoría para no tocar artefactos ni configuración. Hay builds ignorados previos; no garantizan corresponder al árbol de trabajo.

## Funcionalidades y Estado Actual

- Monorepo pnpm, shared types y compilación separada de paquetes están establecidos.
- El refactor server por capas está aplicado: bootstrap delgado, composition root, routes, WS manager/handlers, services, infra, logger y errores.
- Config JSON se valida con Zod, se cachea, crea backup y genera/persiste secreto compartido cuando falta.
- Fastify implementa health/status, serving de admin/client, Helmet/CSP, CORS allowlist, cookies y rate limits opt-in.
- WS autentica query token, valida mensajes con Zod, mantiene clientes, envía bienvenida y rebroadcast de configuración/estado.
- Integración OBS implementa escena, mute heurístico, grabación, streaming, escenas, eventos, polling y reconexión limitada. Requiere OBS real para verificar comportamiento end-to-end.
- Hotkeys válidos del picker se traducen a PowerShell SendKeys en Windows; la seguridad de inputs arbitrarios no está resuelta.
- Admin implementa entrada de token, conexión WS, estado server/OBS, alta/edición/borrado/reordenamiento, carga automática de escenas, iconos, colores y selector de teclas.
- Client implementa adopción de token por QR, conexión/reconnect, botones táctiles, ACK visual, escena activa, grabación/streaming y paginación de 12. Su typecheck está bloqueado por código legado de `grid`.
- Landing implementa home, features, docs, contribute y selector EN/ES, pero metadata/SEO/a11y/docs requieren actualización.
- i18n EN/ES funciona client-side y persiste preferencia, aunque está duplicado y tiene riesgos SSR.
- Admin export y client dist existen como artefactos previos; deben reconstruirse antes de empaquetar.
- No están funcionalmente completos: macros, PWA instalable, auth por roles/cookie, TLS, edición de OBS desde UI, tray, tests/CI y dev orchestration root.

## Registro de Commits de la Sesión / Historial Reciente

- `69cfb41` (2026-07-16) `fix(admin,client): resolve hydration mismatch in language toggle`: HEAD actual; añadió guards de mount a toggles, pero no resuelve toda la inicialización i18n SSR.
- `d44d774` (2026-07-16) `refactor(server): modularize backend into layered architecture`: reemplazó el server monolítico por `app`, routes, services, WS handlers/schemas y lib de errores/logger.
- `8675070` (2026-07-16) `docs: add PLAN_DE_MEJORA.md and ignore .quit runtime artifact`: añadió roadmap de diez bloques.
- `3467678` (2026-07-16) `docs: re-license under Polyform Noncommercial 1.0.0`: cambió la licencia actual.
- `5417bbb` y commits previos del 2026-07-05: se retiró el launcher/tray por problemas de distribución; consola visible es el estado esperado.
- `a19a869` (2026-07-05) mejoró errores/persistencia del diseño anterior.
- `dff8b43` (2026-07-05) movió la intención de config empaquetada a AppData para evitar permisos de Program Files.
- Cambios locales posteriores a HEAD: implementación parcial del Bloque 2 (secret compartido, bearer, auth WS, token browser, Helmet/CORS/cookie/rate-limit), cambios de UI para token y lockfile. Son 391 inserciones/71 eliminaciones en archivos versionados más módulos nuevos. No asumir que están listos para commit: contienen las brechas críticas documentadas arriba.
- El árbol de trabajo emite warnings de conversión LF→CRLF; no hay `.gitattributes` que estabilice finales de línea.

## Tareas Abiertas / En Espera

- **P0 — Proteger secretos:** ignorar/retirar `config.json` raíz del staging, rotar el token si pudo compartirse y definir una estrategia segura de bootstrap/QR sin exponerlo por `/api/status` público.
- **P0 — Cerrar ejecución arbitraria:** resolver PowerShell con allowlist estricta y `-EncodedCommand`/spawn sin shell; nunca ejecutar action/payload suministrados directamente. Resolver el botón por `buttonId` desde config server-side.
- **P0 — Autorización:** separar credenciales/capacidades admin y mobile; exigir rol admin para `CONFIG_UPDATE`/`GET_SCENES`/shutdown; eliminar o implementar realmente la cookie `/api/auth`.
- **P0 — Seguridad de archivos estáticos:** confinar paths con `path.resolve` + comprobación de prefijo, separar pathname de query, añadir `maxPayload` WS y limitar handshakes/auth fallida.
- **P0 — Restaurar checks:** eliminar `ActionType`/`grid` legado del client o reintroducir un modelo de grid coherente; instalar/configurar ESLint compatible y hacer verdes `pnpm typecheck` + `pnpm lint`.
- **P1 — Migración de config:** migrar de forma explícita `{grid, buttons:{}}`/config sin auth sin perder OBS/botones; escribir atómicamente con temp+rename y probar backups. Unificar la ruta de desarrollo para evitar config raíz vs package.
- **P1 — Flujo de desarrollo:** asignar puertos no conflictivos o usar proxy/orquestador; centralizar constants/env y hacer que server observe cambios. Alinear dónde busca estáticos en dev.
- **P1 — WS UX/protocolo:** convertir contratos shared a uniones discriminadas, añadir ACK/error de config, impedir IDs duplicados/defaults persistidos, persistir token manual y permitir reemplazar/limpiar token inválido. Detener loops `4401` y timers después de unmount.
- **P1 — Robustez de OBS:** reconexión con backoff/estado de shutdown, evitar broadcasts duplicados/poll solapado, corregir casing de exclusiones y mostrar estado inicial real. Añadir UI/API segura para host/port/password.
- **P1 — Empaquetado:** corregir `isPackaged`, rutas de static/config/uninstall y docs del `.exe`; decidir entre completar migración Node SEA o mantener `pkg`. Probar desde instalación limpia sin Node.
- **P1 — Pruebas/CI:** implementar Bloque 10 (Vitest server/hooks/components, integración Fastify+WS y Playwright), especialmente auth, config migration, hotkey injection, roles y flujo WS. Añadir CI lint/typecheck/test/build.
- **P2 — Funcionalidad honesta:** implementar `MACRO` o retirarlo de admin/landing; añadir manifest, iconos y service worker antes de llamar PWA al cliente.
- **P2 — Refactor UI:** dividir `admin.tsx` y `client/App.tsx`, sincronizar `KeyboardPicker`, usar `isDefaultButton`, IDs robustos (`crypto.randomUUID`) y resolver races de eco/reorder.
- **P2 — i18n/SSR:** centralizar recursos en shared, eliminar strings hardcodeadas, hacer locale SSR-safe, actualizar `<html lang>` y corregir `client/index.html`.
- **P2 — A11y/SEO/performance:** completar Bloques 4-6 y 8-9: focus trap/Escape/labels/touch targets/reduced motion, metadata/robots/sitemap/favicon, cache/compression/streaming de estáticos y design tokens unificados.
- **P2 — Documentación:** corregir puertos y workflow dev, variables env inexistentes, comando `prepackage`, PWA/macros, ruta de config, requisito de estáticos externos, estado tray y licencia no comercial.
- **En espera:** system tray/launcher permanece deshabilitado; `tray.ps1` es legado hasta decidir una implementación mantenible.
