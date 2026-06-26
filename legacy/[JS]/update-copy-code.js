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

  // Find and replace the button functionality section (handles all versions)
  const downloadPattern = /\/\/ (?:Download|Copy Code|View Code) Button Functionality[\s\S]*?copyButtons\.forEach\(button => \{[\s\S]*?(?:catch \(err\) => \{[\s\S]*?showCopyToast\('Failed to [^']+', true\);[\s\S]*?\}\s*\}\);|showCopyToast\([^)]+\);)[\s\S]*?\}\);/;

  const newCopyCodeScript = `// Copy Path Button Functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    const copyToast = document.getElementById('copyToast');
    let toastTimeout;

    copyButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent card navigation
        e.stopPropagation(); // Stop event bubbling

        const fileName = button.getAttribute('data-copy');
        const card = button.closest('.card');
        const componentName = card.querySelector('h3')?.textContent || 'Component';

        try {
          // Get the full file path and convert file:// URL to Windows path
          const fullUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + fileName;

          // Convert file:///C:/path to C:\\path format
          const windowsPath = fullUrl
            .replace('file:///', '')
            .replace(/\\//g, '\\\\')
            .replace(/%20/g, ' ');

          // Copy Windows file path to clipboard
          await navigator.clipboard.writeText(windowsPath);

          // Visual feedback on button
          button.classList.add('copied');
          const originalText = button.textContent;
          button.textContent = 'Copied!';

          // Reset button after 2 seconds
          setTimeout(() => {
            button.classList.remove('copied');
            button.textContent = originalText;
          }, 2000);

          // Show toast notification
          showCopyToast(\`\${componentName} path copied!\`);

        } catch (err) {
          console.error('Failed to copy:', err);
          showCopyToast('Failed to copy', true);
        }
      });
    });`;

  content = content.replace(downloadPattern, newCopyCodeScript);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${filename}`);
});

console.log('\n🎉 All files updated with copy code functionality!');
