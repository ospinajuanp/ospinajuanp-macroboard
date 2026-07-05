using System;
using System.Windows.Forms;
using System.Diagnostics;
using System.IO;
using System.Threading;

static class TrayProgram
{
    private static NotifyIcon icon;
    private static Process serverProc;
    private static string pidFile;
    private static string quitFile;

    [STAThread]
    static void Main()
    {
        Application.EnableVisualStyles();

        string basePath = AppDomain.CurrentDomain.BaseDirectory;
        string exePath = Path.Combine(basePath, "ospinajuanp-macroboard.exe");
        pidFile = Path.Combine(basePath, ".server.pid");
        quitFile = Path.Combine(basePath, ".quit");

        icon = new NotifyIcon();
        icon.Icon = SystemIcons.Application;
        icon.Text = "ospinajuanp-macroboard";
        icon.Visible = true;

        ContextMenu menu = new ContextMenu();
        menu.MenuItems.Add("Open Admin UI", delegate {
            Process.Start("http://localhost:3000/admin");
        });
        menu.MenuItems.Add("-");
        menu.MenuItems.Add("Quit", delegate {
            Quit();
        });
        icon.ContextMenu = menu;

        icon.DoubleClick += delegate {
            Process.Start("http://localhost:3000/admin");
        };

        if (File.Exists(exePath)) {
            serverProc = Process.Start(exePath);
            File.WriteAllText(pidFile, serverProc.Id.ToString());
        }

        Thread quitThread = new Thread(delegate() {
            while (!File.Exists(quitFile)) {
                Thread.Sleep(500);
            }
            Application.Exit();
        });
        quitThread.Start();

        Application.Run();
    }

    static void Quit() {
        if (serverProc != null && !serverProc.HasExited) {
            serverProc.Kill();
        }
        if (File.Exists(pidFile)) File.Delete(pidFile);
        icon.Visible = false;
        icon.Dispose();
        Application.Exit();
    }
}
