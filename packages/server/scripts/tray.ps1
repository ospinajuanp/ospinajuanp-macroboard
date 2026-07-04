Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$basePath = Split-Path -Parent $scriptPath
$exePath = Join-Path $basePath "ospinajuanp-macroboard.exe"
$pidFile = Join-Path $basePath ".server.pid"
$quitFile = Join-Path $basePath ".quit"

function Show-BalloonTip {
    param([string]$Title, [string]$Message, [System.Windows.Forms.ToolTipIcon]$Icon = "Info")

    $notifyIcon.ShowBalloonTip(5000, $Title, $Message, $Icon)
}

$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
$notifyIcon.Text = "ospinajuanp-macroboard"

$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

$menuOpen = $contextMenu.Items.Add("Open Admin UI", $null, {
    Start-Process "http://localhost:3000/admin"
})

$menuQuit = $contextMenu.Items.Add("Quit", $null, {
    $null = Set-Content -Path $quitFile -Value "quit"
    Start-Sleep -Milliseconds 100
    if (Test-Path $pidFile) {
        $serverPid = Get-Content $pidFile -Raw
        try {
            Stop-Process -Id $serverPid -Force -ErrorAction SilentlyContinue
        } catch {}
    }
    $notifyIcon.Visible = $false
    $notifyIcon.Dispose()
    exit
})

$notifyIcon.ContextMenuStrip = $contextMenu
$notifyIcon.Visible = $true

$pid = Start-Process -FilePath $exePath -PassThru -WindowStyle Normal
$null = Set-Content -Path $pidFile -Value $pid.Id

Show-BalloonTip -Title "ospinajuanp-macroboard" -Message "Server started. Click to configure." -Icon Info

$notifyIcon.Add_Click({
    param($sender, $e)
    if ($e.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
        Start-Process "http://localhost:3000/admin"
    }
})

$checkQuitInterval = 500
$checkQuitTimer = New-Object System.Windows.Forms.Timer
$checkQuitTimer.Interval = $checkQuitInterval
$checkQuitTimer.Add_Tick({
    if (Test-Path $quitFile) {
        $notifyIcon.Visible = $false
        $notifyIcon.Dispose()
        exit
    }
})
$checkQuitTimer.Start()

[System.Windows.Forms.Application]::Run($notifyIcon)
