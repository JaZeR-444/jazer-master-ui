const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const htmlDir = path.join(rootDir, '[HTML]', 'Directories');
const cssDir = path.join(rootDir, '[CSS]', 'categories');
const jsDir = path.join(rootDir, '[JS]');

const htmlPrefixes = {
    components: 'COMPONENTS',
    forms: 'FORMS',
    layouts: 'LAYOUTS',
    navigation: 'NAVIGATION',
    media: 'MEDIA',
    utilities: 'UTILITIES',
    patterns: 'PATTERNS',
    advanced: 'ADVANCED',
    musician: 'MUSICIAN'
};

// Count files in a directory (non-recursive, specific extensions)
function countFilesInDir(dirPath, extensions) {
    if (!fs.existsSync(dirPath)) return 0;
    const items = fs.readdirSync(dirPath);
    return items.filter(item => {
        const ext = path.extname(item).toLowerCase();
        return extensions.includes(ext) && item !== 'index.html';
    }).length;
}

// Get counts for all CSS categories
function getCSSCategoryCounts() {
    const counts = {};
    if (!fs.existsSync(cssDir)) {
        return { counts, total: 0, categoryCount: 0 };
    }
    const subdirs = fs.readdirSync(cssDir).filter(f => {
        const fullPath = path.join(cssDir, f);
        return fs.statSync(fullPath).isDirectory() && !f.startsWith('extra-');
    });

    let total = 0;
    subdirs.forEach(subdir => {
        const count = countFilesInDir(path.join(cssDir, subdir), ['.html']);
        counts[subdir] = count;
        total += count;
        console.log(`  ${subdir}: ${count}`);
    });

    return { counts, total, categoryCount: subdirs.length };
}

// Get counts for all JS categories
function getJSCategoryCounts() {
    const counts = {};
    if (!fs.existsSync(jsDir)) {
        return { counts, total: 0, categoryCount: 0 };
    }
    const subdirs = fs.readdirSync(jsDir).filter(f => {
        const fullPath = path.join(jsDir, f);
        return fs.statSync(fullPath).isDirectory();
    });

    let total = 0;
    subdirs.forEach(subdir => {
        const count = countFilesInDir(path.join(jsDir, subdir), ['.js']);
        counts[subdir] = count;
        total += count;
        console.log(`  ${subdir}: ${count}`);
    });

    return { counts, total, categoryCount: subdirs.length };
}

// Get HTML counts
function getHTMLCounts() {
    if (!fs.existsSync(htmlDir)) {
        return { total: 0, categoryCount: 0 };
    }

    const files = fs.readdirSync(htmlDir);
    let total = 0;

    Object.entries(htmlPrefixes).forEach(([key, prefix]) => {
        const count = files.filter(file =>
            file.endsWith('.html') &&
            !file.toLowerCase().includes('index') &&
            file.toUpperCase().startsWith(`${prefix}-`)
        ).length;

        total += count;
        console.log(`  ${key}: ${count}`);
    });

    return { total, categoryCount: Object.keys(htmlPrefixes).length };
}

// Update totals on all pages
function updateTotals(htmlTotal, cssTotal, jsTotal) {
    const grandTotal = htmlTotal + cssTotal + jsTotal;

    // Update hub index.html
    const hubPath = path.join(rootDir, 'index.html');
    let hubContent = fs.readFileSync(hubPath, 'utf-8');

    // Update search placeholder
    hubContent = hubContent.replace(
        /Search [\d,]+\+ components across all libraries/g,
        `Search ${grandTotal.toLocaleString()}+ components across all libraries`
    );

    // Update HTML card count
    hubContent = hubContent.replace(
        /(<div class="hub-card-count">)[\d,]+\+?(<\/div>\s*<div class="hub-card-label">Components)/g,
        `$1${htmlTotal}+$2`
    );

    // Update CSS card count  
    hubContent = hubContent.replace(
        /(<div class="hub-card-count">)[\d,]+\+?(<\/div>\s*<div class="hub-card-label">Styles)/g,
        `$1${cssTotal}+$2`
    );

    // Update JS card count
    hubContent = hubContent.replace(
        /(<div class="hub-card-count">)[\d,]+\+?(<\/div>\s*<div class="hub-card-label">Modules)/g,
        `$1${jsTotal}+$2`
    );

    fs.writeFileSync(hubPath, hubContent);
    console.log(`\nUpdated hub: HTML=${htmlTotal}, CSS=${cssTotal}, JS=${jsTotal}, Total=${grandTotal}`);

    // Update CSS MASTER-INDEX total
    const cssMasterPath = path.join(cssDir, 'MASTER-INDEX.html');
    if (fs.existsSync(cssMasterPath)) {
        let cssMaster = fs.readFileSync(cssMasterPath, 'utf-8');
        cssMaster = cssMaster.replace(
            /(>)[\d,]+(<\/div>\s*<div class="text-sm text-gray">Total Components)/g,
            `$1${cssTotal.toLocaleString()}$2`
        );
        fs.writeFileSync(cssMasterPath, cssMaster);
    }

    // Update JS MASTER-INDEX total
    const jsMasterPath = path.join(jsDir, 'MASTER-INDEX.html');
    if (fs.existsSync(jsMasterPath)) {
        let jsMaster = fs.readFileSync(jsMasterPath, 'utf-8');
        jsMaster = jsMaster.replace(
            /(>)[\d,]+\+?(<\/div>\s*<div class="text-sm text-gray">Total Modules)/g,
            `$1${jsTotal}$2`
        );
        fs.writeFileSync(jsMasterPath, jsMaster);
    }
}

// Main
console.log('=== Component Count Report ===\n');

console.log('HTML Components:');
const htmlStats = getHTMLCounts();
console.log(`Total: ${htmlStats.total}\n`);

console.log('CSS Components:');
const cssStats = getCSSCategoryCounts();
console.log(`Total: ${cssStats.total}\n`);

console.log('JS Modules:');
const jsStats = getJSCategoryCounts();
console.log(`Total: ${jsStats.total}\n`);

const grandTotal = htmlStats.total + cssStats.total + jsStats.total;
console.log(`=== GRAND TOTAL: ${grandTotal} ===\n`);

// Update totals
updateTotals(htmlStats.total, cssStats.total, jsStats.total);

console.log('Done!');
