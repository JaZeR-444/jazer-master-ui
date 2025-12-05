const fs = require('fs');
const path = require('path');

console.log('🚀 Building TRUE Multi-Page Component Library...\n');
console.log('Creating separate HTML files for each category\n');

const categories = [
  { name: 'navigation', label: 'Navigation', icon: '🧭', description: 'Navigation menus, breadcrumbs, tabs, and more' },
  { name: 'components', label: 'Components', icon: '🧩', description: 'Reusable UI components like buttons, cards, and modals' },
  { name: 'forms', label: 'Forms', icon: '📝', description: 'Form inputs, validation, and complete form layouts' },
  { name: 'layouts', label: 'Layouts', icon: '📐', description: 'Page layouts and structural patterns' },
  { name: 'media', label: 'Media', icon: '🎬', description: 'Images, videos, galleries, and media components' },
  { name: 'utilities', label: 'Utilities', icon: '🔧', description: 'Helper components and utility patterns' },
  { name: 'advanced', label: 'Advanced', icon: '⚡', description: 'Complex interactive components' },
  { name: 'patterns', label: 'Patterns', icon: '🎨', description: 'Complete page patterns and templates' }
];

// Collect all components
const allComponents = [];

categories.forEach(category => {
  const folderPath = path.join(__dirname, 'HTML_INDIVIDUAL_INDEX', category.name);

  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  Folder not found: ${category.name}`);
    return;
  }

  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.html'));

  console.log(`📁 ${category.label}: ${files.length} components`);

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const title = file
      .replace('.html', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    allComponents.push({
      id: `${category.name}-${file.replace('.html', '')}`,
      category: category.name,
      categoryLabel: category.label,
      title: title,
      filename: file,
      code: content
    });
  });
});

console.log(`\n✅ Total components collected: ${allComponents.length}\n`);

// Read brand CSS
const brandCSS = fs.readFileSync(path.join(__dirname, 'jazer-brand.css'), 'utf8');

// Shared styles for all pages
const sharedStyles = `
/* ===== EMBEDDED JAZER BRAND CSS ===== */
${brandCSS}

/* ===== PAGE LAYOUT ===== */
body {
  padding: 0;
  margin: 0;
}

/* ===== HEADER ===== */
.site-header {
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid var(--border-cyan);
  padding: 1.25rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-logo {
  font-family: var(--font-primary);
  font-size: 1.75rem;
  font-weight: 900;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: opacity 0.3s ease;
}

.site-logo:hover {
  opacity: 0.8;
}

.breadcrumb {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-gray);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb a {
  color: var(--jazer-cyan);
  text-decoration: none;
}

.breadcrumb a:hover {
  color: var(--jazer-pink);
}

.breadcrumb-separator {
  color: var(--text-muted);
}

/* ===== COMPONENT SECTIONS ===== */
.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.component-wrapper {
  background: var(--bg-card);
  border: 2px solid var(--border-default);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
  transition: all 0.3s ease;
}

.component-wrapper:hover {
  border-color: var(--jazer-cyan);
  box-shadow: var(--shadow-cyan);
}

.component-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--text-light);
}

.component-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-family: var(--font-body);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-default);
}

.component-display {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  min-height: 200px;
}

/* ===== BACK TO TOP ===== */
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: var(--gradient-accent);
  border: none;
  border-radius: 50%;
  color: var(--text-light);
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: var(--shadow-purple);
  transition: all 0.3s ease;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.back-to-top.visible {
  display: flex;
}

