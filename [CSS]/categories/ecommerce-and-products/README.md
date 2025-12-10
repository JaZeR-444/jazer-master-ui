# E-commerce & Products Components

This directory contains all e-commerce and product-related components for the JaZeR UI library. All CSS files have been organized into the `css/` subdirectory and follow BEM (Block Element Modifier) naming conventions.

## Directory Structure

```
ecommerce-and-products/
├── css/              # CSS files for e-commerce components
│   ├── pricing-plans.css
│   ├── wishlist-favorites.css
│   ├── reviews-and-ratings.css
│   ├── product-comparison.css
│   ├── product-carousel.css
│   ├── checkout-flow.css
│   ├── product-filters.css
│   ├── shopping-cart.css
│   ├── product-detail.css
│   └── product-grid.css
├── js/               # JavaScript files for e-commerce components
├── images/           # Image assets for e-commerce components
├── index.html        # Category index page
└── README.md         # This documentation
```

## Component Categories

### Product Display
- Product cards and grids
- Product detail pages
- Product galleries and carousels
- Product comparison tools

### Shopping Cart & Checkout
- Shopping cart interfaces
- Checkout flow layouts
- Progress indicators
- Payment options

### Reviews & Ratings
- Star rating systems
- Review displays
- Review submission forms
- Rating summaries

### Product Management
- Product filters and sorting
- Wishlist and favorites
- Pricing plans and tiers
- Inventory displays

### Shopping Features
- Add to cart animations
- Quick view modals
- Product recommendations
- Related products

## BEM Naming Convention

All CSS classes follow BEM methodology:
- `.product-grid` (Block)
- `.product-grid__item` (Element)
- `.product-grid__item--featured` (Modifier)

## Usage

To use any component:
1. Include the relevant CSS file from the `css/` directory
2. Implement the HTML structure as shown in the component file
3. Add any necessary JavaScript from the `js/` directory if required

## Standards

- All components are responsive by default
- Accessibility standards are implemented
- CSS follows BEM naming convention
- Components have minimal dependencies
- Cross-browser compatibility is maintained