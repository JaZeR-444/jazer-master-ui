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

const fixedThemeToggleScript = `    // ==================== Theme Toggle ====================
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

      // Add animation class if button exists
      if (themeToggle) {
        themeToggle.style.animation = 'heartBeat 0.3s ease';
        setTimeout(() => {
          themeToggle.style.animation = '';
        }, 300);
      }
    }

    // Event listener
    if (themeToggle) {
      themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Theme toggle clicked!'); // Debug log
        toggleTheme();
      });
    } else {
      console.error('Theme toggle button not found!'); // Debug log
    }

    // Initialize theme on page load
    initTheme();`;

files.forEach(filename => {
  const filePath = path.join(directoryPath, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the theme toggle section
  const themeTogglePattern = /\/\/ ==================== Theme Toggle ====================[\s\S]*?initTheme\(\);/;

  content = content.replace(themeTogglePattern, fixedThemeToggleScript);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed theme toggle in ${filename}`);
});

console.log('\n🎉 Theme toggle click handlers fixed on all pages!');
