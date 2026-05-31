import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

function copyAssets() {
  return {
    name: 'copy-assets',
    writeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const srcDir = resolve(__dirname, 'src');
      // Copy JS files
      const jsFiles = ['storage.js','audio.js','tooltip.js','matrix.js','stats.js','keyboard.js','importer.js','main.js'];
      jsFiles.forEach(f => {
        copyFileSync(resolve(srcDir, f), resolve(distDir, f));
      });
      // Copy data directory
      const dataDist = resolve(distDir, 'data');
      if (!existsSync(dataDist)) mkdirSync(dataDist);
      copyFileSync(resolve(srcDir, 'data', 'toefl-words.json'), resolve(dataDist, 'toefl-words.json'));
      // Copy sponsor QR image if exists
      const qrSrc = resolve(srcDir, 'data', 'weixin_support.png');
      if (existsSync(qrSrc)) copyFileSync(qrSrc, resolve(dataDist, 'weixin_support.png'));
    }
  };
}

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  plugins: [copyAssets()],
  server: {
    port: 5173
  }
});
