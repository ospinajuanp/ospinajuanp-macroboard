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

console.log('Package preparation complete!');

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
