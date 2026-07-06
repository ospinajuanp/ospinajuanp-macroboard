using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

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

            if (!File.Exists(exePath))
            {
                MessageBox.Show("Could not find: " + exePath, "MacroboardLauncher Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Environment.Exit(1);
            }

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = exePath;
            psi.UseShellExecute = true;
            psi.CreateNoWindow = true;
            psi.WorkingDirectory = basePath;

            Process p = Process.Start(psi);
            Environment.Exit(0);
        }
        catch (Exception ex)
        {
            MessageBox.Show("Error: " + ex.Message, "MacroboardLauncher Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Environment.Exit(1);
        }
    }
}
