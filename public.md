# Macroboard — Control Virtual de OBS para Streamers

## Serie: Construyendo Macroboard

### POST #1 —

¿Quieres hacer streaming pero no quieres gastar €150+ en un Streamdeck de Elgato para cambiar escenas?

La realidad es que la mayoría de personas que quieren iniciar en el mundo del streaming no tienen (ni quieren) invertir en equipo especializado. Pero casi todos tenemos un celular o tablet viejo con WiFi en algún cajón.

Macroboard resuelve ese problema: reutiliza cualquier dispositivo con navegador como control remoto de OBS Studio. No instalas nada en ese dispositivo, solo abres una URL o escaneas un QR y ya tienes botones táctiles para cambiar escenas, grabar o hacer mute desde el celular.

El proyecto está construido como un monorepo con pnpm, usando TypeScript de extremo a extremo:

- **Server**: Node.js con Fastify + WebSocket para comunicación en tiempo real
- **Admin**: Panel web para configurar los botones
- **Client**: PWA móvil responsiva que se adapta a cualquier pantalla táctil
- **Landing**: Página pública con documentación desplegada en Vercel

Si quieres ver el código o probar el proyecto, el repositorio está abierto en mi GitHub:

👉 https://github.com/ospinajuanp/ospinajuanp-macroboard

Puedes probarlo directamente en: 👉 https://ospinajuanp-macroboard-landing.vercel.app/

Estoy disponible para aportar mis habilidades como Software Developer en equipos de ingeniería. Si buscas a alguien con dominio en arquitecturas full-stack y sistemas en tiempo real, construyamos juntos.

#WebDevelopment #Streaming #OBS #ReactJS #TypeScript #NodeJS #SaaS #JobSearch

### POST #2 —

¿Cómo se comunica un celular con OBS si están en la misma red WiFi pero no hay una app instalada?

La arquitectura de Macroboard usa WebSocket como columna vertebral de la comunicación. Cuando ejecutas el servidor, este levanta dos puertos:

- **Puerto 3000**: Servidor HTTP que sirve el panel admin y el cliente móvil
- **Puerto 3001**: Servidor WebSocket que maneja toda la comunicación en tiempo real

Cuando tocas un botón en el celular, el cliente envía un mensaje JSON por WebSocket:

```typescript
{ type: 'TRIGGER', buttonId: 'scene-1', action: 'OBS_SCENE', payload: 'Pantalla Principal' }
```

El servidor recibe el mensaje, lo interpreta y ejecuta la acción correspondiente contra OBS via obs-websocket-js. El flujo es bidireccional: OBS también notifica al servidor cuando cambia de escena, y ese estado se transmite a todos los clientes conectados.

La diferenciación de puertos permite que el celular y el panel admin estén en la misma URL base pero usen protocolos distintos según la necesidad. Además, al ser un monorepo con paquetes compartidos, los tipos TypeScript de las acciones están definidos en un solo lugar (`shared`) y se reutilizan en server, admin y client.

Si quieres auditar cómo estructuré la comunicación WebSocket o ver los tipos compartidos, te invito a explorar el repositorio:

👉 https://github.com/ospinajuanp/ospinajuanp-macroboard

Estoy disponible para trabajar como Software Developer y aportar soluciones en tiempo real para equipos de ingeniería. El código sigue corriendo.

#WebSocket #RealTime #NodeJS #Architecture #TypeScript #JobSearch

### POST #3 —

Una interfaz de control para streaming debe sentirse inmediata y responder al tacto sin delays perceptibles.

El cliente móvil de Macroboard es una PWA diseñada mobile-first. Cada botón ocupa un espacio táctil considerable (w-20 h-20) para que sea fácil acertar con el dedo sin mirar. Los estados visuales están sincronizados con el estado real de OBS:

- **Normal**: Color del botón configurado
- **Pending**: Opacidad reducida mientras espera confirmación del servidor
- **Success**: Borde verde momentáneo cuando la acción se ejecutó correctamente
- **Error**: Borde rojo cuando algo falló (OBS desconectado, etc.)

La interfaz también muestra en tiempo real si OBS está grabando, en vivo o en qué escena está. Si la conexión WiFi se cae, aparece un overlay de "Reconectando..." con una animación que mantiene al usuario informado sin pánico.

Implementé soporte completo de internacionalización (ES/EN) usando i18next. El idioma se detecta del navegador y se persiste en localStorage. El cambio es instantáneo sin recargar la página.

El cliente se sirve como archivos estáticos desde el build de Vite, lo que lo hace extremadamente ligero y rápido de cargar en cualquier dispositivo móvil.

Si quieres auditar cómo maneje los estados de los botones o la lógica de reconexión, te invito a explorar el código:

👉 https://github.com/ospinajuanp/ospinajuanp-macroboard

Estoy activamente en búsqueda de oportunidades como Software Developer. Si tu equipo necesita alguien con dominio en React y sistemas responsivos, hablemos.

#ReactJS #PWA #MobileFirst #i18n #TailwindCSS #UXDesign #JobSearch

### POST #4 —

Configurar botones de streaming no debería ser un archivo JSON manual. Los streamers necesitan una interfaz visual para esto.

