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
  const csprojPath = path.join(__dirname, '..', 'src', 'TrayHelper.csproj');
  const exePath = path.join(serverDist, 'TrayHelper.exe');

  if (!fs.existsSync(csprojPath)) {
    console.log('TrayHelper.csproj not found, skipping.');
    return;
  }

  try {
    console.log('Compiling TrayHelper with dotnet...');
    execSync(`dotnet build "${csprojPath}" -c Release -o "${serverDist}" --nologo -v q`, {
      stdio: 'inherit',
      timeout: 120000,
      shell: true,
      cwd: path.join(__dirname, '..', 'src')
    });
    if (fs.existsSync(exePath)) {
      console.log('TrayHelper.exe compiled successfully.');
    } else {
      console.log('TrayHelper.exe not found after build.');
    }
  } catch (e) {
    console.log('Could not compile TrayHelper.exe:', e.message);
    console.log('System tray may not work.');
  }
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
