# ospinajuanp-macroboard

Control táctil para streamers con integración OBS. Transforma cualquier móvil en un panel de control para streaming.

Touch controller for streamers with OBS integration. Turns any mobile device into a streaming control panel.

---

## Requisitos | Requirements

### Desarrollo | Development
- Node.js 18+
- pnpm
- Windows 10/11
- OBS Studio 28+ con WebSocket habilitado | with WebSocket enabled

### Producción | Production
- Windows 10/11
- OBS Studio 28+ con WebSocket habilitado | with WebSocket enabled

---

## Instalación Rápida | Quick Install

### Usando el Installer (Recomendado | Recommended)

1. Descarga | Download `ospinajuanp-macroboard-setup.exe` desde | from releases
2. Ejecuta el installer | Run the installer
3. Busca "ospinajuanp-macroboard" en el menú Inicio | Search in Start Menu
4. ¡Listo! | Done!

El servidor se ejecuta en la bandeja del sistema. | The server runs in the system tray.

### Usando el .exe Directo | Using the .exe Directly

1. Descarga | Download `ospinajuanp-macroboard.exe` desde | from releases
2. Crea una carpeta y coloca el .exe dentro | Create a folder and place the .exe inside
3. Ejecuta el .exe | Run the .exe

---

## Instalación desde Código Fuente | Installation from Source

### Clonar el Repositorio | Clone the Repository

```bash
git clone <repo-url>
cd ospinajuanp-macroboard
```

### Instalar Dependencias | Install Dependencies

```bash
pnpm install
```

### Configurar OBS | Configure OBS

1. Abre OBS Studio
2. Ve a | Go to **Edit → Settings → WebSocket**
3. Activa | Enable **Enable WebSocket server**
4. Configura la contraseña | Set password: `Cualquiera1234` (o la que prefieras | or your preferred)
5. Anota el puerto | Note the port: `4455` (default)

### Configurar config.json

Crea `packages/server/config.json`:

```json
{
  "buttons": [],
  "autoOpen": true,
  "obs": {
    "host": "localhost",
    "port": 4455,
    "password": "Cualquiera1234"
  }
}
```

### Ejecutar en Desarrollo | Run in Development

```bash
pnpm dev
```

Accede a | Access:
- **Admin**: http://localhost:3000/admin
- **Cliente Móvil | Mobile Client**: http://localhost:3000
- **Cliente PWA**: http://localhost:3001

Escanea el código QR en la terminal para conectar tu móvil. | Scan the QR code in the terminal to connect your mobile.

---

## Construir el .exe | Build the .exe

```bash
pnpm package
```

El ejecutable se crea en | Executable created at:
```
packages/server/dist/ospinajuanp-macroboard.exe
```

Para distribuir | To distribute:
1. Copia toda la carpeta `dist/` | Copy the entire `dist/` folder
2. Ejecuta el .exe | Run the .exe

---

## Crear el Instalador | Create the Installer

### 1. Descargar Inno Setup

Descarga desde | Download from: https://jrsoftware.org/isinfo.php

### 2. Abrir el Script

Abre en Inno Setup: `packages/server/scripts/installer.iss`

### 3. Compilar | Compile

Menú | Menu: **Build → Compile** (o | or `Ctrl+F9`)

### 4. Output

El installer se crea en | Installer created at:
```
packages/server/installer/ospinajuanp-macroboard-setup.exe
```

---

## Usar el Servidor | Using the Server

Una vez ejecutándose, el servidor aparece en la bandeja del sistema. | Once running, the server appears in the system tray.

### Menú de la Bandeja | Tray Menu
- **Abrir Admin | Open Admin**: Abre la UI de administración en el navegador | Opens admin UI in browser
- **Quit**: Cierra el servidor | Closes the server

###Puertos | Ports
- `3000`: Admin UI + Cliente móvil (same URL) | Admin UI + Mobile client
- `3001`: WebSocket server para comunicación con clientes | WebSocket server for client communication

---

## Funcionalidades | Features

- Integración completa con OBS | Full OBS integration
- Hotkeys configurables (SendKeys de PowerShell) | Configurable hotkeys (PowerShell SendKeys)
- Sistema de bandeja | System tray
- Soporte i18n (Español/Inglés) | i18n support (Spanish/English)
- PWA para control desde móvil | PWA for mobile control
- Drag & drop para reordenar botones | Drag & drop to reorder buttons
- Código QR para conexión fácil | QR code for easy connection

---

## Estructura | Structure

```
packages/
├── server/    # Backend
├── admin/     # Admin panel (Next.js)
├── client/    # Mobile PWA (Vite + React)
└── shared/    # Shared types
```

---

## Scripts Disponibles | Available Scripts

```bash
pnpm dev          # Ejecutar todos en modo desarrollo | Run all in dev mode
pnpm build        # Construir todos los paquetes | Build all packages
pnpm clean        # Limpiar build y config.json | Clean build and config.json
pnpm lint         # Linting
pnpm typecheck    # Verificación de tipos | Type checking
pnpm package      # Crear .exe | Create .exe
```

---

## Solución de Problemas | Troubleshooting

### OBS no se conecta | OBS not connecting
1. Verifica que WebSocket esté habilitado en OBS | Verify WebSocket is enabled in OBS
2. Verifica la contraseña | Verify the password
3. Verifica el puerto | Verify the port (default 4455)

### El .exe no responde | .exe not responding
1. Revisa si hay un proceso en segundo plano | Check if there's a background process running
2. Revisa `config.json` en la misma carpeta que el .exe | Check `config.json` in the same folder as the .exe

### El móvil no se conecta | Mobile not connecting
1. Asegúrate de estar en la misma red WiFi | Make sure you're on the same WiFi network
2. Verifica la IP del servidor | Verify the server IP
3. Revisa el firewall | Check firewall settings
