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

  // Replace async (e) with just (e)
  content = content.replace(/button\.addEventListener\('click', async \(e\) => \{/g, "button.addEventListener('click', (e) => {");

  // Remove the entire fetch block and replace with simple download
  const fetchPattern = /\/\/ Fetch the HTML file[\s\S]*?URL\.revokeObjectURL\(url\);/;
  const simpleDownload = `// Create a direct download link
          const a = document.createElement('a');
          a.href = \`./\${fileName}\`;
          a.download = fileName;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);`;

  content = content.replace(fetchPattern, simpleDownload);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${filename}`);
});

console.log('\n🎉 All files fixed!');
