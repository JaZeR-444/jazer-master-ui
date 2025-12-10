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

files.forEach(filename => {
  const filePath = path.join(directoryPath, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if theme toggle already exists
  if (content.includes('theme-toggle')) {
    console.log(`✓ ${filename} already has theme toggle`);
    return;
  }

  // Add theme toggle button after <body> tag
  content = content.replace(
    /<body>/,
    `<body>
  <!-- Theme Toggle Button -->
  <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
    <span class="theme-toggle-icon"></span>
  </button>
`
  );

  // Add theme toggle JavaScript before closing </script> tag
  const themeScript = `
    // ==================== Theme Toggle ====================
    const THEME_KEY = 'jazer-theme';
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    // Initialize theme from localStorage or default to dark
    function initTheme() {
      const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
      htmlElement.setAttribute('data-theme', savedTheme);
    }

    // Toggle theme
    function toggleTheme() {
      const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem(THEME_KEY, newTheme);

      // Add animation class
      themeToggle.style.animation = 'heartBeat 0.3s ease';
      setTimeout(() => {
        themeToggle.style.animation = '';
      }, 300);
    }

    // Event listener
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // Initialize theme on page load
    initTheme();
  </script>`;

  content = content.replace('  </script>', themeScript);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Added theme toggle to ${filename}`);
});

console.log('\n🎉 Theme toggle added to all pages!');
