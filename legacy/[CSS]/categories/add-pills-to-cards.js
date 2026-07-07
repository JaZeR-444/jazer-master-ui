/**
 * Script to add meta-badges to component cards in category index files
 * Run with: node add-pills-to-cards.js
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES_DIR = 'C:\\Users\\JaZeR\\HTML-CSS-JS-Library\\[CSS]\\categories';

// Meta-badge CSS to inject into each index file
const META_BADGE_CSS = `
        .component-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
            margin-top: 0.75rem;
        }

        .meta-badge {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
            border-radius: 8px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.8);
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }

        .meta-badge.complexity-easy {
            background: rgba(57, 255, 20, 0.15);
            border-color: rgba(57, 255, 20, 0.3);
            color: #39ff14;
        }

        .meta-badge.complexity-medium {
            background: rgba(255, 165, 0, 0.15);
            border-color: rgba(255, 165, 0, 0.3);
            color: #ffa500;
        }

        .meta-badge.complexity-advanced {
            background: rgba(255, 0, 110, 0.15);
            border-color: rgba(255, 0, 110, 0.3);
            color: #ff006e;
        }

        .meta-badge.jazer-original {
            background: rgba(147, 51, 234, 0.2);
            border-color: rgba(147, 51, 234, 0.4);
            color: #a855f7;
        }

        .meta-badge.tech-css {
            background: rgba(0, 150, 255, 0.15);
            border-color: rgba(0, 150, 255, 0.3);
            color: #0096ff;
        }

        .meta-badge.tech-js {
            background: rgba(255, 220, 0, 0.15);
            border-color: rgba(255, 220, 0, 0.3);
            color: #ffdc00;
        }
`;

function analyzeComponentFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        const fileSize = fs.statSync(filePath).size;
        const lineCount = content.split('\n').length;
        
        const isJazer = fileName.startsWith('jazer-');
        const hasScript = /<script[\s>]/i.test(content);
        const hasCanvas = /canvas|getContext\(|requestAnimationFrame/i.test(content);
        const hasAPI = /fetch\(|XMLHttpRequest|WebSocket|async\s+function/i.test(content);
        
        // Determine technology
        let tech = 'css'; // Default
        if (hasCanvas || hasAPI) {
            tech = 'advanced';
        } else if (hasScript) {
            tech = 'js';
        }
        
        // Determine complexity
        let complexity = 'easy';
        if (lineCount > 400 || hasCanvas || hasAPI) {
            complexity = 'advanced';
        } else if (lineCount > 150 || hasScript) {
            complexity = 'medium';
        }
        
        return { isJazer, tech, complexity };
    } catch (e) {
        return { isJazer: false, tech: 'css', complexity: 'easy' };
    }
}

function generatePills(analysis) {
    let pills = [];
    
    if (analysis.isJazer) {
        pills.push('<span class="meta-badge jazer-original">💜 JaZeR</span>');
    }
    
    const complexityMap = {
        easy: '<span class="meta-badge complexity-easy">⚡ Easy</span>',
        medium: '<span class="meta-badge complexity-medium">⚡ Medium</span>',
        advanced: '<span class="meta-badge complexity-advanced">⚡ Advanced</span>'
    };
    pills.push(complexityMap[analysis.complexity]);
    
    const techMap = {
        css: '<span class="meta-badge tech-css">🎨 CSS3</span>',
        js: '<span class="meta-badge tech-js">🎨 CSS3 + JS</span>',
        advanced: '<span class="meta-badge tech-js">🔌 CSS3 + JS + APIs</span>'
    };
    pills.push(techMap[analysis.tech]);
    
    return pills.join('\n                        ');
}

function processIndexFile(indexPath) {
    const categoryDir = path.dirname(indexPath);
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Check if meta-badge CSS already exists
    if (!content.includes('.component-meta')) {
        // Inject CSS before .site-footer
        content = content.replace(
            /(\s+\.site-footer\s*\{)/,
            META_BADGE_CSS + '\n$1'
        );
    }
    
    // Find all component cards and add pills
    const cardRegex = /<a href="([^"]+\.html)" class="component-card">\s*<div class="component-icon">[^<]+<\/div>\s*<div class="component-name">[^<]+<\/div>\s*<\/a>/g;
    
    content = content.replace(cardRegex, (match, href) => {
        // Skip if already has component-meta
        if (match.includes('component-meta')) return match;
        
        const componentPath = path.join(categoryDir, href);
        const analysis = analyzeComponentFile(componentPath);
        const pills = generatePills(analysis);
        
        // Insert pills before closing </a>
        return match.replace(
            /<\/a>$/,
            `\n                    <div class="component-meta">\n                        ${pills}\n                    </div>\n                </a>`
        );
    });
    
    fs.writeFileSync(indexPath, content);
    console.log(`Processed: ${indexPath}`);
}

// Get all category directories
const categories = fs.readdirSync(CATEGORIES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

console.log(`Found ${categories.length} categories to process\n`);

for (const category of categories) {
    const indexPath = path.join(CATEGORIES_DIR, category, 'index.html');
    if (fs.existsSync(indexPath)) {
        try {
            processIndexFile(indexPath);
        } catch (e) {
            console.error(`Error processing ${category}: ${e.message}`);
        }
    }
}

console.log('\nDone! All category indices have been updated with pills.');
