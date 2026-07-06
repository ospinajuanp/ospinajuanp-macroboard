using System;
using System.Diagnostics;
using System.IO;

class MacroboardLauncher
{
    static void Main()
    {
        try
        {
            string basePath = AppDomain.CurrentDomain.BaseDirectory;
            string exePath = Path.Combine(basePath, "ospinajuanp-macroboard.exe");

            // Create app data directory for config
            string appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "ospinajuanp-macroboard"
            );

            if (!Directory.Exists(appDataPath))
            {
                Directory.CreateDirectory(appDataPath);
            }

            // Log startup
            string logPath = Path.Combine(appDataPath, "launcher.log");
            File.AppendAllText(logPath, $"[{DateTime.Now}] Launcher starting. BasePath: {basePath}\n");
            File.AppendAllText(logPath, $"[{DateTime.Now}] ExePath: {exePath}\n");
            File.AppendAllText(logPath, $"[{DateTime.Now}] Exe exists: {File.Exists(exePath)}\n");

            if (!File.Exists(exePath))
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] ERROR: Exe not found\n");
                Environment.Exit(1);
            }

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = exePath;
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            psi.WorkingDirectory = basePath;

            File.AppendAllText(logPath, $"[{DateTime.Now}] Starting process...\n");
            Process p = Process.Start(psi);
            File.AppendAllText(logPath, $"[{DateTime.Now}] Process started with PID: {p.Id}\n");
            Environment.Exit(0);
        }
        catch (Exception ex)
        {
            string appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "ospinajuanp-macroboard"
            );
            string logPath = Path.Combine(appDataPath, "launcher.log");
            File.AppendAllText(logPath, $"[{DateTime.Now}] ERROR: {ex.Message}\n{ex.StackTrace}\n");
            Environment.Exit(1);
        }
    }
}
