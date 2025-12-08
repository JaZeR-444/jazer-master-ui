const fs = require('fs');
const path = require('path');

const files = [
  'components.html',
  'forms.html',
  'layouts.html',
  'navigation.html',
  'media.html',
  'utilities.html',
  'patterns.html',
  'advanced.html',
  'ALL-IN-ONE-HOME.html'
];

const directoryPath = __dirname;

// Inline script to prevent flash of wrong theme
const immediateThemeScript = `  <script>
    // Apply theme immediately before page renders to prevent flash
    (function() {
      const savedTheme = localStorage.getItem('jazer-theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    })();
  </script>
`;

files.forEach(filename => {
  const filePath = path.join(directoryPath, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if immediate theme script already exists
  if (content.includes('Apply theme immediately')) {
    console.log(`✓ ${filename} already has immediate theme script`);
    return;
  }

  // Add inline script right before </head>
  content = content.replace(
    /<\/head>/,
    `${immediateThemeScript}</head>`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Added immediate theme script to ${filename}`);
});

console.log('\n🎉 Immediate theme loading added to all pages!');
console.log('✨ Theme will now persist seamlessly across all pages without flash!');
