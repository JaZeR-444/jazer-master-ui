const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const csso = require('csso');

const srcDir = path.join(__dirname, '..');
const outDir = path.join(__dirname, '..', 'dist');

function bundleJSFile(srcPath, destPath) {
  try {
    const result = esbuild.buildSync({
      entryPoints: [srcPath],
      bundle: true,
      minify: true,
      write: false,
      platform: 'browser',
    });
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, result.outputFiles[0].text, 'utf8');
  } catch (e) {
    console.error('Failed to bundle', srcPath, e.message);
  }
}

function minifyCSSFile(srcPath, destPath) {
  try {
    const css = fs.readFileSync(srcPath, 'utf8');
    const min = csso.minify(css).css;
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, min, 'utf8');
  } catch (e) {
    console.error('Failed to minify CSS', srcPath, e.message);
  }
}

module.exports = { bundleJSFile, minifyCSSFile };
