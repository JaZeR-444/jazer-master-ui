/**
 * Build Search Index - Generates a JSON index of all components
 * Run with: node scripts/build-search-index.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(__dirname, 'search-index.js');

// Extract components from a category index HTML file
function extractComponentsFromIndex(indexPath, library, category) {
    const components = [];

    try {
        const content = fs.readFileSync(indexPath, 'utf8');

        // Match component cards: <a href="filename.html" class="component-card">
        const cardRegex = /<a\s+href="([^"]+\.html)"[^>]*class="[^"]*component-card[^"]*"[^>]*>[\s\S]*?<div class="component-icon">([^<]*)<\/div>[\s\S]*?<div class="component-name">([^<]*)<\/div>/gi;

        let match;
        while ((match = cardRegex.exec(content)) !== null) {
            const [, href, icon, name] = match;

            // Skip index files
            if (href.includes('index.html') || href.startsWith('http')) continue;

            // Build full path relative to root
            const dirPath = path.dirname(indexPath);
            const relativePath = path.relative(ROOT_DIR, path.join(dirPath, href)).replace(/\\/g, '/');

            components.push({
                name: name.trim(),
                path: './' + relativePath,
                category: category,
                library: library,
                icon: icon.trim() || '📦',
                keywords: generateKeywords(name, category)
            });
        }
    } catch (e) {
        console.error(`Error reading ${indexPath}:`, e.message);
    }

    return components;
}

// Generate search keywords from name and category
function generateKeywords(name, category) {
    const words = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);

    const catWords = category.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);

    return [...new Set([...words, ...catWords])];
}

// Convert folder name to display name
function folderToDisplayName(folder) {
    return folder
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
        .replace(/And/g, '&');
}

// Main function
async function buildIndex() {
    console.log('Building search index...\n');
    const allComponents = [];

    // Process CSS categories
    const cssPath = path.join(ROOT_DIR, '[CSS]', 'categories');
    if (fs.existsSync(cssPath)) {
        const categories = fs.readdirSync(cssPath, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const cat of categories) {
            const indexPath = path.join(cssPath, cat, 'index.html');
            if (fs.existsSync(indexPath)) {
                const displayName = folderToDisplayName(cat);
                const components = extractComponentsFromIndex(indexPath, 'CSS', displayName);
                allComponents.push(...components);
                console.log(`  CSS/${cat}: ${components.length} components`);
            }
        }
    }

    // Process HTML components
    const htmlIndexPath = path.join(ROOT_DIR, '[HTML]', 'Directories', 'ALL-IN-ONE-HOME.html');
    if (fs.existsSync(htmlIndexPath)) {
        const components = extractComponentsFromIndex(htmlIndexPath, 'HTML', 'HTML Components');
        allComponents.push(...components);
        console.log(`  HTML: ${components.length} components`);
    }

    // Process JS components
    const jsIndexPath = path.join(ROOT_DIR, '[JS]', 'all-components.html');
    if (fs.existsSync(jsIndexPath)) {
        const components = extractComponentsFromIndex(jsIndexPath, 'JS', 'JavaScript Modules');
        allComponents.push(...components);
        console.log(`  JS: ${components.length} components`);
    }

    // Write index as a JavaScript variable
    const jsContent = `// Auto-generated search index - do not edit manually
// Run: node scripts/build-search-index.js to regenerate
const SEARCH_INDEX_DATA = ${JSON.stringify(allComponents, null, 2)};
`;
    fs.writeFileSync(OUTPUT_FILE, jsContent);

    console.log(`\n✓ Search index created with ${allComponents.length} components`);
    console.log(`  Output: ${OUTPUT_FILE}`);
}

buildIndex();
