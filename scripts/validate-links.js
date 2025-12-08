const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Parse HTML and find all href links (excluding template literals in scripts)
function extractLinks(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove script tags to avoid picking up template literals
    content = content.replace(/<script[\s\S]*?<\/script>/gi, '');

    const hrefPattern = /href="([^"#]+)"/g;
    const links = [];
    let match;

    while ((match = hrefPattern.exec(content)) !== null) {
        const href = match[1];
        // Skip external links, template vars, and special links
        if (!href.startsWith('http') &&
            !href.startsWith('//') &&
            !href.startsWith('mailto:') &&
            !href.includes('${') &&
            !href.includes('fonts.g')) {
            links.push(href);
        }
    }

    return links;
}

// Check if a file exists relative to another file
function checkLink(sourceFile, href) {
    const sourceDir = path.dirname(sourceFile);
    const targetPath = path.resolve(sourceDir, href);
    return {
        href,
        targetPath,
        exists: fs.existsSync(targetPath)
    };
}

// Scan a file for broken links
function scanFile(filePath, allBroken) {
    const relativePath = path.relative(rootDir, filePath);
    const links = extractLinks(filePath);

    links.forEach(href => {
        const result = checkLink(filePath, href);
        if (!result.exists) {
            allBroken.push({
                source: relativePath,
                href: href,
                fullPath: result.targetPath
            });
        }
    });
}

// Main
function validateLinks() {
    console.log('=== Link Validation Report ===\n');

    const allBroken = [];

    // Scan key files
    const filesToCheck = [
        path.join(rootDir, 'index.html'),
        path.join(rootDir, 'src/html/Directories/ALL-IN-ONE-HOME.html'),
        path.join(rootDir, 'src/css/categories/MASTER-INDEX.html'),
        path.join(rootDir, 'src/js/MASTER-INDEX.html'),
    ];

    // Add all subdirectory index files
    const cssDir = path.join(rootDir, 'src/css/categories');
    const cssSubdirs = fs.readdirSync(cssDir).filter(f => {
        const fullPath = path.join(cssDir, f);
        return fs.statSync(fullPath).isDirectory() && !f.startsWith('extra-');
    });
    cssSubdirs.forEach(subdir => {
        const indexPath = path.join(cssDir, subdir, 'index.html');
        if (fs.existsSync(indexPath)) {
            filesToCheck.push(indexPath);
        }
    });

    const jsDir = path.join(rootDir, 'src/js');
    const jsSubdirs = fs.readdirSync(jsDir).filter(f => {
        const fullPath = path.join(jsDir, f);
        return fs.statSync(fullPath).isDirectory();
    });
    jsSubdirs.forEach(subdir => {
        const indexPath = path.join(jsDir, subdir, 'index.html');
        if (fs.existsSync(indexPath)) {
            filesToCheck.push(indexPath);
        }
    });

    console.log(`Checking ${filesToCheck.length} files...\n`);

    filesToCheck.forEach(file => {
        scanFile(file, allBroken);
    });

    if (allBroken.length === 0) {
        console.log('✅ All links are valid!\n');
    } else {
        console.log(`❌ Found ${allBroken.length} broken links:\n`);
        allBroken.forEach((broken, i) => {
            console.log(`${i + 1}. ${broken.source}`);
            console.log(`   href: ${broken.href}`);
            console.log(`   Expected: ${broken.fullPath}\n`);
        });
    }

    return allBroken;
}

validateLinks();
