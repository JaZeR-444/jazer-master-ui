
const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, '..', '[HTML]', 'Directories')
];

let totalFixed = 0;

function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.html')) {
            processFile(fullPath);
        }
    });
}

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let fixed = false;

        // Fix 1: ../../../css/ -> ../../ (root stylesheet)
        if (content.includes('href="../../../css/jazer-brand.css"')) {
            content = content.replace(
                'href="../../../css/jazer-brand.css"',
                'href="../../jazer-brand.css"'
            );
            fixed = true;
        }

        // Fix 2: Back button linking to index.html from 4 levels deep
        if (content.includes('href="../../../../index.html"')) {
            content = content.replace(
                'href="../../../../index.html"',
                'href="../../index.html"'
            );
            fixed = true;
        }

        if (fixed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${path.basename(filePath)}`);
            totalFixed++;
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

targetDirs.forEach(dir => {
    console.log(`Scanning ${dir}...`);
    walk(dir);
});

console.log(`Total files fixed: ${totalFixed}`);
