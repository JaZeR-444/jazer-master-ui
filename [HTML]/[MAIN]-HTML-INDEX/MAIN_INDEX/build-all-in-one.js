const fs = require('fs');
const path = require('path');

console.log('🚀 Building All-In-One Component Library...\n');

const categories = [
  { name: 'navigation', label: 'Navigation' },
  { name: 'components', label: 'Components' },
  { name: 'forms', label: 'Forms' },
  { name: 'layouts', label: 'Layouts' },
  { name: 'media', label: 'Media' },
  { name: 'utilities', label: 'Utilities' },
  { name: 'advanced', label: 'Advanced' },
  { name: 'patterns', label: 'Patterns' }
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
console.log('📝 Generating single HTML file...\n');

// Read the brand CSS
const brandCSS = fs.readFileSync(path.join(__dirname, 'jazer-brand.css'), 'utf8');

// Generate the all-in-one HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JaZeR Component Library - All-In-One Edition</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
/* ===== EMBEDDED JAZER BRAND CSS ===== */
${brandCSS}

/* ===== ALL-IN-ONE SPECIFIC STYLES ===== */
.app-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  gap: 0;
  padding: 0;
  margin: 0;
}

.sidebar {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-right: 2px solid var(--border-cyan);
  padding: 2rem 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
}

.sidebar-header {
  padding: 0 1.5rem 2rem;
  border-bottom: 2px solid var(--border-default);
  margin-bottom: 1.5rem;
}

.sidebar-header h1 {
  font-size: 1.75rem;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.sidebar-header .count {
  font-size: 0.875rem;
  color: var(--text-gray);
  font-family: var(--font-body);
}

.search-box {
  padding: 0 1.5rem 1.5rem;
  margin-bottom: 1rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-card);
  border: 2px solid var(--border-default);
  border-radius: 8px;
  color: var(--text-light);
  font-family: var(--font-body);
  font-size: 0.875rem;
}

.search-box input:focus {
  border-color: var(--jazer-cyan);
  box-shadow: 0 0 20px rgba(0, 242, 234, 0.3);
}

.category-nav {
  list-style: none;
}

.category-item {
  margin-bottom: 0.25rem;
}

