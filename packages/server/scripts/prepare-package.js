const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverDist = path.join(__dirname, '..', 'dist');
const staticDir = path.join(serverDist, 'static');

console.log('Building client...');
execSync('pnpm --filter @ospinajuanp-macroboard/client build', {
  cwd: path.join(__dirname, '..', '..', '..'),
  stdio: 'inherit'
});

console.log('Building admin...');
execSync('pnpm --filter @ospinajuanp-macroboard/admin build', {
  cwd: path.join(__dirname, '..', '..', '..'),
  stdio: 'inherit'
});

console.log('Copying static files...');
if (fs.existsSync(staticDir)) {
  fs.rmSync(staticDir, { recursive: true });
}
fs.mkdirSync(staticDir, { recursive: true });

const clientDistSrc = path.join(__dirname, '..', '..', 'client', 'dist');
const adminDistSrc = path.join(__dirname, '..', '..', 'admin', 'out');

if (fs.existsSync(clientDistSrc)) {
  copyDir(clientDistSrc, path.join(staticDir, 'client'));
  console.log('Client built and copied.');
}

if (fs.existsSync(adminDistSrc)) {
  copyDir(adminDistSrc, path.join(staticDir, 'admin'));
  console.log('Admin built and copied.');
}

console.log('Compiling TrayHelper...');
compileTrayHelper();

console.log('Copying scripts...');
const scriptsSrc = path.join(__dirname);
const scriptsDest = path.join(serverDist, 'scripts');
if (fs.existsSync(scriptsDest)) {
  fs.rmSync(scriptsDest, { recursive: true });
}
copyDir(scriptsSrc, scriptsDest);
console.log('Scripts copied.');

console.log('Package preparation complete!');

function compileTrayHelper() {
  const csPath = path.join(__dirname, '..', 'src', 'TrayHelper.cs');
  const exePath = path.join(serverDist, 'TrayHelper.exe');

  if (!fs.existsSync(csPath)) {
    console.log('TrayHelper.cs not found, skipping.');
    return;
  }

  // Try dotnet build first (creates self-contained exe)
  try {
    console.log('Trying dotnet build...');
    execSync(`dotnet build "${csPath}" -c Release -o "${serverDist}" --self-contained false`, {
      stdio: 'inherit',
      timeout: 60000,
      shell: true
    });
    if (fs.existsSync(exePath)) {
      console.log('TrayHelper.exe compiled successfully with dotnet.');
      return;
    }
  } catch (e) {
    console.log('dotnet build failed, trying mcs...');
  }

  // Fallback to mcs with explicit references
  try {
    console.log('Trying mcs with references...');
    const refs = ['System.Windows.Forms.dll', 'System.Drawing.dll', 'System.Data.dll', 'System.dll'];
    const refArgs = refs.map(r => `-r:${r}`).join(' ');
    execSync(`mcs "${csPath}" -out:"${exePath}" -platform:anycpu ${refArgs}`, {
      stdio: 'inherit',
      timeout: 30000,
      shell: true
    });
    if (fs.existsSync(exePath)) {
      console.log('TrayHelper.exe compiled successfully with mcs.');
      return;
    }
  } catch (e) {
    console.log('mcs failed:', e.message);
  }

  console.log('Could not compile TrayHelper.exe. System tray may not work.');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
