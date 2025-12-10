# BEM Naming Convention Standards

## Overview
This document outlines the Block-Element-Modifier (BEM) methodology for CSS class naming in the JaZeR UI component library. BEM provides a clear, consistent naming convention that makes CSS more maintainable and scalable.

## BEM Structure
- **Block**: A standalone entity that is meaningful on its own (e.g., `.button`, `.menu`, `.header`)
- **Element**: A part of a block that has no standalone meaning (e.g., `.menu__item`, `.button__icon`)
- **Modifier**: A flag on a block or element that changes appearance or behavior (e.g., `.button--primary`, `.menu__item--active`)

## Naming Format
- Block: `block-name`
- Element: `block-name__element-name`
- Modifier: `block-name--modifier-name` or `block-name__element-name--modifier-name`

## Examples

### Current naming in the codebase:
- `.dropdown-toggle` (should be `.dropdown__toggle`)
- `.dropdown-menu` (should be `.dropdown__menu`)
- `.dropdown-item` (should be `.dropdown__item`)
- `.hamburger-toggle` (should be `.hamburger__toggle`)
- `.hamburger-panel` (should be `.hamburger__panel`)
- `.hamburger-list` (should be `.hamburger__list`)

### Standardized BEM naming:
- `.dropdown__toggle`
- `.dropdown__menu`
- `.dropdown__item`
- `.dropdown__item--active`
- `.dropdown__menu--dark`
- `.hamburger__toggle`
- `.hamburger__panel`
- `.hamburger__list`
- `.hamburger__toggle--active`
- `.hamburger__panel--right`

## Implementation Guidelines

1. Each component should have a single root block class
2. All elements within the block should use the `block__element` format
3. Variants of blocks or elements should use the `block--modifier` or `block__element--modifier` format
4. Avoid deep nesting (no more than 3 levels: block__element--modifier)
5. Use double underscores (`__`) to separate block and element
6. Use double dashes (`--`) to separate block/element and modifier
7. Use hyphens to separate words within block, element, or modifier names
8. Keep names descriptive but concise
9. Use consistent terminology across components (e.g., always use `__item` not `__element` for list items)

## Component Structure Example

```html
<!-- Current structure -->
<div class="dropdown">
  <button class="dropdown-toggle">Menu</button>
  <ul class="dropdown-menu">
    <li class="dropdown-item">Item 1</li>
    <li class="dropdown-item dropdown-item-active">Item 2</li>
  </ul>
</div>

<!-- BEM-compliant structure -->
<div class="dropdown">
  <button class="dropdown__toggle">Menu</button>
  <ul class="dropdown__menu">
    <li class="dropdown__item">Item 1</li>
    <li class="dropdown__item dropdown__item--active">Item 2</li>
  </ul>
</div>
```

## Migration Plan
1. Identify all non-BEM compliant class names
2. Create a mapping of old to new class names
3. Update CSS files with new BEM-compliant names
4. Update HTML files to use new class names
5. Update any JavaScript that references these classes
6. Test all components after migration