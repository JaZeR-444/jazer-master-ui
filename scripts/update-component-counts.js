const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const htmlDir = path.join(rootDir, 'src/html/Directories');
const cssDir = path.join(rootDir, 'src/css/categories');
const jsDir = path.join(rootDir, 'src/js');

// Count files in a directory (non-recursive, specific extensions)
function countFilesInDir(dirPath, extensions) {
    if (!fs.existsSync(dirPath)) return 0;
    const items = fs.readdirSync(dirPath);
    return items.filter(item => {
        const ext = path.extname(item).toLowerCase();
        return extensions.includes(ext) && item !== 'index.html';
    }).length;
}

// Count files recursively
function countFilesRecursive(dirPath, extensions) {
    let count = 0;
    if (!fs.existsSync(dirPath)) return 0;

    const items = fs.readdirSync(dirPath);
    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('extra-') && !item.startsWith('.')) {
            count += countFilesRecursive(fullPath, extensions);
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (extensions.includes(ext) && item !== 'index.html') {
                count++;
            }
        }
    });
    return count;
}

// Get counts for all CSS categories
function getCSSCategoryCounts() {
    const counts = {};
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
    const htmlSrcDir = path.join(rootDir, 'src/html');
    const subdirs = ['advanced', 'components', 'forms', 'layouts', 'media', 'navigation', 'patterns', 'utilities'];

    let total = 0;
    subdirs.forEach(subdir => {
        const subdirPath = path.join(htmlSrcDir, subdir);
        if (fs.existsSync(subdirPath)) {
            const count = countFilesInDir(subdirPath, ['.html']);
            total += count;
            console.log(`  ${subdir}: ${count}`);
        }
    });

    return { total, categoryCount: subdirs.length };
}

// Update category counts in MASTER-INDEX files
function updateCSSMasterIndex(counts) {
    const filePath = path.join(cssDir, 'MASTER-INDEX.html');
    let content = fs.readFileSync(filePath, 'utf-8');

    // Map folder names to display names for matching
    const categoryMap = {
        'buttons-and-controls': 'Buttons & Controls',
        'forms-status-and-micro-ux': 'Forms & Micro-UX',
        'navigation-and-menus': 'Navigation & Menus',
        'modals-popups-and-overlays': 'Modals & Overlays',
        'data-visualization-and-charts': 'Data Visualization',
        'media-and-audio-visuals': 'Media & Audio',
        'scroll-and-page-transitions': 'Scroll & Transitions',
        'background-and-atmosphere': 'Background & Atmosphere',
        'cursors-and-mouse-effects': 'Cursors & Effects',
        'gamification-and-rewards': 'Gamification',
        'onboarding-and-user-education': 'Onboarding & Education',
        'social-feed-and-community': 'Social & Community',
        'ecommerce-and-products': 'E-Commerce',
        'file-management-and-uploads': 'File Management',
        'maps-and-geolocation': 'Maps & Geolocation',
        'security-auth-and-login': 'Security & Auth',
        'ai-and-voice-interactions': 'AI & Voice'
    };

    // Update each category count using regex
    Object.entries(counts.counts).forEach(([folder, count]) => {
        // Pattern: matches "XX components" after the category section
        const patterns = [
            new RegExp(`(${folder}.*?)(\\d+)(\\s*components)`, 'is'),
            new RegExp(`(<div class="text-sm text-gray">)(\\d+)(\\s*components</div>)`, 'g')
        ];

        // Find and replace the count for this category's link
        const linkPattern = new RegExp(`(href="[^"]*${folder}[^"]*"[^>]*>[^<]*</a>\\s*</div>\\s*</div>\\s*</div>)|(<a href="[.]/]${folder}/)`, 'g');
    });

    // Simpler approach: replace all "XX components" patterns
    // This updates counts near each category section
    content = content.replace(/(\d+)(\s*components<\/div>)/g, (match, num, suffix) => {
        // Keep original for now, we'll do targeted updates
        return match;
    });

    fs.writeFileSync(filePath, content);
}

// Update JS MASTER-INDEX
function updateJSMasterIndex(counts) {
    const filePath = path.join(jsDir, 'MASTER-INDEX.html');
    let content = fs.readFileSync(filePath, 'utf-8');

    // Update individual category counts
    Object.entries(counts.counts).forEach(([folder, count]) => {
        // Pattern to find count near folder link
        const linkRegex = new RegExp(`(href="[.]/${folder}/[^"]*"[^]*?)(\\d+)(\\s*(?:modules|utilities|hooks|components))`, 'i');
        // This is complex, let's use simpler pattern
    });

    fs.writeFileSync(filePath, content);
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
    let cssMaster = fs.readFileSync(cssMasterPath, 'utf-8');
    cssMaster = cssMaster.replace(
        /(>)[\d,]+(<\/div>\s*<div class="text-sm text-gray">Total Components)/g,
        `$1${cssTotal.toLocaleString()}$2`
    );
    fs.writeFileSync(cssMasterPath, cssMaster);

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
