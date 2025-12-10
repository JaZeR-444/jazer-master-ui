const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const htmlDir = path.join(rootDir, '[HTML]', 'Directories');
const cssCategoriesDir = path.join(rootDir, '[CSS]', 'categories');
const jsDir = path.join(rootDir, '[JS]');
const templatePath = path.join(htmlDir, 'ALL-IN-ONE-HOME.html');
const outputPath = path.join(rootDir, 'index.html');

// Helper to format title from filename
function formatTitle(filename) {
    // Remove extension
    let name = filename.replace(/\.[^/.]+$/, "");
    // Remove prefixes like COMPONENTS-, FORMS-, etc.
    name = name.replace(/^(COMPONENTS|FORMS|LAYOUTS|MEDIA|NAVIGATION|PATTERNS|UTILITIES|ADVANCED)-/, '');
    // Replace hyphens with spaces and title case
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Helper to determine category from directory
function folderToLabel(folder) {
    return folder
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function scanDirectory(basePath, relativePrefix, categoryName, options = {}) {
    const items = [];
    if (!fs.existsSync(basePath)) return items;

    const { extensions = ['.html'], filter = () => true } = options;
    const files = fs.readdirSync(basePath);
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!extensions.includes(ext)) continue;
        if (file.toLowerCase() === 'index.html' || file.includes('INDEX')) continue;
        if (!filter(file)) continue;

        const title = formatTitle(file);
        const tags = ['general'];
        if (/interactive/i.test(file)) tags.push('interactive');

        items.push({
            title,
            desc: `${title} (${categoryName})`,
            url: `${relativePrefix}/${file}`.replace(/\\/g, '/'),
            tags
        });
    }
    return items;
}

