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

### Usando el .exe Directo | Using the .exe Directly

1. Descarga | Download `ospinajuanp-macroboard.exe` desde | from releases
2. Crea una carpeta y coloca el .exe dentro | Create a folder and place the .exe inside
3. Ejecuta el .exe | Run the .exe

---

## Comandos de Producción | Production Commands

Después de clonar el repositorio, sigue este orden: | After cloning the repository, follow this order:

```bash
# 1. Actualizar repositorio | Update repository
git pull

# 2. Instalar dependencias | Install dependencies
pnpm install

# 3. Limpiar builds anteriores | Clean previous builds
pnpm clean

# 4. Construir todos los paquetes | Build all packages
pnpm build

# 5. Preparar archivos estáticos | Prepare static files
pnpm --filter .\packages\server\ prepackage

# 6. Crear ejecutable autocontenido | Create self-contained executable
pnpm package
```

### Crear el Instalador | Create the Installer

```bash
# 7. Crear directorio para el installer | Create installer directory
pnpm --filter @ospinajuanp-macroboard/server prepare-installer

# 8. Abrir en Inno Setup | Open in Inno Setup
# Abre: packages/server/scripts/installer.iss

# 9. Compilar en Inno Setup | Compile in Inno Setup
# Menu: Build -> Compile o Ctrl+F9
```

---

## Configurar OBS | Configure OBS

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

**Output:** `packages/server/dist/ospinajuanp-macroboard.exe`

---

## Estructura del Dist | Dist Structure

```
dist/
├── ospinajuanp-macroboard.exe    # Executable principal | Main executable
├── static/                       # Archivos estáticos | Static files
│   ├── client/                   # Cliente móvil | Mobile client
│   └── admin/                    # Panel admin | Admin panel
└── scripts/                      # Scripts
    ├── tray.ps1                  # System tray script (FUTURO)
    └── installer.iss             # Script para Inno Setup | Inno Setup script
```

---

## System Tray (Deshabilitado temporalmente | Temporarily Disabled)

El system tray está **temporalmente deshabilitado** debido a problemas con la compilación de TrayHelper.exe en diferentes sistemas.

**Estado actual:**
- La consola de comandos aparece al ejecutar
- El servidor funciona correctamente
- La UI del admin está accesible en http://localhost:3000/admin

**Para deshabilitar completamente la consola:**
Crear un archivo `launcher.vbs` en la misma carpeta que el .exe:

```vbscript
Set shell = CreateObject("WScript.Shell")
shell.Run """ospinajuanp-macroboard.exe""", 0, False
```

**Estado planeado:**
- Re-habilitar system tray cuando TrayHelper compile de forma más confiable
- Ocultar consola usando un launcher de C#

---

## Funcionalidades | Features

- Integración completa con OBS | Full OBS integration
- Hotkeys configurables (SendKeys de PowerShell) | Configurable hotkeys (PowerShell SendKeys)
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
pnpm dev                  # Ejecutar todos en modo desarrollo | Run all in dev mode
pnpm build                # Construir todos los paquetes | Build all packages
pnpm clean                # Limpiar build y config.json | Clean build and config.json
pnpm lint                 # Linting
pnpm typecheck            # Verificación de tipos | Type checking
pnpm package              # Crear .exe | Create .exe
pnpm prepare-installer    # Crear directorio para el installer | Create installer directory
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

---

## Licencia | License

Este proyecto está licenciado bajo la [Polyform Noncommercial License 1.0.0](LICENSE.md).

This project is licensed under the [Polyform Noncommercial License 1.0.0](LICENSE.md).

Eres libre de ver, fork y modificar el código para uso personal, educativo o de portafolio.
**El uso comercial no está permitido** sin un acuerdo escrito separado del autor.

You are free to view, fork, and modify the code for personal, educational, or portfolio purposes.
**Commercial use is not permitted** without a separate written agreement from the author.

(c) 2026 Juan Pablo Ospina Restrepo.
