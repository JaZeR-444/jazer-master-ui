const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outputPath = path.join(rootDir, 'search-index.json');

// Helper to format title from filename
function formatTitle(filename) {
    let name = filename.replace(/\.[^/.]+$/, "");
    // Remove prefixes like COMPONENTS-, FORMS-, etc.
    name = name.replace(/^(COMPONENTS|FORMS|LAYOUTS|MEDIA|NAVIGATION|PATTERNS|UTILITIES|ADVANCED)-/i, '');
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Scan directory and collect file info
function scanDirectory(dirPath, basePath, library, category) {
    const results = [];

    if (!fs.existsSync(dirPath)) return results;

    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isFile() && item !== 'index.html') {
            const ext = path.extname(item).toLowerCase();

            // Only index relevant files
            if ((library === 'html' && ext === '.html') ||
                (library === 'css' && ext === '.html') ||
                (library === 'js' && ext === '.js')) {

                const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
                const title = formatTitle(item);

                results.push({
                    title,
                    file: item,
                    path: relativePath,
                    library,
                    category: category || path.basename(dirPath),
                    keywords: item.toLowerCase().replace(/\.[^/.]+$/, "").split('-').filter(w => w.length > 2)
                });
            }
        }
    });

    return results;
}

// Main function
function generateSearchIndex() {
    console.log('Generating search index...\n');

    const index = [];

    // HTML components
    console.log('Scanning HTML components...');
    const htmlDirs = ['advanced', 'components', 'forms', 'layouts', 'media', 'navigation', 'patterns', 'utilities'];
    htmlDirs.forEach(dir => {
        const dirPath = path.join(rootDir, 'src/html', dir);
        const items = scanDirectory(dirPath, 'src/html', 'html', dir);
        index.push(...items);
        console.log(`  ${dir}: ${items.length} items`);
    });

    // CSS components
    console.log('\nScanning CSS components...');
    const cssCategoriesPath = path.join(rootDir, 'src/css/categories');
    const cssSubdirs = fs.readdirSync(cssCategoriesPath).filter(f => {
        const fullPath = path.join(cssCategoriesPath, f);
        return fs.statSync(fullPath).isDirectory() && !f.startsWith('extra-');
    });

    cssSubdirs.forEach(dir => {
        const dirPath = path.join(cssCategoriesPath, dir);
        const items = scanDirectory(dirPath, 'src/css/categories', 'css', dir);
        index.push(...items);
        console.log(`  ${dir}: ${items.length} items`);
    });

    // JS modules
    console.log('\nScanning JS modules...');
    const jsPath = path.join(rootDir, 'src/js');
    const jsSubdirs = fs.readdirSync(jsPath).filter(f => {
        const fullPath = path.join(jsPath, f);
        return fs.statSync(fullPath).isDirectory();
    });

    jsSubdirs.forEach(dir => {
        const dirPath = path.join(jsPath, dir);
        const items = scanDirectory(dirPath, 'src/js', 'js', dir);
        index.push(...items);
        console.log(`  ${dir}: ${items.length} items`);
    });

    // Write index
    fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
    console.log(`\nGenerated search index with ${index.length} items`);
    console.log(`Saved to: ${outputPath}`);
}

generateSearchIndex();
