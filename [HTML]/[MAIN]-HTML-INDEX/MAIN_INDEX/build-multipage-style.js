const fs = require('fs');
const path = require('path');

console.log('🚀 Building Multi-Page Style Component Library...\n');

const categories = [
  { name: 'navigation', label: 'Navigation', icon: '🧭' },
  { name: 'components', label: 'Components', icon: '🧩' },
  { name: 'forms', label: 'Forms', icon: '📝' },
  { name: 'layouts', label: 'Layouts', icon: '📐' },
  { name: 'media', label: 'Media', icon: '🎬' },
  { name: 'utilities', label: 'Utilities', icon: '🔧' },
  { name: 'advanced', label: 'Advanced', icon: '⚡' },
  { name: 'patterns', label: 'Patterns', icon: '🎨' }
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

    // Extract title from filename
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
console.log('📝 Generating multi-page style HTML file...\n');

// Read the brand CSS
const brandCSS = fs.readFileSync(path.join(__dirname, 'jazer-brand.css'), 'utf8');

// Generate the HTML
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JaZeR Component Library</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
/* ===== EMBEDDED JAZER BRAND CSS ===== */
${brandCSS}

/* ===== MULTI-PAGE STYLE LAYOUT ===== */
body {
  padding: 0;
  margin: 0;
}

.page {
  display: none;
  min-height: 100vh;
  animation: fadeIn 0.5s ease-out;
}

.page.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== HEADER ===== */
.site-header {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid var(--border-cyan);
  padding: 1rem 0;
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
  font-size: 1.5rem;
  font-weight: 900;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.breadcrumb {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-gray);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: var(--jazer-cyan);
  cursor: pointer;
  transition: color 0.3s ease;
}

.breadcrumb-link:hover {
  color: var(--jazer-pink);
}

.breadcrumb-separator {
  color: var(--text-muted);
}

/* ===== HOME PAGE ===== */
.home-hero {
  text-align: center;
  padding: 6rem 2rem 4rem;
  max-width: 1000px;
  margin: 0 auto;
}

.home-hero h1 {
  font-size: clamp(3rem, 10vw, 6rem);
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  animation: float 6s ease-in-out infinite;
}

.home-hero p {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  color: var(--text-gray);
  margin-bottom: 1rem;
}

.component-count {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--gradient-accent);
  border-radius: 25px;
  font-weight: 700;
  box-shadow: var(--shadow-purple);
  margin-top: 1rem;
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
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
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
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.category-card .count {
  font-size: 1rem;
  color: var(--text-gray);
  font-family: var(--font-body);
  position: relative;
  z-index: 1;
}

/* ===== CATEGORY PAGE ===== */
.category-page-header {
  text-align: center;
  padding: 4rem 2rem 3rem;
  background: linear-gradient(180deg, rgba(0, 242, 234, 0.05) 0%, transparent 100%);
}

.category-page-header h1 {
  font-size: clamp(2.5rem, 8vw, 5rem);
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.category-page-header .description {
  font-size: 1.25rem;
  color: var(--text-gray);
  max-width: 700px;
  margin: 0 auto;
}

.components-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.component-section {
  background: var(--bg-card);
  border: 2px solid var(--border-default);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
  transition: all 0.3s ease;
}

.component-section:hover {
  border-color: var(--jazer-cyan);
  box-shadow: var(--shadow-cyan);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-default);
}

.component-header h2 {
  font-size: 2rem;
  color: var(--text-light);
}

.component-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  border: 2px solid var(--border-default);
  border-radius: 10px;
  color: var(--text-light);
  font-family: var(--font-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-button:hover {
  border-color: var(--jazer-cyan);
  background: var(--jazer-cyan);
  color: var(--bg-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-cyan);
}

.action-button.active {
  background: var(--gradient-accent);
  border-color: transparent;
  box-shadow: var(--shadow-purple);
}

.component-content {
  display: none;
}

.component-content.active {
  display: block;
}

.preview-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--border-default);
}

