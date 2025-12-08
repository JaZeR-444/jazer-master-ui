# Project Organization

This document explains the folder structure and organization of the [HTML][CSS][JS] project.

## Directory Structure

```
[HTML][CSS][JS]/
├── src/                # Source files
│   ├── css/            # Stylesheets
│   │   ├── base/           # Base styles and resets
│   │   ├── components/     # Component-specific styles
│   │   ├── categories/     # Category-based organization
│   │   ├── jazer-brand.css # Main brand stylesheet
│   │   ├── main.css        # Main stylesheet
│   │   └── component-extensions.css
│   ├── html/           # HTML templates and components
│   │   ├── components/     # UI components
│   │   ├── forms/          # Form components and templates
│   │   ├── layouts/        # Page layout templates
│   │   ├── navigation/     # Navigation components
│   │   ├── media/          # Media components
│   │   ├── utilities/      # Utility components
│   │   ├── patterns/       # Complete page patterns
│   │   ├── [MAIN]-HTML-INDEX/
│   │   └── CYBERPUNK-INDEX/
│   ├── js/             # JavaScript files
│   │   ├── components/     # Component logic
│   │   ├── utils/          # Utility functions
│   │   ├── modules/        # Reusable modules
│   │   └── script.js       # Main script
│   └── assets/         # Static assets
│       ├── images/
│       ├── icons/
│       └── fonts/
├── docs/               # Documentation files
├── scripts/            # Build and utility scripts
├── dist/               # Distribution files (built)
└── index.html          # Entry point
```

## Purpose

This organization allows for:
- Standard "src" based project structure
- Better navigation and file location
- Logical grouping of related files
- Easier maintenance and updates
- Consistent development workflow