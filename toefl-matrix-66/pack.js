const { packager } = require('@electron/packager');

async function build() {
  try {
    const appPaths = await packager({
      dir: '.',
      name: '66Matrix',
      platform: 'win32',
      arch: 'x64',
      out: 'packaged',
      overwrite: true,
      electronVersion: '22.3.27',
      prune: true,
      ignore: [
        /^\/src\//,
        /^\/build\//,
        /generate-words\.js/,
        /fix-electron\.js/,
        /pack\.js/,
        /\.md$/
      ]
    });
    console.log('Build SUCCESS!');
    console.log('Output:', appPaths);
  } catch (err) {
    console.error('Build FAILED:', err.message);
    console.error(err.stack);
  }
}

build();
