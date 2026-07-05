using System;
using System.Windows.Forms;
using System.Drawing;
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

        ContextMenuStrip menu = new ContextMenuStrip();

        ToolStripMenuItem menuOpen = new ToolStripMenuItem("Open Admin UI");
        menuOpen.Click += delegate { Process.Start("http://localhost:3000/admin"); };
        menu.Items.Add(menuOpen);

        menu.Items.Add(new ToolStripSeparator());

        ToolStripMenuItem menuQuit = new ToolStripMenuItem("Quit");
        menuQuit.Click += delegate { Quit(); };
        menu.Items.Add(menuQuit);

        icon.ContextMenuStrip = menu;

        icon.DoubleClick += delegate {
            Process.Start("http://localhost:3000/admin");
        };

        if (File.Exists(exePath)) {
            ProcessStartInfo psi = new ProcessStartInfo(exePath);
            psi.Environment["TRAYHELPER_LAUNCHED"] = "1";
            serverProc = Process.Start(psi);
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
