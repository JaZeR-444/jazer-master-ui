# JaZeR Component Library

A comprehensive, copy-paste-ready reference library of vanilla HTML, CSS, and JavaScript components and patterns.

## 🚀 Quick Start

1. Open `index.html` in your browser - this is the **Hub** page
2. Use the **global search** (or press `/`) to find components across all libraries
3. Click on a library card to explore categories
4. Find a component, copy the code, and use it in your project!

## ✨ Key Features

- **Vanilla-first approach** - Designed with minimal dependencies; *note: some "hook-like" patterns and CSS preprocessor syntax may be present, indicating potential hidden dependencies or build steps.*
- **Copy-Paste Ready snippets** - Core component HTML, inline CSS, and JavaScript are designed for direct integration; *note: example files demonstrating components often link to `jazer-brand.css` for consistent library-wide styling.*
- **Fully Responsive** - Mobile-first, adapts to all screen sizes
- **Accessible** - ARIA labels, semantic HTML, keyboard navigation
- **Well Documented** - Clear comments throughout the code
- **Modern CSS** - Utilizes Flexbox, Grid, and CSS custom properties
- **Global Search** - Search 2,230+ components from the hub (press `/` to focus)
- **Favorites System** - Save your favorite components with ⭐ buttons
- **Dark/Light Theme** - Persisted across sessions

## 📁 Project Structure

```
/
├── index.html                    # Hub page with global search
├── favorites.html                # View saved favorites
├── jazer-brand.css               # Main brand stylesheet
├── HTML-5-Logo.svg               # HTML5 logo asset
├── CSS-3-Logo.svg                # CSS3 logo asset
├── JavaScript-Logo.svg           # JavaScript logo asset
│
├── [CSS]/
│   └── categories/
│       ├── MASTER-INDEX.html
│       ├── ai-and-voice-interactions/
│       ├── background-and-atmosphere/
│       ├── badges-and-labels/
│       ├── buttons-and-controls/
│       ├── cards-and-content-blocks/
│       ├── chat-and-messaging-interfaces/
│       ├── cursors-and-mouse-effects/
│       ├── data-visualization-and-charts/
│       ├── developer-tools/
│       ├── ecommerce-and-products/
│       ├── feedback-and-alerts/
│       ├── file-management-and-uploads/
│       ├── forms-status-and-micro-ux/
│       ├── gamification-and-rewards/
│       ├── layout-components/
│       ├── maps-and-geolocation/
│       ├── marketing-and-conversion/
│       ├── media-and-audio-visuals/
│       ├── modals-popups-and-overlays/
│       ├── navigation-and-menus/
│       ├── onboarding-and-user-education/
│       ├── scroll-and-page-transitions/
│       ├── security-auth-and-login/
│       ├── social-feed-and-community/
│       ├── text-and-typography/
│       └── tools-and-utilities/
│
├── [HTML]/
│   └── Directories/
│       └── ALL-IN-ONE-HOME.html
│
├── [JS]/
│   └── all-components.html
│
└── scripts/
    ├── build-search-index.js
    ├── search-index.js
    ├── global-search.js
    ├── favorites.js
    ├── add-pills-to-cards.js
    └── add-favorites-to-indices.js
```

## 🎨 Styling & Branding (`jazer-brand.css`)

The `jazer-brand.css` file serves as the foundational stylesheet for the entire library. It defines global typography, color palettes, spacing, and common UI element styles (like buttons, cards, and forms) to ensure a consistent look and feel across all components when viewed within the JaZeR Library environment.

**Important Considerations for Integration:**

-   **Component Examples:** When viewing individual component `.html` files (e.g., in `[HTML]/Directories/`), they often include a `<link>` to `jazer-brand.css` to render correctly with the intended library styling.
-   **Your Project:** If you copy a component snippet into your own project, you may need to either:
    *   **Integrate `jazer-brand.css`:** Link to this stylesheet in your project's `<head>` section if you wish to maintain the JaZeR branding and utility classes.
    *   **Extract and Customize:** Manually extract and adapt the necessary styles from `jazer-brand.css` or the component's embedded `<style>` block to fit your project's existing design system.
-   **CSS Preprocessor Syntax:** Note that `jazer-brand.css` and some component styles may contain CSS preprocessor syntax (e.g., `@extend` rules) which would typically require a build step (like Sass or Less) to compile into standard CSS. The project documentation currently states "No Build Tools," which is an inconsistency that should be noted.

## 📊 Library Statistics

| Library | Type | Count |
|---------|------|-------|
| **CSS** | Styles & Effects | 1,693 |
| **HTML** | Components | 390 |
| **JavaScript** | Modules | 147 |
| **Total** | | **2,230+** |

