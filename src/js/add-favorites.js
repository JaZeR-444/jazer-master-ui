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

  // Check if favorites functionality is already added
  if (content.includes('Favorites System')) {
    console.log(`✓ ${filename} already has favorites functionality`);
    return;
  }

  // Add favorite buttons to all card links (make sure to add BEFORE copy button)
  const cardWithCopyRegex = /<a class="card([^"]*)" href="\.\/([A-Z-]+)-([a-z0-9-]+)\.html" data-component="([^"]+)">\s*<button class="copy-btn"/g;
  content = content.replace(cardWithCopyRegex, (match, cardClasses, prefix, componentName, dataComponent) => {
    return `<a class="card${cardClasses}" href="./${prefix}-${componentName}.html" data-component="${dataComponent}" data-category="${filename.replace('.html', '')}" data-title="" data-desc="">
          <button class="favorite-btn" data-favorite="${prefix}-${componentName}"></button>
          <button class="copy-btn"`;
  });

  // Add data-title and data-desc attributes by finding h3 and p within cards
  // This is a bit tricky, so we'll do it in the JavaScript instead

  // Add favorites filter toggle after search bar
  const searchContainerRegex = /(<div class="search-container">[\s\S]*?<\/div>)/;
  content = content.replace(searchContainerRegex, (match) => {
    return `${match}\n\n    <!-- Favorites Filter Toggle -->\n    <div class="text-center mb-4">\n      <button id="favoritesToggle" class="favorites-toggle">\n        <span id="favoritesCount">0</span> Favorites\n      </button>\n    </div>`;
  });

  // Add favorites functionality JavaScript before closing </script> tag
  const favoritesScript = `
    // ==================== Favorites System ====================
    const FAVORITES_KEY = 'jazer-favorites';
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    let showingFavoritesOnly = false;

    // Initialize favorites on page load
    function initFavorites() {
      const favoriteButtons = document.querySelectorAll('.favorite-btn');

      // Add title and description to each card's data attributes
      document.querySelectorAll('.card').forEach(card => {
        const title = card.querySelector('h3')?.textContent || '';
        const desc = card.querySelector('p')?.textContent || '';
        card.setAttribute('data-title', title);
        card.setAttribute('data-desc', desc);
      });

      favoriteButtons.forEach(button => {
        const favoriteId = button.getAttribute('data-favorite');

        // Check if this component is favorited
        if (favorites.includes(favoriteId)) {
          button.classList.add('favorited');
        }

        // Add click event
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
        // Remove from favorites
        favorites.splice(index, 1);
        button.classList.remove('favorited');
      } else {
        // Add to favorites
        favorites.push(favoriteId);
        button.classList.add('favorited');
      }

      // Save to localStorage
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      updateFavoritesCount();

      // If showing favorites only, update the view
      if (showingFavoritesOnly) {
        filterFavorites();
      }
    }

    function updateFavoritesCount() {
      const countElement = document.getElementById('favoritesCount');
      if (countElement) {
        countElement.textContent = favorites.length;
      }
    }

    function filterFavorites() {
      const cards = document.querySelectorAll('.card');
      const sections = document.querySelectorAll('.mb-6');
      const toggle = document.getElementById('favoritesToggle');

      if (showingFavoritesOnly) {
        toggle.classList.add('active');

        // Show only favorited cards
        cards.forEach(card => {
          const favoriteBtn = card.querySelector('.favorite-btn');
          const favoriteId = favoriteBtn?.getAttribute('data-favorite');

          if (favorites.includes(favoriteId)) {
            card.style.display = '';
            card.classList.add('scale-in');
          } else {
            card.style.display = 'none';
          }
        });

        // Hide empty sections
        sections.forEach(section => {
          const visibleCards = Array.from(section.querySelectorAll('.card')).filter(
            card => card.style.display !== 'none'
          );
          section.style.display = visibleCards.length === 0 ? 'none' : '';
        });

        // Show empty state if no favorites
        if (favorites.length === 0) {
          showEmptyState();
        } else {
          removeEmptyState();
        }
      } else {
        toggle.classList.remove('active');

        // Show all cards
        cards.forEach(card => {
          card.style.display = '';
        });

        sections.forEach(section => {
          section.style.display = '';
        });

        removeEmptyState();
      }
    }

    function showEmptyState() {
      const container = document.querySelector('.container');
      const existingEmpty = document.getElementById('favoritesEmpty');

      if (!existingEmpty) {
        const emptyState = document.createElement('div');
        emptyState.id = 'favoritesEmpty';
        emptyState.className = 'favorites-empty';
        emptyState.innerHTML = \`
          <div class="favorites-empty-icon">♡</div>
          <div class="favorites-empty-title">No favorites yet</div>
          <div class="favorites-empty-text">Click the heart icon on any component to add it to your favorites</div>
        \`;

        const firstSection = container.querySelector('.mb-6');
        if (firstSection) {
          firstSection.parentNode.insertBefore(emptyState, firstSection);
        }
      }
    }

    function removeEmptyState() {
      const emptyState = document.getElementById('favoritesEmpty');
      if (emptyState) {
        emptyState.remove();
      }
    }

    // Favorites toggle button
    const favoritesToggle = document.getElementById('favoritesToggle');
    if (favoritesToggle) {
      favoritesToggle.addEventListener('click', () => {
        showingFavoritesOnly = !showingFavoritesOnly;
        filterFavorites();
      });
    }

    // Initialize favorites on page load
    initFavorites();
  </script>`;

  content = content.replace('  </script>', favoritesScript);

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${filename}`);
});

console.log('\n🎉 All files updated with favorites functionality!');
