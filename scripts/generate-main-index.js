const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const templatePath = path.join(srcDir, 'html/Directories/ALL-IN-ONE-HOME.html');
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
function getCategory(dirName) {
    // Map directory names to database categories
    const map = {
        'components': 'components',
        'forms': 'forms',
        'layouts': 'layouts',
        'navigation': 'navigation',
        'media': 'media',
        'utilities': 'utilities',
        'patterns': 'patterns',
        'advanced': 'advanced',
        'js-components': 'javascript',
        'css-categories': 'css'
    };
    return map[dirName] || 'other';
}

function scanDirectory(basePath, relativePrefix, categoryName) {
    const items = [];
    if (!fs.existsSync(basePath)) return items;

    const files = fs.readdirSync(basePath);
    for (const file of files) {
        if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
            // Skip index files if they exist in subfolders to avoid clutter
            if (file.includes('INDEX') || file === 'index.html') continue;

            const title = formatTitle(file);
            // Simple tag generation
            const tags = ['general'];
            if (file.includes('interactive')) tags.push('interactive');

            items.push({
                title: title,
                desc: `${title} (${categoryName})`, // Placeholder description
                url: `${relativePrefix}/${file}`,
                tags: tags
            });
        }
    }
    return items;
}

function generateIndex() {
    console.log('Generating index.html...');

    const database = {
        components: scanDirectory(path.join(srcDir, 'html/components'), './src/html/components', 'UI Component'),
        forms: scanDirectory(path.join(srcDir, 'html/forms'), './src/html/forms', 'Form'),
        layouts: scanDirectory(path.join(srcDir, 'html/layouts'), './src/html/layouts', 'Layout'),
        navigation: scanDirectory(path.join(srcDir, 'html/navigation'), './src/html/navigation', 'Navigation'),
        media: scanDirectory(path.join(srcDir, 'html/media'), './src/html/media', 'Media'),
        utilities: scanDirectory(path.join(srcDir, 'html/utilities'), './src/html/utilities', 'Utility'),
        patterns: scanDirectory(path.join(srcDir, 'html/patterns'), './src/html/patterns', 'Pattern'),
        advanced: scanDirectory(path.join(srcDir, 'html/advanced'), './src/html/advanced', 'Advanced'),
        // New Categories
        javascript: scanDirectory(path.join(srcDir, 'js/components'), './src/js/components', 'JavaScript'),
        css: scanDirectory(path.join(srcDir, 'css/categories'), './src/css/categories', 'CSS')
    };

    // calculate totals
    let totalComponents = 0;
    Object.values(database).forEach(arr => totalComponents += arr.length);

    // Read Template
    let html = fs.readFileSync(templatePath, 'utf8');

    // FIX PORTS: 
    // 1. Update CSS/JS links in head/body to relative to root
    html = html.replace(/href="\.\.\/\.\.\/css\/jazer-brand\.css"/g, 'href="./src/css/jazer-brand.css"');

    // 2. Inject the REAL database
    const dbString = JSON.stringify(database, null, 2);
    // Regex to replace the hardcoded componentDatabase object
    // looking for "const componentDatabase = {" up to "};"
    // This is risky with regex. Use a safe replacement marker if possible, or careful string search.

    const startMarker = 'const componentDatabase = {';
    const endMarker = '};'; // Looking for the closing brace of the object

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

    // 3. Update Statistics
    html = html.replace(/>245+</g, `>${totalComponents}+<`);

    // 4. Update Category Links to be useless or point to search?
    // The template has hardcoded links like <a href="./components.html">. 
    // Since we don't have those category pages at root anymore (they are deep in src/html?), 
    // AND we want a "Single Page" feel, we might want to make those links just trigger a search or scroll?
    // For now, let's leave them, but they will 404 if we don't move the category pages too.
    // Wait, the user said "I want all three of the main folders within the src folder to live within a singular html".
    // So distinct category pages might not be needed if the search/dashboard is good enough.
    // But to be safe, let's update them to point to `src/html/directories/components.html` IF they exist?
    // Checking file list: `src/html/components.html` exists? No, `src/html/Directories/components.html`.
    // So `<a href="./components.html">` should become `<a href="./src/html/Directories/components.html">`.

    html = html.replace(/href="\.\/components\.html"/g, 'href="./src/html/Directories/components.html"');
    html = html.replace(/href="\.\/forms\.html"/g, 'href="./src/html/Directories/forms.html"');
    html = html.replace(/href="\.\/layouts\.html"/g, 'href="./src/html/Directories/layouts.html"');
    html = html.replace(/href="\.\/navigation\.html"/g, 'href="./src/html/Directories/navigation.html"');
    html = html.replace(/href="\.\/media\.html"/g, 'href="./src/html/Directories/media.html"');
    html = html.replace(/href="\.\/utilities\.html"/g, 'href="./src/html/Directories/utilities.html"');
    html = html.replace(/href="\.\/patterns\.html"/g, 'href="./src/html/Directories/patterns.html"');
    html = html.replace(/href="\.\/advanced\.html"/g, 'href="./src/html/Directories/advanced.html"');

    // 5. Inject CSS and JS Cards into the Grid
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
