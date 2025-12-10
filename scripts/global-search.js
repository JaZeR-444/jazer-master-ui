/**
 * JaZeR Global Search Module
 * Provides fuzzy search across all component libraries
 */

const JaZerSearch = (function () {
    let searchIndex = [];
    let isLoaded = false;

    // Load search index from global variable (loaded via script tag)
    function loadIndex() {
        if (isLoaded) return;

        if (typeof SEARCH_INDEX_DATA !== 'undefined') {
            searchIndex = SEARCH_INDEX_DATA;
            isLoaded = true;
            console.log(`Search index loaded: ${searchIndex.length} components`);
        } else {
            console.error('Search index not found. Make sure search-index.js is loaded.');
        }
    }

    // Simple fuzzy match scoring
    function fuzzyMatch(text, query) {
        text = text.toLowerCase();
        query = query.toLowerCase();

        // Exact match gets highest score
        if (text === query) return 100;

        // Starts with query
        if (text.startsWith(query)) return 80;

        // Contains query
        if (text.includes(query)) return 60;

        // Check each word
        const words = text.split(/\s+/);
        for (const word of words) {
            if (word.startsWith(query)) return 50;
        }

        // Fuzzy character matching
        let queryIndex = 0;
        let matchedChars = 0;
        for (let i = 0; i < text.length && queryIndex < query.length; i++) {
            if (text[i] === query[queryIndex]) {
                matchedChars++;
                queryIndex++;
            }
        }

        if (queryIndex === query.length) {
            return Math.floor((matchedChars / text.length) * 40);
        }

        return 0;
    }

    // Search with scoring
    function search(query, limit = 10) {
        if (!query || query.length < 2) return [];

        const results = [];

        for (const item of searchIndex) {
            // Score based on name match
            let score = fuzzyMatch(item.name, query);

            // Boost if category matches
            if (item.category.toLowerCase().includes(query.toLowerCase())) {
                score += 20;
            }

            // Boost if keywords match
            if (item.keywords) {
                for (const keyword of item.keywords) {
                    if (keyword.includes(query.toLowerCase())) {
                        score += 10;
                        break;
                    }
                }
            }

            if (score > 0) {
                results.push({ ...item, score });
            }
        }

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, limit);
    }

    // Group results by library
    function groupByLibrary(results) {
        const groups = { CSS: [], HTML: [], JS: [] };
        for (const item of results) {
            if (groups[item.library]) {
                groups[item.library].push(item);
            }
        }
        return groups;
    }

    // Initialize search on a container element
    function init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Create search UI
        container.innerHTML = `
            <div class="global-search">
                <div class="search-wrapper">
                    <span class="search-icon">🔍</span>
                    <input type="text" 
                           class="global-search-input" 
                           id="globalSearchInput"
                           placeholder="Search 2,230+ components..." 
                           autocomplete="off">
                    <span class="search-shortcut">Press /</span>
                </div>
                <div class="search-results" id="searchResults"></div>
            </div>
        `;

        const input = document.getElementById('globalSearchInput');
        const resultsContainer = document.getElementById('searchResults');
        let selectedIndex = -1;

        // Load index
        loadIndex();

        // Handle input
        input.addEventListener('input', () => {
            const query = input.value.trim();

            if (query.length < 2) {
                resultsContainer.style.display = 'none';
                return;
            }

            const results = search(query, 12);
            selectedIndex = -1;
            renderResults(results, resultsContainer, query);
        });

        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
            const items = resultsContainer.querySelectorAll('.search-result-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items, selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateSelection(items, selectedIndex);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const selected = items[selectedIndex];
                if (selected) {
                    window.location.href = selected.getAttribute('data-path');
                }
            } else if (e.key === 'Escape') {
                resultsContainer.style.display = 'none';
                input.blur();
            }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });

        // Focus on / key
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== input) {
                e.preventDefault();
                input.focus();
            }
        });
    }

    function updateSelection(items, index) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });

        // Scroll into view
        if (items[index]) {
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    function renderResults(results, container, query) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <span>😕</span> No results for "${query}"
                </div>
            `;
            container.style.display = 'block';
            return;
        }

        const grouped = groupByLibrary(results);
        let html = '';

        for (const [library, items] of Object.entries(grouped)) {
            if (items.length === 0) continue;

            const libClass = library.toLowerCase();
            html += `<div class="search-group">
                <div class="search-group-header ${libClass}">${library} Library</div>`;

            for (const item of items) {
                // Highlight matching text
                const highlightedName = highlightMatch(item.name, query);

                html += `
                    <div class="search-result-item" data-path="${item.path}">
                        <span class="result-icon">${item.icon}</span>
                        <div class="result-info">
                            <div class="result-name">${highlightedName}</div>
                            <div class="result-category">${item.category}</div>
                        </div>
                        <span class="result-library ${libClass}">${library}</span>
                    </div>
                `;
            }

            html += '</div>';
        }

        container.innerHTML = html;
        container.style.display = 'block';

        // Add click handlers
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = item.getAttribute('data-path');
            });
        });
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    return {
        loadIndex,
        search,
        groupByLibrary,
        init
    };
})();

if (typeof window !== 'undefined') {
    window.JaZerSearch = JaZerSearch;
}