.back-to-top:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-card);
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .page-content {
    padding: 2rem 1rem;
  }

  .component-wrapper {
    padding: 1.5rem;
  }
}
`;

// Generate HOME page
console.log('📝 Generating HOME.html...');
const homeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JaZeR Component Library - Home</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
${sharedStyles}

.hero {
  text-align: center;
  padding: 6rem 2rem 4rem;
  max-width: 1000px;
  margin: 0 auto;
}

.hero h1 {
  font-size: clamp(3rem, 10vw, 6rem);
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  animation: float 6s ease-in-out infinite;
}

.hero p {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  color: var(--text-gray);
  margin-bottom: 1rem;
}

.component-count {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--gradient-accent);
  border-radius: 25px;
  font-weight: 700;
  box-shadow: var(--shadow-purple);
  margin-top: 1rem;
  font-size: 1.125rem;
}

.category-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.category-card {
  background: var(--bg-card);
  border: 2px solid var(--border-default);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: block;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-card);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover {
  transform: translateY(-10px);
  border-color: var(--jazer-cyan);
  box-shadow: var(--shadow-card);
}

.category-card:hover::before {
  opacity: 1;
}

.category-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.category-card h2 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.category-card .description {
  font-size: 0.95rem;
  color: var(--text-gray);
  font-family: var(--font-body);
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
  line-height: 1.5;
}

.category-card .count {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-family: var(--font-body);
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-container">
      <a href="HOME.html" class="site-logo">JaZeR Library</a>
      <div class="breadcrumb">
        <span>Home</span>
      </div>
    </div>
  </header>

  <div class="hero">
    <h1>Component Library</h1>
    <p>A comprehensive collection of modern, responsive UI components</p>
    <p>All styled with the vibrant JaZeR brand</p>
    <div class="component-count">${allComponents.length} Components Across 8 Categories</div>
  </div>

  <div class="category-grid">
${categories.map(cat => {
  const count = allComponents.filter(c => c.category === cat.name).length;
  return `    <a href="${cat.name.toUpperCase()}.html" class="category-card">
      <div class="category-icon">${cat.icon}</div>
      <h2>${cat.label}</h2>
      <div class="description">${cat.description}</div>
      <div class="count">${count} Components</div>
    </a>`;
}).join('\n')}
  </div>

  <script>
    window.addEventListener('scroll', () => {
      const btn = document.getElementById('backToTop');
      if (btn && window.scrollY > 300) {
        btn.classList.add('visible');
      } else if (btn) {
        btn.classList.remove('visible');
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'HOME.html'), homeHTML, 'utf8');
console.log('✅ HOME.html created');

// Generate category pages
categories.forEach(category => {
  console.log(`📝 Generating ${category.name.toUpperCase()}.html...`);

  const components = allComponents.filter(c => c.category === category.name);

  const categoryHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${category.label} - JaZeR Component Library</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
${sharedStyles}

.page-header {
  text-align: center;
  padding: 4rem 2rem 3rem;
  background: linear-gradient(180deg, rgba(0, 242, 234, 0.05) 0%, transparent 100%);
}

.page-header h1 {
  font-size: clamp(2.5rem, 8vw, 5rem);
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.page-header .subtitle {
  font-size: 1.25rem;
  color: var(--text-gray);
  margin-bottom: 0.5rem;
}

.page-header .count {
  font-size: 1rem;
  color: var(--text-muted);
}
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-container">
      <a href="HOME.html" class="site-logo">JaZeR Library</a>
      <div class="breadcrumb">
        <a href="HOME.html">Home</a>
        <span class="breadcrumb-separator">/</span>
        <span>${category.label}</span>
      </div>
    </div>
  </header>

  <div class="page-header">
    <h1>${category.icon} ${category.label}</h1>
    <div class="subtitle">${category.description}</div>
    <div class="count">${components.length} Components</div>
  </div>

  <div class="page-content">
${components.map(component => `    <div class="component-wrapper" id="${component.id}">
      <h2 class="component-title">${component.title}</h2>
      <div class="component-subtitle">${component.filename}</div>
      <div class="component-display">
        ${component.code}
      </div>
    </div>
`).join('\n')}
  </div>

  <button class="back-to-top" id="backToTop" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">↑</button>

  <script>
    window.addEventListener('scroll', () => {
      const btn = document.getElementById('backToTop');
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, `${category.name.toUpperCase()}.html`), categoryHTML, 'utf8');
  console.log(`✅ ${category.name.toUpperCase()}.html created (${components.length} components embedded)`);
});

console.log('\n✨ Multi-Page Library Generated Successfully!');
console.log('\n📄 Files Created:');
console.log('  - HOME.html (main landing page)');
categories.forEach(cat => {
  console.log(`  - ${cat.name.toUpperCase()}.html (${allComponents.filter(c => c.category === cat.name).length} components)`);
});
console.log('\n🎉 Open HOME.html to start browsing!');