## 🎨 CSS Categories (26 Total)

| Category | Components | Description |
|----------|------------|-------------|
| AI & Voice Interactions | 45 | Voice UI, AI chat, speech recognition |
| Background & Atmosphere | 155 | Gradients, particles, animated backgrounds |
| Badges & Labels | 38 | Status badges, tags, labels |
| Buttons & Controls | 106 | Interactive buttons, toggles, switches |
| Cards & Content Blocks | 0 | Card layouts, content containers |
| Chat & Messaging Interfaces | 0 | Chat bubbles, message lists |
| Cursors & Mouse Effects | 152 | Custom cursors, hover effects |
| Data Visualization & Charts | 68 | Charts, graphs, data displays |
| Developer Tools | 42 | Code editors, debuggers, consoles |
| E-commerce & Products | 52 | Product cards, carts, checkout |
| Feedback & Alerts | 48 | Notifications, toasts, alerts |
| File Management & Uploads | 38 | File pickers, upload progress |
| Forms, Status & Micro-UX | 59 | Inputs, validation, status indicators |
| Gamification & Rewards | 54 | Achievements, progress, leaderboards |
| Layout Components | 42 | Grids, containers, dividers |
| Maps & Geolocation | 35 | Map displays, location pickers |
| Marketing & Conversion | 45 | CTAs, banners, popups |
| Media & Audio Visuals | 72 | Video players, audio, galleries |
| Modals, Popups & Overlays | 63 | Dialogs, lightboxes, overlays |
| Navigation & Menus | 55 | Navbars, menus, breadcrumbs |
| Onboarding & User Education | 42 | Tours, tooltips, walkthroughs |
| Scroll & Page Transitions | 58 | Scroll effects, page transitions |
| Security, Auth & Login | 48 | Login forms, 2FA, auth flows |
| Social Feed & Community | 49 | Posts, comments, profiles |
| Text & Typography | 0 | Text effects, fonts, styling |
| Tools & Utilities | 38 | Helpers, utilities, misc |

## 🔧 Scripts

After adding new components, run these scripts to update the library:

```bash
# Rebuild the global search index (required after adding components)
node scripts/build-search-index.js

# Add meta-badges (pills) to component cards
node scripts/add-pills-to-cards.js

# Add favorites buttons to category indices
node scripts/add-favorites-to-indices.js
```

## 🎯 Using Components

### Method 1: Global Search
1. Press `/` or click the search bar on the hub page
2. Type what you're looking for (e.g., "button", "modal", "animation")
3. Use `↑/↓` keys to navigate, `Enter` to select
4. Copy the code from the component file

### Method 2: Browse Categories
1. Select a library (HTML, CSS, or JS)
2. Browse the category cards
3. Click on a component to view it
4. Copy the code into your project

## ⭐ Favorites System

Click the ⭐ star icon on any component card to save it:
- Favorites persist across sessions (localStorage)
- View all favorites at `favorites.html`
- Remove favorites with the ✕ button

## 🎨 Theming

The library supports dark and light themes:
- Click the theme toggle (🌙/☀️) in the top-right corner
- Theme persists across browser sessions
- All index pages respect the current theme

## 🔍 Global Search Features

The global search on the hub page includes:
- **Fuzzy matching** - Typo-tolerant search
- **Keyboard shortcuts** - `/` to focus, `↑/↓` to navigate, `Enter` to open
- **Grouped results** - Color-coded by library (CSS, HTML, JS)
- **Highlighted matches** - Query text highlighted in results
- **Fast** - Searches all components instantly

## 🏷️ Component Meta-Badges

Each component card shows contextual badges:
- **💜 JaZeR** - Original JaZeR creations
- **⚡ Easy/Medium/Advanced** - Complexity level
- **🎨 CSS3 / CSS3 + JS** - Technology used

## 📱 Responsive Design

All components are designed with a mobile-first approach:
- Fluid layouts that adapt to any screen size
- Touch-friendly interactive elements
- Optimized for both desktop and mobile viewing

## 🤝 Contributing

To add new components:

1. Create a new `.html` file in the appropriate category directory
2. Make the file self-contained (include all HTML, CSS, JS in one file)
3. Add clear comments explaining how it works
4. Run `node scripts/build-search-index.js` to update search
5. Run other scripts as needed to update badges and favorites

### Naming Conventions
- Standard components: `component-name.html` (kebab-case)
- JaZeR Originals: `jazer-component-name.html`
- Enhanced versions: `enhanced-component-name.html`

## 📜 License

© 2025 JaZeR Ventures. All rights reserved.

---

*Crafted with passion. Built with code.*