.preview-iframe {
  width: 100%;
  min-height: 400px;
  border: none;
  display: block;
}

.code-container {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  border: 2px solid var(--border-default);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid var(--border-default);
  background: rgba(0, 0, 0, 0.3);
}

.code-label {
  font-family: var(--font-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-gray);
}

.copy-button {
  padding: 0.5rem 1.25rem;
  background: var(--gradient-accent);
  border: none;
  border-radius: 8px;
  color: var(--text-light);
  font-family: var(--font-secondary);
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: var(--shadow-purple);
}

.copy-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.copy-button.copied {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.code-block {
  padding: 1.5rem;
  max-height: 500px;
  overflow: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-light);
}

.code-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* ===== BACK TO TOP BUTTON ===== */
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

.back-to-top:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-card);
}

.back-to-top.visible {
  display: flex;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .components-container {
    padding: 1rem;
  }

  .component-section {
    padding: 1rem;
  }

  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .component-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .action-button {
    flex: 1;
    min-width: 100px;
  }
}

/* Scrollbar styling */
.code-block::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-block::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.code-block::-webkit-scrollbar-thumb {
  background: var(--gradient-accent);
  border-radius: 4px;
}
  </style>
</head>
<body>

  <!-- Header -->
  <header class="site-header">
    <div class="header-container">
      <div class="site-logo" onclick="navigateToHome()">JaZeR Library</div>
      <div class="breadcrumb" id="breadcrumb"></div>
    </div>
  </header>

  <!-- Home Page -->
  <div id="homePage" class="page active">
    <div class="home-hero">
      <h1>Component Library</h1>
      <p>A comprehensive collection of modern, responsive UI components</p>
      <p>All styled with the vibrant JaZeR brand</p>
      <div class="component-count">${allComponents.length} Components</div>
    </div>

    <div class="category-grid">
      ${categories.map(cat => {
        const count = allComponents.filter(c => c.category === cat.name).length;
        return `<div class="category-card" onclick="navigateToCategory('${cat.name}')">
          <div class="category-icon">${cat.icon}</div>
          <h2>${cat.label}</h2>
          <div class="count">${count} Components</div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <!-- Category Pages (generated dynamically) -->
  ${categories.map(cat => {
    const components = allComponents.filter(c => c.category === cat.name);
    return `
  <div id="${cat.name}Page" class="page">
    <div class="category-page-header">
      <h1>${cat.icon} ${cat.label}</h1>
      <div class="description">${components.length} components in this category</div>
    </div>

    <div class="components-container">
      ${components.map((component, index) => `
      <div class="component-section" id="${component.id}">
        <div class="component-header">
          <h2>${component.title}</h2>
          <div class="component-actions">
            <button class="action-button active" onclick="showPreview('${component.id}')">Preview</button>
            <button class="action-button" onclick="showCode('${component.id}')">Code</button>
          </div>
        </div>

        <div id="${component.id}-preview" class="component-content active">
          <div class="preview-container">
            <iframe class="preview-iframe" id="${component.id}-iframe"></iframe>
          </div>
        </div>

        <div id="${component.id}-code" class="component-content">
          <div class="code-container">
            <div class="code-header">
              <span class="code-label">HTML Source</span>
              <button class="copy-button" onclick="copyComponentCode('${component.id}')">Copy Code</button>
            </div>
            <div class="code-block">
              <pre><code id="${component.id}-code-content"></code></pre>
            </div>
          </div>
        </div>
      </div>
      `).join('')}
    </div>
  </div>
    `;
  }).join('')}

  <!-- Back to Top Button -->
  <button class="back-to-top" id="backToTop" onclick="scrollToTop()">↑</button>

  <script>
    // Component data
    const COMPONENTS = ${JSON.stringify(allComponents, null, 2)};

    // Current page state
    let currentPage = 'home';
    let loadedIframes = new Set();

    // Navigation functions
    function navigateToHome() {
      setActivePage('home');
      updateBreadcrumb([{ label: 'Home', page: 'home' }]);
    }

    function navigateToCategory(category) {
      setActivePage(category);
      const categoryLabel = getCategoryLabel(category);
      updateBreadcrumb([
        { label: 'Home', page: 'home' },
        { label: categoryLabel, page: category }
      ]);

      // Load iframes for this category if not already loaded
      const components = COMPONENTS.filter(c => c.category === category);
      components.forEach(component => {
        if (!loadedIframes.has(component.id)) {
          loadComponentPreview(component.id);
          loadedIframes.add(component.id);
        }
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setActivePage(page) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const pageId = page === 'home' ? 'homePage' : page + 'Page';
      const pageElement = document.getElementById(pageId);
      if (pageElement) {
        pageElement.classList.add('active');
        currentPage = page;
      }
    }

    function updateBreadcrumb(items) {
      const breadcrumb = document.getElementById('breadcrumb');
      breadcrumb.innerHTML = items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast) {
          return \`<span>\${item.label}</span>\`;
        } else {
          return \`<span class="breadcrumb-link" onclick="navigate\${item.page === 'home' ? 'ToHome' : 'ToCategory'}('\${item.page}')">\${item.label}</span><span class="breadcrumb-separator">/</span>\`;
        }
      }).join('');
    }

    function getCategoryLabel(category) {
      const categories = {
        'navigation': 'Navigation',
        'components': 'Components',
        'forms': 'Forms',
        'layouts': 'Layouts',
        'media': 'Media',
        'utilities': 'Utilities',
        'advanced': 'Advanced',
        'patterns': 'Patterns'
      };
      return categories[category] || category;
    }

    // Component display functions
    function showPreview(componentId) {
      // Update buttons
      const section = document.getElementById(componentId);
      section.querySelectorAll('.action-button').forEach(btn => btn.classList.remove('active'));
      section.querySelector('[onclick*="showPreview"]').classList.add('active');

      // Show preview, hide code
      document.getElementById(componentId + '-preview').classList.add('active');
      document.getElementById(componentId + '-code').classList.remove('active');
    }

    function showCode(componentId) {
      // Update buttons
      const section = document.getElementById(componentId);
      section.querySelectorAll('.action-button').forEach(btn => btn.classList.remove('active'));
      section.querySelector('[onclick*="showCode"]').classList.add('active');

      // Show code, hide preview
      document.getElementById(componentId + '-preview').classList.remove('active');
      document.getElementById(componentId + '-code').classList.add('active');

      // Load code if not already loaded
      const codeElement = document.getElementById(componentId + '-code-content');
      if (!codeElement.textContent) {
        const component = COMPONENTS.find(c => c.id === componentId);
        if (component) {
          codeElement.textContent = component.code;
        }
      }
    }

    function loadComponentPreview(componentId) {
      const component = COMPONENTS.find(c => c.id === componentId);
      if (!component) return;

      const iframe = document.getElementById(componentId + '-iframe');
      if (iframe && !iframe.srcdoc) {
        iframe.srcdoc = component.code;
      }
    }

    function copyComponentCode(componentId) {
      const component = COMPONENTS.find(c => c.id === componentId);
      if (!component) return;

      navigator.clipboard.writeText(component.code).then(() => {
        const section = document.getElementById(componentId);
        const btn = section.querySelector('.copy-button');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');

        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 2000);
      });
    }

    // Scroll functions
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Show/hide back to top button
    window.addEventListener('scroll', () => {
      const btn = document.getElementById('backToTop');
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    // Initialize
    updateBreadcrumb([{ label: 'Home', page: 'home' }]);
  </script>

</body>
</html>`;

// Write the file
const outputPath = path.join(__dirname, 'JaZeR-Component-Library-MULTIPAGE.html');
fs.writeFileSync(outputPath, htmlContent, 'utf8');

console.log('✨ Multi-Page Style file generated successfully!');
console.log(`📄 Output: JaZeR-Component-Library-MULTIPAGE.html`);
console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`\n🎉 Open this file to navigate between category "pages"!`);
