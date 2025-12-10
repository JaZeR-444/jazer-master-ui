# Project Organization

This document explains the folder structure and organization of the [HTML][CSS][JS] project.

## Directory Structure

```
HTML-CSS-JS-Library/
├── [HTML]/                # All HTML component directories
│   └── Directories/           # ADVANCED-, COMPONENTS-, LAYOUTS-, etc. files
├── [CSS]/                 # CSS reference docs
│   └── categories/            # Category-specific examples and indexes
├── [JS]/                  # Vanilla JS modules (animations, charts, utils…)
├── assets/                # Shared fonts, icons, and images
├── scripts/               # Build and maintenance tooling
├── docs/                  # Documentation files
├── dist/                  # Distribution output (generated)
├── favorites.html         # Favorites landing page
├── index.html             # Hub page with global search
├── jazer-brand.css        # Global styling
└── package.json           # Tooling scripts and dev dependencies
```

## Purpose

This organization allows for:
- Clear separation between HTML, CSS, and JavaScript libraries at the root
- Better navigation and discoverability of component categories
- Logical grouping of related files with minimal nesting
- Easier maintenance and updates
- Consistent development workflow focused on the hub experience
