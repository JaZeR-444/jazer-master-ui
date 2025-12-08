const fs = require('fs');
const path = require('path');

// List of all category HTML files to update
const files = [
  'components.html',
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

  // Check if already updated
  if (content.includes('Download Button Functionality')) {
    console.log(`✓ ${filename} already updated to download functionality`);
    return;
  }

  // Update button text from "Copy" to "Get"
  content = content.replace(
    /(<button class="copy-btn" data-copy="[^"]+">)Copy(<\/button>)/g,
    '$1Get$2'
  );

  // Update the JavaScript functionality - handle both old copy script and old async download script
  const oldCopyScript = `    // Copy Button Functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    const copyToast = document.getElementById('copyToast');
    let toastTimeout;

    copyButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent card navigation
        e.stopPropagation(); // Stop event bubbling

        const copyText = button.getAttribute('data-copy');
        const card = button.closest('.card');
        const componentName = card.querySelector('h3')?.textContent || 'Component';

        try {
          // Copy to clipboard
          await navigator.clipboard.writeText(copyText);

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

  const newDownloadScript = `    // Download Button Functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    const copyToast = document.getElementById('copyToast');
    let toastTimeout;

    copyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent card navigation
        e.stopPropagation(); // Stop event bubbling

        const fileName = button.getAttribute('data-copy');
        const card = button.closest('.card');
        const componentName = card.querySelector('h3')?.textContent || 'Component';

        try {
          // Create a direct download link
          const a = document.createElement('a');
          a.href = \`./\${fileName}\`;
          a.download = fileName;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Visual feedback on button
          button.classList.add('copied');
          const originalText = button.textContent;
          button.textContent = 'Downloaded!';

          // Reset button after 2 seconds
          setTimeout(() => {
            button.classList.remove('copied');
            button.textContent = originalText;
          }, 2000);

          // Show toast notification
          showCopyToast(\`\${componentName} downloaded!\`);

        } catch (err) {
          console.error('Failed to download:', err);
          showCopyToast('Failed to download', true);
        }
      });
    });`;

  // Try replacing old copy script first
  let updated = content.replace(oldCopyScript, newDownloadScript);

  // If no change, try replacing the old async download script
  if (updated === content) {
    const oldAsyncDownloadScript = /\/\/ Download Button Functionality[\s\S]*?copyButtons\.forEach\(button => \{[\s\S]*?async \(e\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\}\);[\s\S]*?\}\);/;
    updated = content.replace(oldAsyncDownloadScript, newDownloadScript);
  }

  // Write the updated content back to the file
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log(`✅ Updated ${filename} with download functionality`);
});

console.log('\n🎉 All files updated with download functionality!');
