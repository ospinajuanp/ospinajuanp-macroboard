Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$basePath = Split-Path -Parent $scriptPath
$exePath = Join-Path $basePath "ospinajuanp-macroboard.exe"
$pidFile = Join-Path $basePath ".server.pid"
$quitFile = Join-Path $basePath ".quit"

$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$icon = [System.Drawing.SystemIcons]::Application
$notifyIcon.Icon = $icon
$notifyIcon.Text = "ospinajuanp-macroboard"
$notifyIcon.Visible = $true

$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

$menuOpen = $contextMenu.Items.Add("Open Admin UI", $null, {
    Start-Process "http://localhost:3000/admin"
})

$menuQuit = $contextMenu.Items.Add("Quit", $null, {
    if (Test-Path $pidFile) {
        $serverPid = Get-Content $pidFile -Raw
        try {
            Stop-Process -Id $serverPid -Force -ErrorAction SilentlyContinue
        } catch {}
    }
    $notifyIcon.Visible = $false
    $notifyIcon.Dispose()
    Stop-Process -Id $PID -Force -ErrorAction SilentlyContinue
})

$notifyIcon.ContextMenuStrip = $contextMenu

$notifyIcon.Add_Click({
    param($sender, $e)
    if ($e.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
        Start-Process "http://localhost:3000/admin"
    }
})

$pid = Start-Process -FilePath $exePath -PassThru -WindowStyle Minimized
$null = Set-Content -Path $pidFile -Value $pid.Id

Start-Sleep -Milliseconds 500

$app = New-Object System.Windows.Forms.ApplicationContext
[void][System.Windows.Forms.Application]::Run($app)
