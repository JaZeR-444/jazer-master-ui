const fs = require('fs');
const path = require('path');

// Configuration now points to the live library directories at repo root
const TEMPLATE_PATH = path.join(__dirname, '..', 'template.html');
const HTML_DIRECTORIES = path.join(__dirname, '..', '[HTML]', 'Directories');

const args = process.argv.slice(2);

if (args.length < 1) {
    console.error('Usage: npm run create <component-name> [category]');
    console.error('Example: npm run create my-button components');
    process.exit(1);
}

const componentName = args[0];
const category = (args[1] || 'components').toLowerCase();

// All HTML examples now live under [HTML]/Directories.
// The map stays flexible in case we re-introduce subfolders later.
const folderMap = {
    'components': HTML_DIRECTORIES,
    'forms': HTML_DIRECTORIES,
    'layouts': HTML_DIRECTORIES,
    'navigation': HTML_DIRECTORIES,
    'media': HTML_DIRECTORIES,
    'utilities': HTML_DIRECTORIES,
    'patterns': HTML_DIRECTORIES,
    'advanced': HTML_DIRECTORIES,
    'musician': HTML_DIRECTORIES
};

const targetDir = folderMap[category] || HTML_DIRECTORIES;

const prefixMap = {
    'components': 'COMPONENTS',
    'forms': 'FORMS',
    'layouts': 'LAYOUTS',
    'navigation': 'NAVIGATION',
    'media': 'MEDIA',
    'utilities': 'UTILITIES',
    'patterns': 'PATTERNS',
    'advanced': 'ADVANCED',
    'musician': 'MUSICIAN'
};

// Standardize filename: COMPONENTS-my-button.html
const filePrefix = prefixMap[category] || category.toUpperCase();
const slug = componentName.toLowerCase().trim().replace(/\s+/g, '-');
const fileName = `${filePrefix}-${slug}.html`;
const filePath = path.join(targetDir, fileName);

// Determine Title
const title = componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

console.log(`Creating component: ${title}`);
console.log(`Target: ${filePath}`);

// Ensure directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Check if file exists
if (fs.existsSync(filePath)) {
    console.error('Error: File already exists!');
    process.exit(1);
}

// Read and process template
try {
    let content = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    content = content.replace(/{{TITLE}}/g, title);

    fs.writeFileSync(filePath, content);
    console.log('✅ Component created successfully!');
} catch (err) {
    console.error('Error writing file:', err);
    process.exit(1);
}
