/**
 * Script to add favorites functionality to all category index files
 * Run with: node add-favorites-to-indices.js
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES_DIR = 'C:\\Users\\JaZeR\\HTML-CSS-JS-Library\\[CSS]\\categories';

// Map category folder names to display names
const categoryNameMap = {
    'ai-and-voice-interactions': 'AI & Voice Interactions',
    'background-and-atmosphere': 'Background & Atmosphere',
    'badges-and-labels': 'Badges & Labels',
    'buttons-and-controls': 'Buttons & Controls',
    'cards-and-content-blocks': 'Cards & Content Blocks',
    'chat-and-messaging-interfaces': 'Chat & Messaging Interfaces',
    'cursors-and-mouse-effects': 'Cursors & Mouse Effects',
    'data-visualization-and-charts': 'Data Visualization & Charts',
    'developer-tools': 'Developer Tools',
    'ecommerce-and-products': 'E-commerce & Products',
    'feedback-and-alerts': 'Feedback & Alerts',
    'file-management-and-uploads': 'File Management & Uploads',
    'forms-status-and-micro-ux': 'Forms, Status & Micro-UX',
    'gamification-and-rewards': 'Gamification & Rewards',
    'layout-components': 'Layout Components',
    'maps-and-geolocation': 'Maps & Geolocation',
    'marketing-and-conversion': 'Marketing & Conversion',
    'media-and-audio-visuals': 'Media & Audio Visuals',
    'modals-popups-and-overlays': 'Modals, Popups & Overlays',
    'navigation-and-menus': 'Navigation & Menus',
    'onboarding-and-user-education': 'Onboarding & User Education',
    'scroll-and-page-transitions': 'Scroll & Page Transitions',
    'security-auth-and-login': 'Security, Auth & Login',
    'social-feed-and-community': 'Social Feed & Community',
    'text-and-typography': 'Text & Typography',
    'tools-and-utilities': 'Tools & Utilities'
};

function getCategoryDisplayName(folderName) {
    return categoryNameMap[folderName] || folderName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function addFavoritesToIndex(indexPath, categoryFolder) {
    let content = fs.readFileSync(indexPath, 'utf8');

    // Check if favorites script is already included
    if (content.includes('JaZerFavorites')) {
        console.log(`Skipping ${categoryFolder} - already has favorites`);
        return false;
    }

    const categoryName = getCategoryDisplayName(categoryFolder);

    // The favorites script block to add
    const favoritesBlock = `
    <!-- Favorites Module -->
    <script src="../../../scripts/favorites.js"></script>
    <script>
        // Initialize favorite buttons on component cards
        document.addEventListener('DOMContentLoaded', function () {
            JaZerFavorites.init({
                cardSelector: '.component-card',
                library: 'CSS',
                category: '${categoryName}'
            });
        });
    </script>
`;

    // Insert before </body>
    if (content.includes('</body>')) {
        content = content.replace('</body>', favoritesBlock + '</body>');
        fs.writeFileSync(indexPath, content);
        console.log(`Added favorites to: ${categoryFolder}`);
        return true;
    } else {
        console.log(`Warning: No </body> tag found in ${categoryFolder}`);
        return false;
    }
}

// Get all category directories
const categories = fs.readdirSync(CATEGORIES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

console.log(`Found ${categories.length} categories to process\n`);

let added = 0;
let skipped = 0;

for (const category of categories) {
    const indexPath = path.join(CATEGORIES_DIR, category, 'index.html');
    if (fs.existsSync(indexPath)) {
        try {
            if (addFavoritesToIndex(indexPath, category)) {
                added++;
            } else {
                skipped++;
            }
        } catch (e) {
            console.error(`Error processing ${category}: ${e.message}`);
        }
    }
}

console.log(`\nDone! Added favorites to ${added} categories, skipped ${skipped}.`);