El panel de administración de Macroboard permite crear, editar y reordenar botones mediante drag & drop. Implementé esto con @dnd-kit, una librería moderna de React que maneja toda la complejidad de arrastrar elementos en el DOM sin los bugs tradicionales de otras soluciones.

El flujo para crear un botón es visual:

1. Seleccionas un icono de una grille de emojis (12 opciones)
2. Elegís un color de una paleta predefinida (10 colores Tailwind)
3. Asignás la acción (cambiar escena, toggle mute, hotkey personalizado)
4. Si es una escena, el sistema se conecta a OBS y te muestra las escenas disponibles
5. Si es un hotkey, un selector visual te permite presionar las teclas en secuencia

El panel también incluye un botón "Load Scenes" que consulta OBS, obtiene todas las escenas configuradas y te sugiere crear botones automáticamente para las que aún no tengas. Esto reduce drásticamente el tiempo de configuración inicial.

Todos los cambios se guardan en config.json en tiempo real y se transmiten inmediatamente a todos los clientes conectados via WebSocket.

Si quieres ver cómo implementé el drag & drop o el selector de hotkeys, el código está en el repositorio:

👉 https://github.com/ospinajuanp/ospinajuanp-macroboard

Estoy disponible para aportar mi experiencia en interfaces de usuario intuitivas y código mantenible como Software Developer.

#ReactJS #DragAndDrop #UXDesign #TailwindCSS #CleanCode #JobSearch

### POST #5 —

OBS Studio no tiene una API REST nativa. La comunicación se hace via WebSocket con un protocolo específico que hay que implementar correctamente.

Macroboard usa obs-websocket-js para conectarse a OBS. El protocolo soporta:

- Consultar y cambiar la escena actual
- Toggle de grabación (Start/Stop)
- Toggle de streaming (Start/Stop)
- Toggle de mute de cualquier entrada de audio
- Consulta de eventos en tiempo real (cuando OBS cambia de escena, el servidor se entera)

Implementé un sistema de auto-reconexión: si OBS se reinicia o la conexión se cae, el servidor intenta reconectar hasta 5 veces con delay exponencial. Esto es crucial porque los streamers reinician OBS frecuentemente mientras configuran su escena.

Para los hotkeys personalizados (teclas que no son nativas de OBS), usé PowerShell SendKeys. Windows no permite simular teclas desde Node.js nativamente, así que el servidor ejecuta comandos PowerShell que mandan las pulsaciones al sistema operativo. Esto permite mapear cualquier combinación de teclas que OBS tenga configurada.

El empaquetado del proyecto usa pkg para generar un ejecutable .exe portable. El servidor se distribuye como un único archivo que incluye Node.js, todas las dependencias y los archivos estáticos del cliente y admin. El usuario solo descarga y ejecuta un .exe, sin necesidad de instalar Node.js ni nada más.

Si quieres auditar cómo maneje la conexión con OBS o el proceso de empaquetado, te invito a explorar el repositorio:

👉 https://github.com/ospinajuanp/ospinajuanp-macroboard

Estoy buscando activamente mi próxima oportunidad como Software Developer, listo para aportar soluciones robustas a equipos de ingeniería.

#OBS #WebSocket #NodeJS #Packaging #Windows #SoftwareEngineering #JobSearch

### POST #6 —

Macroboard started como un proyecto para resolver mi propia necesidad: quería controlar OBS desde el celular sin comprar otro gadget. Después de iterar varias versiones, terminé con una arquitectura de monorepo que separa claramente las responsabilidades:

- Server: comunicación en tiempo real, integración con OBS, ejecución de hotkeys
- Admin: interfaz visual para configurar botones
- Client: PWA táctil optimizada para móviles
- Landing: documentación y página pública

Las decisiones técnicas que más orgullo me dan:

1. WebSocket bidireccional: el celular no solo envía acciones, también recibe el estado real de OBS
2. Auto-reconexión inteligente: el sistema se recupera solo cuando OBS se reinicia
3. Drag & drop con @dnd-kit: configuración de botones sin archivos JSON
4. i18n de extremo a extremo: interfaz en español e inglés lista para cualquier streamer hispanohablante o angloparlante

El proyecto sigue en desarrollo activo. Entre las mejoras pendientes están: soporte para múltiples escenas simultáneas, macros configurables, y mejorar el sistema de hotkeys para plataformas diferentes a Windows.

Si te interesa auditar la arquitectura completa, ver los diagramas de comunicación o revisar el código, te invito a explorar mi repositorio:

👉 https://github.com/ospinajuanp/ospinajuanp-macroboard

Estoy activamente disponible para nuevas oportunidades profesionales como Software Developer. Si buscas a alguien con dominio en arquitecturas full-stack, sistemas en tiempo real y pasión por resolver problemas prácticos con código limpio, construyamos algo juntos.

¡Gracias por seguir el proyecto! El código sigue corriendo.

#SoftwareEngineering #JobSearch #FullStackDeveloper #WebDevelopment #ReactJS #TypeScript #Contratando #CleanCode #Streaming

## Próximos Pasos

Para seguir la evolución del proyecto:
- [Landing Page](https://ospinajuanp-macroboard-landing.vercel.app/)
- [Repositorio GitHub](https://github.com/ospinajuanp/ospinajuanp-macroboard)
- [Documentación](./README.md)
