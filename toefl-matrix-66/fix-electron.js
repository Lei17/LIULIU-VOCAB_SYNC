const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const cacheZip = path.join(process.env.LOCALAPPDATA, 'electron', 'Cache', 'electron-v22.3.27-win32-x64.zip');
const electronDist = path.join(__dirname, 'node_modules', 'electron', 'dist');

console.log('Zip exists:', fs.existsSync(cacheZip));
console.log('Target:', electronDist);

const zip = new AdmZip(cacheZip);
console.log('Extracting...');
zip.extractAllTo(electronDist, true);
console.log('Done!');

// Write path.txt
const pathTxt = path.join(__dirname, 'node_modules', 'electron', 'path.txt');
fs.writeFileSync(pathTxt, 'electron.exe', 'utf8');
console.log('path.txt written');

// Check electron.exe exists
const electronExe = path.join(electronDist, 'electron.exe');
console.log('electron.exe exists:', fs.existsSync(electronExe));
