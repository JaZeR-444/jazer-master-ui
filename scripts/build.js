const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const htmlMinifier = require('html-minifier-terser');
const csso = require('csso');

const srcDir = path.join(__dirname, '..');
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', '.git', '.github', '.qwen', '.vscode', 'docs', 'tests']);
const pathExists = fs.existsSync(srcDir); // ensure repo root exists
if (!pathExists) {
  console.error('Source directory not found');
  process.exit(1);
}
const outDir = path.join(__dirname, '..', 'dist');

// ensure outDir exists
require('rimraf').sync(outDir);
fs.mkdirSync(outDir, { recursive: true });

function copyStaticFiles(srcDir, outDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const outPath = path.join(outDir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      copyStaticFiles(srcPath, outPath);
    } else {
      if (entry.name.endsWith('.html')) {
        const html = fs.readFileSync(srcPath, 'utf8');
        const min = htmlMinifier.minify(html, {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true,
          collapseBooleanAttributes: true,
          minifyCSS: true,
          minifyJS: true,
        });
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, min, 'utf8');
      } else if (entry.name.endsWith('.css')) {
        const css = fs.readFileSync(srcPath, 'utf8');
        const min = csso.minify(css).css;
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, min, 'utf8');
      } else if (entry.name.endsWith('.js')) {
        // bundle/minify using esbuild
        const result = esbuild.buildSync({
          entryPoints: [srcPath],
          bundle: true,
          minify: true,
          write: false,
          platform: 'browser',
        });
        const code = result.outputFiles[0].text;
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, code, 'utf8');
      } else {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.copyFileSync(srcPath, outPath);
      }
    }
  }
}

console.log('Building site...');
copyStaticFiles(srcDir, outDir);
console.log('Build complete. Output in dist/');
