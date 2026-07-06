using System;
using System.Diagnostics;
using System.IO;

class MacroboardLauncher
{
    static void Main()
    {
        string basePath = AppDomain.CurrentDomain.BaseDirectory;
        string exePath = Path.Combine(basePath, "ospinajuanp-macroboard.exe");
        string appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "ospinajuanp-macroboard"
        );

        if (!Directory.Exists(appDataPath))
        {
            Directory.CreateDirectory(appDataPath);
        }

        ProcessStartInfo psi = new ProcessStartInfo();
        psi.FileName = exePath;
        psi.UseShellExecute = false;
        psi.CreateNoWindow = true;
        psi.WorkingDirectory = basePath;

        try
        {
            Process p = Process.Start(psi);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Failed to start: " + ex.Message);
        }
    }
}
