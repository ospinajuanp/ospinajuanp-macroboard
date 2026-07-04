; Inno Setup Script for ospinajuanp-macroboard
; This script creates a Windows installer for the macroboard server

#define MyAppName "ospinajuanp-macroboard"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "ospinajuanp"
#define MyAppURL "https://github.com/ospinajuanp/ospinajuanp-macroboard"
#define MyAppExeName "ospinajuanp-macroboard.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
AppId={{B5F4E8A1-2C3D-4E5F-9A1B-8C7D6E5F4A3B}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableProgramGroupPage=yes
; RequireAdministrator elevation
PrivilegesRequired=admin
; Output settings
OutputDir=..\installer
OutputBaseFilename=ospinajuanp-macroboard-setup
; Compression
Compression=lzma2
SolidCompression=yes
; Modern look
WizardStyle=modern
; UAC manifest
ManifestUACExecutionLevel=requireAdministrator

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Main executable
Source: "..\dist\ospinajuanp-macroboard.exe"; DestDir: "{app}"; Flags: ignoreversion
; Static files (client and admin builds)
Source: "..\dist\static\*"; DestDir: "{app}\static"; Flags: ignoreversion recursesubdirs createallsubdirs
; Scripts (tray.ps1)
Source: "..\dist\scripts\*"; DestDir: "{app}\scripts"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Start Menu shortcut
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
; Desktop shortcut
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; Launch application after installation (optional - user can uncheck)
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; Clean up config files on uninstall (optional - comment out to keep config)
Type: filesandordirs; Name: "{app}\config.json"
Type: filesandordirs; Name: "{app}\.quit"
Type: filesandordirs; Name: "{app}\.server.pid"

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;
