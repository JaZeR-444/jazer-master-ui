const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const cssDir = path.join(rootDir, '[CSS]', 'categories');
const jsDir = path.join(rootDir, '[JS]');

// Helper to format title from filename
function formatTitle(filename) {
  let name = filename.replace(/\.[^/.]+$/, ""); // Remove extension
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Helper to format folder name to title
function formatFolderTitle(folderName) {
  return folderName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Extract keywords from filename for filtering
function extractKeywords(filename) {
  const name = filename.replace(/\.[^/.]+$/, "").toLowerCase();
  const words = name.split('-');
  const categoryKeywords = [
    'button', 'toggle', 'switch', 'input', 'form', 'modal', 'card', 'nav', 'menu',
    'loader', 'spinner', 'progress', 'tooltip', 'dropdown', 'tabs', 'accordion',
    'slider', 'carousel', 'animation', 'effect', 'hover', 'click', 'scroll',
    'gradient', 'glow', 'neon', 'glass', 'morph', 'ripple', 'pulse', '3d',
    'chart', 'graph', 'data', 'table', 'list', 'grid', 'layout',
    'icon', 'image', 'media', 'video', 'audio', 'player',
    'notification', 'alert', 'toast', 'badge', 'tag', 'chip',
    'search', 'filter', 'sort', 'pagination', 'stepper',
    'date', 'time', 'calendar', 'picker', 'select', 'multi',
    'upload', 'download', 'file', 'drag', 'drop',
    'theme', 'dark', 'light', 'color', 'palette',
    'validation', 'error', 'success', 'warning', 'info',
    'utils', 'helper', 'hook', 'module', 'component', 'template'
  ];
  return words.filter(w => categoryKeywords.includes(w) || w.length > 3);
}

// Generate subdirectory index page with favorites support
function generateSubdirectoryIndex(dirPath, categoryName, backUrl, libraryType, cssPath) {
  const files = fs.readdirSync(dirPath);
  const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
  const jsFiles = files.filter(f => f.endsWith('.js'));

  let componentFiles = libraryType === 'css' ? htmlFiles : jsFiles;
  const count = componentFiles.length;
  const title = formatFolderTitle(categoryName);
  const icon = libraryType === 'css' ? '🎨' : '⚡';
  const favoritesKey = `jazer-favorites-${libraryType}`;

  // Build keyword counts for filter pills
  const keywordCounts = new Map();
  componentFiles.forEach(file => {
    extractKeywords(file).forEach(kw => {
      keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
    });
  });

  const topKeywords = Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const filterPillsHtml = topKeywords.map(([kw, count]) => {
    const label = kw.charAt(0).toUpperCase() + kw.slice(1);
    return `          <div class="filter-pill" data-filter="${kw}">${label}<span class="pill-count">${count}</span></div>`;
  }).join('\n');

  // Generate component cards with favorites button and copy button (same as HTML pages)
  let componentCards = componentFiles.map(file => {
    const name = formatTitle(file);
    const keywords = extractKeywords(file).join(' ');
    const favoriteId = `${libraryType}-${categoryName}-${file.replace(/\.[^/.]+$/, "")}`;
    const filePath = `${categoryName}/${file}`;
    return `        <a class="card card-interactive p-4" href="./${file}" data-keywords="${keywords}" data-component="${favoriteId}" data-path="${filePath}">
          <button class="favorite-btn" data-favorite="${favoriteId}"></button>
          <button class="copy-btn" data-copy="${filePath}">Get</button>
          <h3 class="font-bold text-lg mb-2">${name}</h3>
          <p class="text-sm text-gray">${libraryType === 'css' ? 'CSS Component' : 'JavaScript Module'}</p>
        </a>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - JaZeR ${libraryType.toUpperCase()} Library</title>
  <link rel="stylesheet" href="${cssPath}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <script>
    (function() {
      const savedTheme = localStorage.getItem('jazer-theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    })();
  </script>
</head>
<body data-category="${categoryName}">
  <div class="container">
    <!-- Header Section -->
    <header class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="gradient-text text-3xl font-extrabold">${title}</h1>
        <a href="${backUrl}" class="back-button">← Back to Home</a>
      </div>
      <p class="text-gray">${count} ${libraryType === 'css' ? 'CSS components' : 'JavaScript modules'} in this category</p>
    </header>

    <!-- Search Bar -->
    <div class="search-container">
      <input type="text" class="search-input" id="componentSearch" placeholder="Search ${libraryType === 'css' ? 'components' : 'modules'}..." autocomplete="off" />
      <span class="search-icon">🔍</span>
      <button class="search-clear" id="clearSearch">✕</button>
    </div>

    <!-- Favorites Toggle & Theme Toggle -->
    <div class="flex justify-center items-center gap-3 mb-4">
      <button id="favoritesToggle" class="favorites-toggle">
        <span id="favoritesCount">0</span> Favorites
      </button>
      <button class="theme-toggle-inline" id="themeToggle" aria-label="Toggle theme">
        <span class="theme-toggle-icon"></span>
      </button>
    </div>

    <!-- Pill Filter Bar -->
    <div class="pill-filter-container" id="pillFilterBar">
      <div class="filter-title">Filter by Characteristics</div>
      <div class="filter-pills" id="filterPills">
${filterPillsHtml}
      </div>
      <div class="active-filters" id="activeFilters">
        <span class="active-filters-label">Active:</span>
        <div id="activeFilterPills"></div>
        <button class="clear-all-filters" id="clearAllFilters">Clear All</button>
      </div>
    </div>

    <div class="divider mb-6"></div>

    <!-- Components Section -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold gradient-text mb-4 flex items-center">
        <span class="mr-3">${icon}</span> All ${title}
      </h2>
      <div class="grid grid-cols-2 gap-4" id="componentGrid">
${componentCards}
      </div>
    </div>

    <!-- Favorites Empty State -->
    <div id="favoritesEmpty" class="favorites-empty" style="display: none;">
      <div class="favorites-empty-icon">♡</div>
      <div class="favorites-empty-title">No favorites yet</div>
      <div class="favorites-empty-text">Click the heart icon on any component to add it to your favorites</div>
    </div>

    <!-- Back to top -->
    <div class="text-center mt-8">
      <a href="#top" class="btn btn-outline">Back to Top</a>
    </div>
  </div>

  <footer class="text-center py-6 mt-8 border-t border-gray-700">
    <div class="mb-2">
      <div class="copyright">© 2025 <span class="gradient-text font-bold">JaZeR Ventures</span>. All rights reserved.</div>
    </div>
    <div class="footer-tagline text-gray">Crafted with passion. Built with code.</div>
  </footer>

  <script>
    // ==================== Theme Toggle ====================
    const THEME_KEY = 'jazer-theme';
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    function toggleTheme() {
      const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // ==================== Favorites System ====================
    const FAVORITES_KEY = '${favoritesKey}';
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    let showingFavoritesOnly = false;

    function initFavorites() {
      const favoriteButtons = document.querySelectorAll('.favorite-btn');
      
      favoriteButtons.forEach(button => {
        const favoriteId = button.getAttribute('data-favorite');
        
        if (favorites.includes(favoriteId)) {
          button.classList.add('favorited');
        }
        
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(favoriteId, button);
        });
      });
      
      updateFavoritesCount();
    }

    function toggleFavorite(favoriteId, button) {
      const index = favorites.indexOf(favoriteId);
      
      if (index > -1) {
        favorites.splice(index, 1);
        button.classList.remove('favorited');
      } else {
        favorites.push(favoriteId);
        button.classList.add('favorited');
      }
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      updateFavoritesCount();
      
      if (showingFavoritesOnly) {
        filterCards();
      }
    }

    function updateFavoritesCount() {
      const countElement = document.getElementById('favoritesCount');
      if (countElement) {
        countElement.textContent = favorites.length;
      }
    }

    // Favorites toggle button
    const favoritesToggle = document.getElementById('favoritesToggle');
    if (favoritesToggle) {
      favoritesToggle.addEventListener('click', () => {
        showingFavoritesOnly = !showingFavoritesOnly;
        favoritesToggle.classList.toggle('active', showingFavoritesOnly);
        filterCards();
      });
    }

    initFavorites();

    // ==================== Search & Filter ====================
    const searchInput = document.getElementById('componentSearch');
    const clearButton = document.getElementById('clearSearch');
    const cards = document.querySelectorAll('.card-interactive');
    const emptyState = document.getElementById('favoritesEmpty');
    const componentGrid = document.getElementById('componentGrid');

    function filterCards() {
      const searchTerm = searchInput.value.toLowerCase().trim();
      const activeFilters = Array.from(document.querySelectorAll('.filter-pill.active'))
        .map(p => p.getAttribute('data-filter'));
      
      let visibleCount = 0;
      
      cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
        const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        const favoriteId = card.getAttribute('data-component');
        
        const searchMatch = searchTerm === '' || 
          title.includes(searchTerm) || 
          desc.includes(searchTerm) || 
          keywords.includes(searchTerm);
        
        const filterMatch = activeFilters.length === 0 || 
          activeFilters.some(f => keywords.includes(f));
        
        const favoriteMatch = !showingFavoritesOnly || favorites.includes(favoriteId);
        
        const isVisible = searchMatch && filterMatch && favoriteMatch;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
      });
      
      // Show empty state for favorites
      if (showingFavoritesOnly && visibleCount === 0) {
        emptyState.style.display = 'block';
        componentGrid.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        componentGrid.style.display = '';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearButton.classList.toggle('visible', e.target.value.length > 0);
        filterCards();
      });

      clearButton.addEventListener('click', () => {
        searchInput.value = '';
        clearButton.classList.remove('visible');
        filterCards();
        searchInput.focus();
      });
    }

    // ==================== Pill Filter System ====================
    const filterPills = document.querySelectorAll('.filter-pill');
    const activeFiltersContainer = document.getElementById('activeFilterPills');
    const clearAllBtn = document.getElementById('clearAllFilters');
    const activeFiltersSection = document.getElementById('activeFilters');
    
    function updateActiveFiltersDisplay() {
      const activePills = document.querySelectorAll('.filter-pill.active');
      activeFiltersContainer.innerHTML = '';
      
      if (activePills.length === 0) {
        activeFiltersSection.style.display = 'none';
      } else {
        activeFiltersSection.style.display = 'flex';
        activePills.forEach(pill => {
          const label = pill.textContent.replace(/\\d+$/, '').trim();
          const filterValue = pill.getAttribute('data-filter');
          const activePill = document.createElement('span');
          activePill.className = 'active-filter-pill';
          activePill.innerHTML = label + ' <span class="remove-filter" data-filter="' + filterValue + '">×</span>';
          activeFiltersContainer.appendChild(activePill);
        });
        
        document.querySelectorAll('.remove-filter').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            const pill = document.querySelector('.filter-pill[data-filter="' + filter + '"]');
            if (pill) {
              pill.classList.remove('active');
              updateActiveFiltersDisplay();
              filterCards();
            }
          });
        });
      }
    }
    
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active');
        updateActiveFiltersDisplay();
        filterCards();
      });
    });
    
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        filterPills.forEach(pill => pill.classList.remove('active'));
        updateActiveFiltersDisplay();
        filterCards();
      });
    }
    
    updateActiveFiltersDisplay();

    // ==================== Copy Button System ====================
    // Add click handlers to copy buttons (same as HTML pages)
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const path = btn.getAttribute('data-copy');
        
        try {
          await navigator.clipboard.writeText(path);
          btn.classList.add('copied');
          btn.textContent = '✓';
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = 'Get';
          }, 2000);
        } catch (err) {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = path;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          btn.classList.add('copied');
          btn.textContent = '✓';
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = 'Get';
          }, 2000);
        }
      });
    });
  </script>
</body>
</html>`;

  return html;
}

// Process CSS subdirectories
function processCSSDirectories() {
  console.log('Processing CSS subdirectories...');

  if (!fs.existsSync(cssDir)) {
    console.warn('CSS directory not found, skipping CSS indexes.');
    return;
  }

  const subdirs = fs.readdirSync(cssDir).filter(f => {
    const fullPath = path.join(cssDir, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('extra-');
  });

  let processed = 0;
  subdirs.forEach(subdir => {
    const subdirPath = path.join(cssDir, subdir);
    const indexPath = path.join(subdirPath, 'index.html');
    const html = generateSubdirectoryIndex(subdirPath, subdir, '../MASTER-INDEX.html', 'css', '../../jazer-brand.css');
    fs.writeFileSync(indexPath, html);
    processed++;
    console.log(`  ✓ ${subdir}/index.html`);
  });

  console.log(`Processed ${processed} CSS subdirectories.`);
}

// Process JS subdirectories
function processJSDirectories() {
  console.log('Processing JS subdirectories...');

  if (!fs.existsSync(jsDir)) {
    console.warn('JS directory not found, skipping JS indexes.');
    return;
  }

  const subdirs = fs.readdirSync(jsDir).filter(f => {
    const fullPath = path.join(jsDir, f);
    return fs.statSync(fullPath).isDirectory();
  });

  let processed = 0;
  subdirs.forEach(subdir => {
    const subdirPath = path.join(jsDir, subdir);
    const indexPath = path.join(subdirPath, 'index.html');
    const html = generateSubdirectoryIndex(subdirPath, subdir, '../all-components.html', 'js', '../../jazer-brand.css');
    fs.writeFileSync(indexPath, html);
    processed++;
    console.log(`  ✓ ${subdir}/index.html`);
  });

  console.log(`Processed ${processed} JS subdirectories.`);
}

// Run
console.log('Generating subdirectory index pages with favorites...\n');
processCSSDirectories();
console.log('');
processJSDirectories();
console.log('\nDone!');
