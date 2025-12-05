const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing File Paths for New Structure...\n');

// PART 1: Fix category HTML files to point to HTML_INDIVIDUAL_INDEX
console.log('📁 PART 1: Updating Category Index Files\n');

const categoryFiles = [
  'navigation.html',
  'components.html',
  'forms.html',
  'layouts.html',
  'media.html',
  'utilities.html',
  'advanced.html',
  'patterns.html'
];

const folders = [
  'navigation',
  'components',
  'forms',
  'layouts',
  'media',
  'utilities',
  'advanced',
  'patterns'
];

categoryFiles.forEach((file, index) => {
  const filePath = path.join(__dirname, file);
  const folderName = folders[index];

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace href="folder/ with href="HTML_INDIVIDUAL_INDEX/folder/
    const oldPattern = new RegExp(`href="${folderName}/`, 'g');
    const newPattern = `href="HTML_INDIVIDUAL_INDEX/${folderName}/`;

    const matches = content.match(oldPattern);
    if (matches) {
      content = content.replace(oldPattern, newPattern);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Updated ${file} (${matches.length} links fixed)`);
    } else {
      console.log(`  ⏭️  ${file} - no links to update`);
    }
  } else {
    console.log(`  ⚠️  File not found: ${file}`);
  }
});

// PART 2: Fix component files CSS links
console.log('\n📁 PART 2: Updating Component CSS Links\n');

let totalComponentsUpdated = 0;

folders.forEach(folder => {
  const folderPath = path.join(__dirname, 'HTML_INDIVIDUAL_INDEX', folder);

  if (!fs.existsSync(folderPath)) {
    console.log(`  ⚠️  Folder not found: ${folder}`);
    return;
  }

  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.html'));
  let folderUpdated = 0;

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace href="../jazer-brand.css" with href="../../jazer-brand.css"
    if (content.includes('href="../jazer-brand.css"')) {
      content = content.replace('href="../jazer-brand.css"', 'href="../../jazer-brand.css"');
      fs.writeFileSync(filePath, content, 'utf8');
      folderUpdated++;
      totalComponentsUpdated++;
    }
  });

  console.log(`  ✅ ${folder}: ${folderUpdated}/${files.length} files updated`);
});

console.log('\n✨ Path Fix Complete!');
console.log(`📊 Total category files updated: ${categoryFiles.length}`);
console.log(`📊 Total component files updated: ${totalComponentsUpdated}`);
