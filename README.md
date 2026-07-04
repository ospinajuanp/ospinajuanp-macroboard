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

### Para crear el Instalador | To Create the Installer
- [Inno Setup](https://jrsoftware.org/isinfo.php) 6.x

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

### 1. Clonar el Repositorio | Clone the Repository

```bash
git clone https://github.com/ospinajuanp/ospinajuanp-macroboard.git
cd ospinajuanp-macroboard
```

### 2. Instalar Dependencias | Install Dependencies

```bash
pnpm install
```

### 3. Configurar OBS | Configure OBS

1. Abre OBS Studio
2. Ve a | Go to **Edit → Settings → WebSocket**
3. Activa | Enable **Enable WebSocket server**
4. Configura la contraseña | Set password: `Cualquiera1234` (o la que prefieras | or your preferred)
5. Anota el puerto | Note the port: `4455` (default)

### 4. Configurar config.json

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

### 5. Ejecutar en Desarrollo | Run in Development

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

Este paso crea el ejecutable autocontenido. | This step creates the self-contained executable.

```bash
pnpm package
```

Esto hace: | This does:
1. Construye client y admin | Builds client and admin
2. Copia archivos estáticos a `dist/static/` | Copies static files to `dist/static/`
3. Copia scripts a `dist/scripts/` | Copies scripts to `dist/scripts/`
4. Genera `ospinajuanp-macroboard.exe` | Generates `ospinajuanp-macroboard.exe`

**Output:** `packages/server/dist/ospinajuanp-macroboard.exe`

---

## Crear el Instalador Profesional | Create the Professional Installer

### Paso 1: Construir el .exe (si no lo has hecho) | Build the .exe (if not done)

```bash
pnpm package
```

### Paso 2: Crear directorio para el installer | Create directory for installer

```bash
mkdir packages/server/installer
```

### Paso 3: Descargar e Instalar Inno Setup

Descarga desde | Download from: https://jrsoftware.org/isinfo.php

### Paso 4: Abrir el Script en Inno Setup

Abre en Inno Setup el archivo: `packages/server/scripts/installer.iss`

### Paso 5: Compilar | Compile

En Inno Setup: **Build → Compile** (o presiona `Ctrl+F9`)

### Paso 6: Obtener el Installer

El installer se crea en: | Installer created at:
```
packages/server/installer/ospinajuanp-macroboard-setup.exe
```

### Contenido del Script installer.iss | installer.iss Script Contents

El script `installer.iss` incluye: | The script includes:

- Instalación en `Program Files`
- Creación de acceso directo en Menú Inicio | Start Menu shortcut
- Creación de acceso directo en Escritorio (opcional) | Desktop shortcut (optional)
- Opción de lanzar la aplicación después de instalar | Option to launch after install
- Desinstalador que limpia archivos de configuración | Uninstaller that cleans config files
- Soporte para español e inglés | Support for Spanish and English

---

## Distribuir | Distribution

### Opción A: Distribuir el .exe directamente | Distribute .exe directly

1. Copia toda la carpeta `dist/` | Copy the entire `dist/` folder
2. Zippea y distribuye | Zip and distribute
3. El usuario extrae y ejecuta el .exe | User extracts and runs .exe

### Opción B: Usar el Installer | Use the Installer

1. Distribuye `ospinajuanp-macroboard-setup.exe`
2. El usuario ejecuta el installer
3. El installer maneja todo automáticamente | Installer handles everything automatically

### Carpeta `dist/` completa | Complete `dist/` folder

```
dist/
├── ospinajuanp-macroboard.exe    # Executable principal | Main executable
├── static/                       # Archivos estáticos | Static files
│   ├── client/                   # Cliente móvil | Mobile client
│   └── admin/                    # Panel admin | Admin panel
└── scripts/                      # Scripts
    ├── tray.ps1                  # System tray script
    └── installer.iss             # Script para Inno Setup | Inno Setup script
```

---

## Usar el Servidor | Using the Server

Una vez ejecutándose, el servidor aparece en la bandeja del sistema. | Once running, the server appears in the system tray.

### Menú de la Bandeja | Tray Menu
- **Open Admin**: Abre la UI de administración en el navegador | Opens admin UI in browser
- **Quit**: Cierra el servidor | Closes the server

### Puertos | Ports
- `3000`: Admin UI + Cliente móvil | Admin UI + Mobile client
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
│   ├── src/           # Código fuente | Source code
│   ├── dist/          # Archivos distribuidos | Distributed files
│   │   ├── ospinajuanp-macroboard.exe
│   │   ├── static/
│   │   └── scripts/
│   └── scripts/       # Scripts de build | Build scripts
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

### Error al compilar el installer | Error compiling installer
1. Verifica que Inno Setup esté instalado correctamente | Verify Inno Setup is installed correctly
2. Verifica que `packages/server/dist/` exista y tenga el .exe | Verify `packages/server/dist/` exists and has the .exe
3. Verifica que la ruta en installer.iss sea correcta | Verify the path in installer.iss is correct
