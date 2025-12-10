/**
 * JaZeR Favorites Manager
 * Vanilla JavaScript module for managing component favorites via localStorage
 * 
 * Usage:
 * - Include this script in any page that needs favorites functionality
 * - Call JaZerFavorites.init() to initialize favorite buttons on the page
 */

const JaZerFavorites = (function () {
    const STORAGE_KEY = 'jazer-favorites';

    /**
     * Get all saved favorites from localStorage
     * @returns {Array} Array of favorite objects
     */
    function getFavorites() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error reading favorites:', e);
            return [];
        }
    }

    /**
     * Save favorites array to localStorage
     * @param {Array} favorites - Array of favorite objects to save
     */
    function saveFavorites(favorites) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch (e) {
            console.error('Error saving favorites:', e);
        }
    }

    /**
     * Check if a component is favorited by its path
     * @param {string} path - The component file path
     * @returns {boolean} True if favorited
     */
    function isFavorite(path) {
        const favorites = getFavorites();
        return favorites.some(fav => fav.path === path);
    }

    /**
     * Add a component to favorites
     * @param {Object} item - Component data { path, name, icon, category, library }
     * @returns {boolean} True if added successfully
     */
    function addFavorite(item) {
        if (!item.path) return false;

        const favorites = getFavorites();
        if (!favorites.some(fav => fav.path === item.path)) {
            favorites.push({
                path: item.path,
                name: item.name || 'Unnamed Component',
                icon: item.icon || '📦',
                category: item.category || 'Uncategorized',
                library: item.library || 'Unknown',
                addedAt: Date.now()
            });
            saveFavorites(favorites);
            return true;
        }
        return false;
    }

    /**
     * Remove a component from favorites by path
     * @param {string} path - The component file path
     * @returns {boolean} True if removed successfully
     */
    function removeFavorite(path) {
        const favorites = getFavorites();
        const filtered = favorites.filter(fav => fav.path !== path);
        if (filtered.length !== favorites.length) {
            saveFavorites(filtered);
            return true;
        }
        return false;
    }

    /**
     * Toggle favorite status for a component
     * @param {Object} item - Component data
     * @returns {boolean} New favorite status (true = favorited)
     */
    function toggleFavorite(item) {
        if (isFavorite(item.path)) {
            removeFavorite(item.path);
            return false;
        } else {
            addFavorite(item);
            return true;
        }
    }

    /**
     * Clear all favorites
     */
    function clearAllFavorites() {
        saveFavorites([]);
    }

    /**
     * Create a favorite toggle button element
     * @param {Object} item - Component data
     * @returns {HTMLElement} The button element
     */
    function createFavoriteButton(item) {
        const btn = document.createElement('button');
        btn.className = 'favorite-btn';
        btn.setAttribute('aria-label', 'Toggle favorite');
        btn.setAttribute('data-path', item.path);

        const updateState = () => {
            const isFav = isFavorite(item.path);
            btn.innerHTML = isFav ? '⭐' : '☆';
            btn.classList.toggle('is-favorited', isFav);
            btn.setAttribute('aria-pressed', isFav);
        };

        updateState();

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(item);
            updateState();

            // Trigger animation
            btn.classList.add('favorite-pulse');
            setTimeout(() => btn.classList.remove('favorite-pulse'), 300);
        });

        return btn;
    }

    /**
     * Initialize favorite buttons on component cards
     * Call this after DOM is ready on pages with component listings
     * 
     * @param {Object} options - Configuration options
     * @param {string} options.cardSelector - CSS selector for component cards (default: '.component-card')
     * @param {string} options.library - Library name (e.g., 'CSS', 'HTML', 'JS')
     * @param {string} options.category - Category name
     */
    function init(options = {}) {
        const cardSelector = options.cardSelector || '.component-card';
        const library = options.library || 'Unknown';
        const category = options.category || 'Uncategorized';

        document.querySelectorAll(cardSelector).forEach(card => {
            // Skip if already has a favorite button
            if (card.querySelector('.favorite-btn')) return;

            const href = card.getAttribute('href') || '';
            const nameEl = card.querySelector('.component-name');
            const iconEl = card.querySelector('.component-icon');

            // Build full path relative to site root
            // Get current page path and resolve the href against it
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            const fullPath = basePath + href;

            const item = {
                path: fullPath,
                name: nameEl ? nameEl.textContent.trim() : 'Unknown Component',
                icon: iconEl ? iconEl.textContent.trim() : '📦',
                category: category,
                library: library
            };

            const btn = createFavoriteButton(item);
            card.style.position = 'relative';
            card.appendChild(btn);
        });
    }

    // Inject CSS for favorite buttons (only once)
    function injectStyles() {
        if (document.getElementById('jazer-favorites-styles')) return;

        const style = document.createElement('style');
        style.id = 'jazer-favorites-styles';
        style.textContent = `
            .favorite-btn {
                position: absolute;
                top: 0.75rem;
                right: 0.75rem;
                width: 36px;
                height: 36px;
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 50%;
                background: rgba(10, 10, 10, 0.8);
                cursor: pointer;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                z-index: 10;
                color: rgba(255, 215, 0, 0.5);
            }
            
            .favorite-btn:hover {
                border-color: gold;
                background: rgba(255, 215, 0, 0.1);
                transform: scale(1.1);
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
            }
            
            .favorite-btn.is-favorited {
                color: gold;
                border-color: gold;
                text-shadow: 0 0 10px gold;
            }
            
            .favorite-btn.favorite-pulse {
                animation: favoritePulse 0.3s ease;
            }
            
            @keyframes favoritePulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
            
            /* Light mode adjustments */
            [data-theme="light"] .favorite-btn {
                background: rgba(255, 255, 255, 0.9);
                border-color: rgba(218, 165, 32, 0.4);
                color: rgba(218, 165, 32, 0.6);
            }
            
            [data-theme="light"] .favorite-btn:hover {
                background: rgba(255, 215, 0, 0.1);
            }
            
            [data-theme="light"] .favorite-btn.is-favorited {
                color: #DAA520;
                border-color: #DAA520;
            }
        `;
        document.head.appendChild(style);
    }

    // Auto-inject styles when module loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }

    // Public API
    return {
        getFavorites,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        clearAllFavorites,
        createFavoriteButton,
        init
    };
})();

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JaZerFavorites;
}