function generateIndex() {
    console.log('Generating index.html...');

    const htmlPrefixes = {
        components: { label: 'UI Component', prefix: 'COMPONENTS' },
        forms: { label: 'Form', prefix: 'FORMS' },
        layouts: { label: 'Layout', prefix: 'LAYOUTS' },
        navigation: { label: 'Navigation', prefix: 'NAVIGATION' },
        media: { label: 'Media', prefix: 'MEDIA' },
        utilities: { label: 'Utility', prefix: 'UTILITIES' },
        patterns: { label: 'Pattern', prefix: 'PATTERNS' },
        advanced: { label: 'Advanced', prefix: 'ADVANCED' },
        musician: { label: 'Musician', prefix: 'MUSICIAN' }
    };

    const database = {};

    // HTML directories categorized by filename prefix
    for (const [key, config] of Object.entries(htmlPrefixes)) {
        database[key] = scanDirectory(
            htmlDir,
            './[HTML]/Directories',
            config.label,
            {
                filter: (file) => file.toUpperCase().startsWith(`${config.prefix}-`),
                extensions: ['.html']
            }
        );
    }

    // CSS components aggregated across categories
    database.css = [];
    if (fs.existsSync(cssCategoriesDir)) {
        const categories = fs.readdirSync(cssCategoriesDir, { withFileTypes: true }).filter(d => d.isDirectory());
        for (const category of categories) {
            const catPath = path.join(cssCategoriesDir, category.name);
            const rel = `./[CSS]/categories/${category.name}`;
            const label = `CSS ${folderToLabel(category.name)}`;
            database.css.push(...scanDirectory(catPath, rel, label, { extensions: ['.html'] }));
        }
    }

    // JavaScript modules organized by direct subdirectories
    database.javascript = [];
    if (fs.existsSync(jsDir)) {
        const jsSections = fs.readdirSync(jsDir, { withFileTypes: true }).filter(d => d.isDirectory());
        for (const section of jsSections) {
            const sectionPath = path.join(jsDir, section.name);
            const rel = `./[JS]/${section.name}`;
            const label = `JavaScript ${folderToLabel(section.name)}`;
            database.javascript.push(...scanDirectory(sectionPath, rel, label, { extensions: ['.js'] }));
        }
    }

    // calculate totals
    let totalComponents = 0;
    Object.values(database).forEach(arr => totalComponents += arr.length);

    // Read Template
    let html = fs.readFileSync(templatePath, 'utf8');

    // Update CSS link in template to use root stylesheet
    html = html.replace(/href="\.\.\/\.\.\/css\/jazer-brand\.css"/g, 'href="./jazer-brand.css"');

    // Inject the live database
    const dbString = JSON.stringify(database, null, 2);
    // Regex to replace the hardcoded componentDatabase object
    // looking for "const componentDatabase = {" up to "};"
    // This is risky with regex. Use a safe replacement marker if possible, or careful string search.

    const startMarker = 'const componentDatabase = {';

    const startIndex = html.indexOf(startMarker);
    if (startIndex !== -1) {
        // Find the matching closing brace is hard with simple search.
        // But we know the file structure. It ends before "const globalSearch".
        const nextVar = 'const globalSearch';
        const endIndex = html.indexOf(nextVar);

        // Find the last "};" before "const globalSearch"
        const blockEnd = html.lastIndexOf('};', endIndex);

        if (blockEnd !== -1) {
            const pre = html.substring(0, startIndex);
            const post = html.substring(blockEnd + 2);
            html = pre + `const componentDatabase = ${dbString};` + post;
        }
    }

    // Update Statistics
    html = html.replace(/>245+</g, `>${totalComponents}+<`);

    // Update category links to point to the actual directories
    html = html.replace(/href="\.\/components\.html"/g, 'href="./[HTML]/Directories/components.html"');
    html = html.replace(/href="\.\/forms\.html"/g, 'href="./[HTML]/Directories/forms.html"');
    html = html.replace(/href="\.\/layouts\.html"/g, 'href="./[HTML]/Directories/layouts.html"');
    html = html.replace(/href="\.\/navigation\.html"/g, 'href="./[HTML]/Directories/navigation.html"');
    html = html.replace(/href="\.\/media\.html"/g, 'href="./[HTML]/Directories/media.html"');
    html = html.replace(/href="\.\/utilities\.html"/g, 'href="./[HTML]/Directories/utilities.html"');
    html = html.replace(/href="\.\/patterns\.html"/g, 'href="./[HTML]/Directories/patterns.html"');
    html = html.replace(/href="\.\/advanced\.html"/g, 'href="./[HTML]/Directories/advanced.html"');

    // Inject CSS and JS Cards into the Grid
    const jsCard = `
        <!-- JavaScript Section -->
        <div class="card card-interactive p-6 slide-up" style="animation-delay: 1.05s;">
          <div class="flex items-center mb-3">
            <div class="text-3xl mr-4" style="filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));">⚡</div>
            <div>
              <h2 class="text-2xl font-bold gradient-text">JavaScript</h2>
              <div class="text-sm text-gray">${database.javascript.length} modules</div>
            </div>
          </div>
          <p class="text-gray mb-4">Vanilla JavaScript components, utilities, and lightweight modules for interactivity</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="badge badge-cyan">Modules</span>
            <span class="badge badge-purple">Classes</span>
            <span class="badge badge-pink">Logic</span>
          </div>
          <a href="#" onclick="document.getElementById('globalSearch').value='JavaScript'; document.getElementById('globalSearch').dispatchEvent(new Event('input')); return false;" class="btn">Browse Scripts</a>
        </div>
    `;

    const cssCard = `
        <!-- CSS Section -->
        <div class="card card-interactive p-6 slide-up" style="animation-delay: 1.08s;">
          <div class="flex items-center mb-3">
            <div class="text-3xl mr-4" style="filter: drop-shadow(0 0 10px rgba(0, 191, 255, 0.5));">🎨</div>
            <div>
              <h2 class="text-2xl font-bold gradient-text">CSS Library</h2>
              <div class="text-sm text-gray">${database.css.length} styles</div>
            </div>
          </div>
          <p class="text-gray mb-4">Pure CSS component styles, base resets, and utility classes</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="badge badge-cyan">Styles</span>
            <span class="badge badge-purple">Variables</span>
            <span class="badge badge-pink">Themes</span>
          </div>
          <a href="#" onclick="document.getElementById('globalSearch').value='CSS'; document.getElementById('globalSearch').dispatchEvent(new Event('input')); return false;" class="btn">Browse Styles</a>
        </div>
    `;

    // Insert before "Advanced Components" card to keep the grid looking good
    const advancedCardMarker = '<!-- Advanced Components Section -->';
    if (html.includes(advancedCardMarker)) {
        html = html.replace(advancedCardMarker, jsCard + cssCard + advancedCardMarker);
    } else {
        // Fallback: Just insert before the closing div of the grid
        html = html.replace('<!-- Advanced Components Section -->', jsCard + cssCard + '<!-- Advanced Components Section -->');
    }

    fs.writeFileSync(outputPath, html);
    console.log('Index generated at ' + outputPath);
}

generateIndex();
