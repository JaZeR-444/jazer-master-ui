const fs = require('fs');
const path = require('path');

const files = [
  'forms.html',
  'layouts.html',
  'navigation.html',
  'media.html',
  'utilities.html',
  'patterns.html',
  'advanced.html'
];

const directoryPath = __dirname;

files.forEach(filename => {
  const filePath = path.join(directoryPath, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the fixed position theme toggle from body
  content = content.replace(
    /<body>\s*<!-- Theme Toggle Button -->\s*<button class="theme-toggle" id="themeToggle"[^>]*>[\s\S]*?<\/button>\s*/,
    '<body>\n'
  );

  // Update favorites toggle section to include inline theme toggle
  content = content.replace(
    /<!-- Favorites Filter Toggle -->\s*<div class="text-center mb-4">\s*<button id="favoritesToggle" class="favorites-toggle">\s*<span id="favoritesCount">0<\/span> Favorites\s*<\/button>\s*<\/div>/,
    `<!-- Favorites Filter Toggle & Theme Toggle -->
    <div class="flex justify-center items-center gap-3 mb-4">
      <button id="favoritesToggle" class="favorites-toggle">
        <span id="favoritesCount">0</span> Favorites
      </button>
      <button class="theme-toggle-inline" id="themeToggle" aria-label="Toggle theme">
        <span class="theme-toggle-icon"></span>
      </button>
    </div>`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${filename} with inline theme toggle`);
});

console.log('\n🎉 All category pages updated with inline theme toggle!');
