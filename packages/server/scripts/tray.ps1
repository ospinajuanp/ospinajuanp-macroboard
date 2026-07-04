Add-Type -AssemblyName System.Windows.Forms

$basePath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$exePath = Join-Path $basePath "ospinajuanp-macroboard.exe"
$pidFile = Join-Path $basePath ".server.pid"
$quitFile = Join-Path $basePath ".quit"

$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
$notifyIcon.Text = "ospinajuanp-macroboard"
$notifyIcon.Visible = $true

$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip
$contextMenu.Items.Add("Open Admin UI", $null, { Start-Process "http://localhost:3000/admin" })
$contextMenu.Items.Add("Quit", $null, {
    if (Test-Path $pidFile) {
        $pid = Get-Content $pidFile -Raw
        Stop-Process $pid -Force -ErrorAction SilentlyContinue
    }
    $notifyIcon.Visible = $false
    $notifyIcon.Dispose()
    exit
})
$notifyIcon.ContextMenuStrip = $contextMenu

$notifyIcon.Add_Click({
    param($s, $e)
    if ($e.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
        Start-Process "http://localhost:3000/admin"
    }
})

$proc = Start-Process $exePath -PassThru
Set-Content $pidFile $proc.Id

while (!$proc.HasExited -and (Test-Path $quitFile) -eq $false) {
    Start-Sleep 1
}

if (Test-Path $quitFile) {
    Remove-Item $quitFile -ErrorAction SilentlyContinue
    if (!$proc.HasExited) { Stop-Process $proc.Id -Force }
}

$notifyIcon.Visible = $false
$notifyIcon.Dispose()