.category-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-gray);
  font-family: var(--font-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-button:hover {
  color: var(--jazer-cyan);
  background: var(--bg-card);
  border-left-color: var(--jazer-cyan);
}

.category-button.active {
  color: var(--jazer-cyan);
  background: var(--bg-card);
  border-left-color: var(--jazer-cyan);
  box-shadow: inset 0 0 20px rgba(0, 242, 234, 0.1);
}

.category-button .count {
  float: right;
  opacity: 0.5;
}

.main-content {
  padding: 3rem;
  overflow-y: auto;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.component-card {
  background: var(--bg-card);
  border: 2px solid var(--border-default);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.component-card::before {
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

.component-card:hover {
  transform: translateY(-5px);
  border-color: var(--jazer-cyan);
  box-shadow: var(--shadow-card);
}

.component-card:hover::before {
  opacity: 1;
}

.component-card h3 {
  font-family: var(--font-secondary);
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.component-card .filename {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
  position: relative;
  z-index: 1;
}

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem;
}

.modal.active {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.modal-content {
  background: var(--bg-dark);
  border: 2px solid var(--jazer-cyan);
  border-radius: 16px;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 2rem auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 242, 234, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-default);
}

.modal-header h2 {
  font-size: 2rem;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-button {
  background: transparent;
  border: 2px solid var(--border-default);
  color: var(--text-light);
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.close-button:hover {
  border-color: var(--jazer-pink);
  color: var(--jazer-pink);
  transform: rotate(90deg);
}

.modal-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  border: 2px solid var(--border-default);
  border-radius: 8px;
  color: var(--text-gray);
  font-family: var(--font-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
}

.tab-button:hover {
  border-color: var(--jazer-cyan);
  color: var(--jazer-cyan);
}

.tab-button.active {
  background: var(--gradient-accent);
  border-color: transparent;
  color: var(--text-light);
  box-shadow: var(--shadow-purple);
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.preview-frame {
  width: 100%;
  min-height: 400px;
  border: 2px solid var(--border-default);
  border-radius: 12px;
  background: white;
}

.code-container {
  position: relative;
}

.code-block {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid var(--border-default);
  border-radius: 12px;
  padding: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-light);
}

.copy-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
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

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-gray);
}

.no-results h3 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

@media (max-width: 1024px) {
  .app-container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: relative;
    height: auto;
    border-right: none;
    border-bottom: 2px solid var(--border-cyan);
  }

  .main-content {
    padding: 2rem 1rem;
  }

  .component-grid {
    grid-template-columns: 1fr;
  }
}

/* Scrollbar for modal */
.modal::-webkit-scrollbar,
.code-block::-webkit-scrollbar {
  width: 10px;
}

.modal::-webkit-scrollbar-track,
.code-block::-webkit-scrollbar-track {
  background: var(--bg-dark);
}

.modal::-webkit-scrollbar-thumb,
.code-block::-webkit-scrollbar-thumb {
  background: var(--gradient-accent);
  border-radius: 5px;
}
  </style>
</head>
<body>

  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>JaZeR Library</h1>
        <div class="count">${allComponents.length} Components</div>
      </div>

      <div class="search-box">
        <input
          type="text"
          id="searchInput"
          placeholder="Search components..."
          autocomplete="off"
        >
      </div>

      <nav>
        <ul class="category-nav">
          <li class="category-item">
            <button class="category-button active" data-category="all">
              All Components
              <span class="count">${allComponents.length}</span>
            </button>
          </li>
          ${categories.map(cat => {
            const count = allComponents.filter(c => c.category === cat.name).length;
            return `<li class="category-item">
            <button class="category-button" data-category="${cat.name}">
              ${cat.label}
              <span class="count">${count}</span>
            </button>
          </li>`;
          }).join('')}
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div id="componentGrid" class="component-grid">
        <!-- Components will be rendered here by JavaScript -->
      </div>

      <div id="noResults" class="no-results" style="display: none;">
        <h3>No components found</h3>
        <p>Try a different search term or category</p>
      </div>
    </main>
  </div>

  <!-- Modal for Component Details -->
  <div id="componentModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="modalTitle"></h2>
        <button class="close-button" onclick="closeModal()">&times;</button>
      </div>

      <div class="modal-tabs">
        <button class="tab-button active" onclick="switchTab('preview')">Preview</button>
        <button class="tab-button" onclick="switchTab('code')">Code</button>
      </div>

      <div id="previewTab" class="tab-content active">
        <iframe id="previewFrame" class="preview-frame"></iframe>
      </div>

      <div id="codeTab" class="tab-content">
        <div class="code-container">
          <button class="copy-button" onclick="copyCode()">Copy Code</button>
          <pre class="code-block"><code id="codeBlock"></code></pre>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Component data embedded directly in the file
    const COMPONENTS = ${JSON.stringify(allComponents, null, 2)};

    let currentCategory = 'all';
    let currentSearch = '';
    let currentComponent = null;

    // Initialize the app
    function init() {
      renderComponents();
      setupEventListeners();
    }

    // Setup event listeners
    function setupEventListeners() {
      // Category buttons
      document.querySelectorAll('.category-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.category-button').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          currentCategory = e.target.dataset.category;
          renderComponents();
        });
      });

      // Search input
      document.getElementById('searchInput').addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderComponents();
      });

      // Close modal on background click
      document.getElementById('componentModal').addEventListener('click', (e) => {
        if (e.target.id === 'componentModal') {
          closeModal();
        }
      });

      // Close modal on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      });
    }

    // Render components based on current filter
    function renderComponents() {
      const grid = document.getElementById('componentGrid');
      const noResults = document.getElementById('noResults');

      let filtered = COMPONENTS;

      // Filter by category
      if (currentCategory !== 'all') {
        filtered = filtered.filter(c => c.category === currentCategory);
      }

      // Filter by search
      if (currentSearch) {
        filtered = filtered.filter(c =>
          c.title.toLowerCase().includes(currentSearch) ||
          c.categoryLabel.toLowerCase().includes(currentSearch) ||
          c.filename.toLowerCase().includes(currentSearch)
        );
      }

      if (filtered.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
      }

      grid.style.display = 'grid';
      noResults.style.display = 'none';

      grid.innerHTML = filtered.map(component => \`
        <div class="component-card" onclick="openComponent('\${component.id}')">
          <h3>\${component.title}</h3>
          <div class="filename">\${component.categoryLabel} / \${component.filename}</div>
        </div>
      \`).join('');
    }

    // Open component in modal
    function openComponent(id) {
      currentComponent = COMPONENTS.find(c => c.id === id);
      if (!currentComponent) return;

      document.getElementById('modalTitle').textContent = currentComponent.title;
      document.getElementById('componentModal').classList.add('active');
      document.body.style.overflow = 'hidden';

      // Load preview
      const iframe = document.getElementById('previewFrame');
      iframe.srcdoc = currentComponent.code;

      // Load code
      document.getElementById('codeBlock').textContent = currentComponent.code;

      // Reset to preview tab
      switchTab('preview');
    }

    // Close modal
    function closeModal() {
      document.getElementById('componentModal').classList.remove('active');
      document.body.style.overflow = 'auto';
      currentComponent = null;
    }

    // Switch tabs
    function switchTab(tab) {
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      if (tab === 'preview') {
        document.querySelector('[onclick="switchTab(\\'preview\\')"]').classList.add('active');
        document.getElementById('previewTab').classList.add('active');
      } else {
        document.querySelector('[onclick="switchTab(\\'code\\')"]').classList.add('active');
        document.getElementById('codeTab').classList.add('active');
      }
    }

    // Copy code to clipboard
    function copyCode() {
      if (!currentComponent) return;

      navigator.clipboard.writeText(currentComponent.code).then(() => {
        const btn = document.querySelector('.copy-button');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');

        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 2000);
      });
    }

    // Initialize on page load
    init();
  </script>

</body>
</html>`;

// Write the file
const outputPath = path.join(__dirname, 'JaZeR-Component-Library-ALL-IN-ONE.html');
fs.writeFileSync(outputPath, htmlContent, 'utf8');

console.log('✨ All-In-One file generated successfully!');
console.log(`📄 Output: JaZeR-Component-Library-ALL-IN-ONE.html`);
console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`\n🎉 You can now open this single file in any browser!`);
