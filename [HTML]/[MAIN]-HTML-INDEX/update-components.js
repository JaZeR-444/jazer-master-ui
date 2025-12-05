const fs = require('fs');
const path = require('path');

// Folders to process
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

// CSS link to add
const cssLink = '<link rel="stylesheet" href="../jazer-brand.css">';

// Google Fonts link to add (if not present)
const fontsLink = `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">`;

let totalProcessed = 0;
let totalUpdated = 0;

console.log('🚀 Starting JaZeR Brand CSS Update...\n');

folders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);

  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  Folder not found: ${folder}`);
    return;
  }

  console.log(`📁 Processing folder: ${folder}/`);

  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.html'));

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    totalProcessed++;

    // Check if CSS link already exists
    if (!content.includes('jazer-brand.css')) {
      // Find the </head> tag and insert CSS link before it
      if (content.includes('</head>')) {
        // Add Google Fonts if not present
        if (!content.includes('fonts.googleapis.com/css2?family=Nunito')) {
          content = content.replace('</head>', `  ${fontsLink}\n  </head>`);
        }

        // Add brand CSS link
        content = content.replace('</head>', `  ${cssLink}\n  </head>`);

        fs.writeFileSync(filePath, content, 'utf8');
        updated = true;
        totalUpdated++;
        console.log(`  ✅ Updated: ${file}`);
      } else {
        console.log(`  ⚠️  No </head> tag found: ${file}`);
      }
    } else {
      console.log(`  ⏭️  Skipped (already has brand CSS): ${file}`);
    }
  });

  console.log(`  📊 ${folder}: ${files.length} files processed\n`);
});

console.log('✨ Update Complete!');
console.log(`📊 Total files processed: ${totalProcessed}`);
console.log(`✅ Total files updated: ${totalUpdated}`);
console.log(`⏭️  Total files skipped: ${totalProcessed - totalUpdated}`);
