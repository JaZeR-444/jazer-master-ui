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

  // Check if copy functionality is already added
  if (content.includes('Copy Button Functionality')) {
    console.log(`✓ ${filename} already has copy functionality`);
    return;
  }

  // Add toast notification HTML before footer
  if (!content.includes('id="copyToast"')) {
    content = content.replace(
      /<footer/,
      '  <!-- Copy Toast Notification -->\n  <div id="copyToast" class="copy-toast"></div>\n\n  <footer'
    );
  }

  // Add copy buttons to all card links
  const cardRegex = /<a class="card([^"]*)" href="\.\/([A-Z-]+)-([a-z0-9-]+)\.html">/g;
  content = content.replace(cardRegex, (match, cardClasses, prefix, componentName) => {
    return `<a class="card${cardClasses}" href="./${prefix}-${componentName}.html" data-component="${componentName}">
          <button class="copy-btn" data-copy="${prefix}-${componentName}.html">Copy</button>`;
  });

  // Add copy functionality JavaScript before closing </script> tag
  const copyScript = `
    // Copy Button Functionality
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
    });

    function showCopyToast(message, isError = false) {
      clearTimeout(toastTimeout);

      copyToast.textContent = message;
      if (isError) {
        copyToast.style.borderColor = '#dc3545';
        copyToast.style.boxShadow = '0 10px 30px rgba(220, 53, 69, 0.3)';
      } else {
        copyToast.style.borderColor = 'var(--jazer-cyan)';
        copyToast.style.boxShadow = '0 10px 30px rgba(0, 242, 234, 0.3)';
      }

      copyToast.classList.add('show');

      toastTimeout = setTimeout(() => {
        copyToast.classList.remove('show');
      }, 3000);
    }
  </script>`;

  content = content.replace('  </script>', copyScript);

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${filename}`);
});

console.log('\n🎉 All files updated successfully!');
