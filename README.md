# JaZeR Component Library

A comprehensive, copy-paste-ready reference library of vanilla HTML, CSS, and JavaScript components and patterns.

## 🚀 Quick Start

1. Open `index.html` in your browser - this is the **Hub** page
2. Use the **global search** to find components across all libraries
3. Click on a library card to explore categories
4. Find a component, copy the code, and use it in your project!

## ✨ Key Features

- **100% Vanilla** - No frameworks, no dependencies
- **Copy-Paste Ready** - Each file is self-contained and complete
- **Fully Responsive** - Mobile-first, adapts to all screen sizes
- **Accessible** - ARIA labels, semantic HTML, keyboard navigation
- **Well Documented** - Clear comments throughout the code
- **Modern CSS** - Flexbox, Grid, CSS custom properties
- **Global Search** - Search 1,280+ components from the hub
- **Favorites System** - Save your favorite components for quick access
- **Dark/Light Theme** - Persisted across sessions

## 📁 Project Structure

```
/
├── index.html                    # Hub page with global search
├── search-index.json             # Auto-generated search index
├── src/
│   ├── css/
│   │   ├── jazer-brand.css       # Main stylesheet
│   │   └── categories/
│   │       ├── MASTER-INDEX.html # CSS library home
│   │       ├── buttons-and-controls/
│   │       ├── forms-status-and-micro-ux/
│   │       ├── navigation-and-menus/
│   │       └── ... (17 categories, 900+ components)
│   ├── html/
│   │   ├── Directories/
│   │   │   └── ALL-IN-ONE-HOME.html  # HTML library home
│   │   ├── advanced/
│   │   ├── components/
│   │   ├── forms/
│   │   ├── layouts/
│   │   ├── media/
│   │   ├── navigation/
│   │   ├── patterns/
│   │   └── utilities/            # 247 components
│   └── js/
│       ├── MASTER-INDEX.html     # JS library home
│       ├── animations/
│       ├── charts/
│       ├── components/
│       ├── forms/
│       ├── hooks/
│       ├── icons/
│       ├── modules/
│       ├── patterns/
│       ├── templates/
│       ├── themes/
│       └── utils/                # 133 modules
└── scripts/
    ├── generate-subdirectory-indexes.js  # Regenerate category pages
    ├── generate-search-index.js          # Rebuild search index
    └── update-component-counts.js        # Update statistics
```

## 📊 Library Statistics

| Library | Type | Count |
|---------|------|-------|
| **HTML** | Components | 247+ |
| **CSS** | Styles | 900+ |
| **JavaScript** | Modules | 133+ |
| **Total** | | **1,280+** |

## 🔧 Scripts

After adding new components, run these scripts to update the library:

```bash
# Regenerate all subdirectory index pages (with favorites)
node scripts/generate-subdirectory-indexes.js

# Update component counts on all master pages
node scripts/update-component-counts.js

# Rebuild the search index
node scripts/generate-search-index.js
```

## 🎯 Using Components

### Method 1: Browse & Copy
1. Navigate to a category (e.g., `/src/html/components/`)
2. Open a component file (e.g., `COMPONENTS-buttons.html`)
3. Copy the code from the file
4. Paste into your project

### Method 2: Search
1. Use the global search on the hub page
2. Type what you're looking for
3. Click on a result to view the component
4. Copy the code

## ⭐ Favorites System

Click the heart icon on any component to save it to your favorites:
- Favorites persist across sessions (localStorage)
- Click the "Favorites" button to filter and show only favorites
- Separate favorites for HTML, CSS, and JS libraries

## 🎨 Theming

The library supports dark and light themes:
- Click the theme toggle icon (sun/moon)
- Theme persists across sessions
- All components respect the current theme

## 🔍 Search Features

The global search on the hub page:
- Searches across all 3 libraries simultaneously
- Matches by title, filename, category, and keywords
- Shows up to 15 results at a time
- Color-coded badges indicate the library type

## 📱 Responsive Design

All components are designed with a mobile-first approach:
- Fluid layouts that adapt to any screen size
- Touch-friendly interactive elements
- Optimized for both desktop and mobile viewing

## 🤝 Contributing

To add new components:

1. Create a new `.html` or `.js` file in the appropriate directory
2. Follow the existing naming conventions:
   - HTML: `CATEGORY-component-name.html`
   - CSS: `component-name.html`
   - JS: `component-name.js`
3. Make the file self-contained (include all HTML, CSS, JS)
4. Add clear comments explaining how it works
5. Run the regeneration scripts to update indexes

## 📜 License

© 2025 JaZeR Ventures. All rights reserved.

---

*Crafted with passion. Built with code.*