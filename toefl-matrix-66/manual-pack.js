// Manual packager: copy electron dist + app files into a standalone folder
const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const electronDist = path.join(srcDir, 'node_modules', 'electron', 'dist');
const outDir = path.join(srcDir, 'packaged', '66Matrix-win32-x64');
const resourcesDir = path.join(outDir, 'resources');
const appDir = path.join(resourcesDir, 'app');

// Clean output (try, but continue even if locked)
if (fs.existsSync(path.join(srcDir, 'packaged'))) {
  try {
    fs.rmSync(path.join(srcDir, 'packaged'), { recursive: true, force: true });
  } catch (e) {
    console.warn('WARNING: Could not clean packaged dir, will update in-place:', e.message);
  }
}

console.log('Step 1: Copying Electron runtime...');
if (fs.existsSync(path.join(outDir, 'electron.exe'))) {
  console.log('  Electron already present, skipping full copy (in-place update)');
} else {
  copyDirSync(electronDist, outDir);
}

console.log('Step 2: Creating app directory...');
fs.mkdirSync(appDir, { recursive: true });

// Find all asset files in dist/assets (CSS + images etc.)
const assetsDir = path.join(srcDir, 'dist', 'assets');
const assetFiles = [];
if (fs.existsSync(assetsDir)) {
  fs.readdirSync(assetsDir).forEach(f => {
    assetFiles.push('dist/assets/' + f);
  });
}

console.log('Step 3: Copying app files...');
const filesToCopy = [
  'package.json',
  'electron/main.js',
  'electron/preload.js',
  'dist/index.html',
  'dist/audio.js',
  'dist/keyboard.js',
  'dist/main.js',
  'dist/matrix.js',
  'dist/stats.js',
  'dist/storage.js',
  'dist/tooltip.js',
  'dist/importer.js',
  'dist/data/weixin_support.png',
];
assetFiles.forEach(f => filesToCopy.push(f));

filesToCopy.forEach(relPath => {
  const src = path.join(srcDir, relPath);
  const dst = path.join(appDir, relPath);
  const dstDir = path.dirname(dst);
  if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log('  Copied:', relPath);
  } else {
    console.warn('  MISSING:', relPath);
  }
});

// Copy better-sqlite3 node module (native addon)
console.log('Step 4: Copying native modules...');
const sqliteModuleSrc = path.join(srcDir, 'node_modules', 'better-sqlite3');
const sqliteModuleDst = path.join(appDir, 'node_modules', 'better-sqlite3');
if (fs.existsSync(sqliteModuleSrc)) {
  copyDirSync(sqliteModuleSrc, sqliteModuleDst);
  // Also copy bindings and prebuilds
  const bindingsSrc = path.join(srcDir, 'node_modules', 'bindings');
  const bindingsDst = path.join(appDir, 'node_modules', 'bindings');
  if (fs.existsSync(bindingsSrc)) copyDirSync(bindingsSrc, bindingsDst);
  const fileUriSrc = path.join(srcDir, 'node_modules', 'file-uri-to-path');
  const fileUriDst = path.join(appDir, 'node_modules', 'file-uri-to-path');
  if (fs.existsSync(fileUriSrc)) copyDirSync(fileUriSrc, fileUriDst);
  console.log('  Copied: better-sqlite3 + dependencies');
} else {
  console.warn('  WARNING: better-sqlite3 not found in node_modules');
}

// Rename electron.exe to our app name
const srcExe = path.join(outDir, 'electron.exe');
const dstExe = path.join(outDir, '66背词看板.exe');
if (fs.existsSync(srcExe)) {
  fs.copyFileSync(srcExe, dstExe);
  console.log('Step 5: Renamed exe to:', path.basename(dstExe));
}

console.log('\n=== BUILD COMPLETE ===');
console.log('Output:', outDir);
console.log('Executable:', dstExe);
console.log('Size:', (getDirSize(outDir) / 1024 / 1024).toFixed(1), 'MB');

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getDirSize(dir) {
  let size = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) size += getDirSize(p);
      else size += fs.statSync(p).size;
    }
  } catch (e) {}
  return size;
}
