# GEMINI.md

## Project Overview

This project is a comprehensive, copy-paste-ready reference library of vanilla HTML, CSS, and minimal JavaScript components and layout patterns. It serves as a valuable resource for front-end development, offering self-contained, responsive, and accessible examples for common web UI elements and page structures. The primary goal is to provide developers with production-ready snippets that can be easily integrated into any web project without external frameworks or dependencies.

### Key Features:
*   **100% Vanilla:** No external frameworks, libraries, or dependencies are used.
*   **Copy-Paste Ready:** Each file is a standalone, complete example ready for direct integration.
*   **Fully Responsive:** Components and layouts are designed with a mobile-first approach, adapting to various screen sizes.
*   **Accessible:** Adherence to accessibility best practices, including proper ARIA labels, semantic HTML, and keyboard navigation.
*   **Well Commented:** Code is thoroughly commented to explain key sections, styles, and functionalities.
*   **Modern CSS:** Utilizes Flexbox, Grid, and CSS custom properties where appropriate.

## Building and Running

This project does not require a traditional build process (e.g., compiling, bundling) as it consists of static HTML, CSS, and JavaScript files.

To "run" or view the components:

1.  **Open `INDEX.html`:** Navigate to the root of the project directory and open `INDEX.html` in any web browser. This file acts as a visual index to browse all available components and layout patterns.
2.  **Direct File Access:** Alternatively, you can open any specific component file (e.g., `components/buttons.html`, `layouts/hero-section-cta.html`) directly in a web browser to view that component in isolation.

There are no specific testing commands beyond visual inspection in a browser.

## Development Conventions

Based on the existing codebase and `README.md`, the following conventions are observed:

*   **File Structure:** Components are organized into logical subdirectories (e.g., `navigation`, `layouts`, `components`, `forms`, `media`, `utilities`, `advanced`).
*   **Self-Contained Files:** Each `.html` file is designed to be self-contained, including all necessary HTML structure, embedded CSS within `<style>` tags in the `<head>`, and JavaScript within `<script>` tags (typically at the end of the `<body>` or within the `<head>` for small scripts).
*   **Vanilla Code:** Strict adherence to vanilla HTML, CSS, and JavaScript, avoiding any third-party libraries or frameworks.
*   **Class Naming:** BEM-like (Block-Element-Modifier) conventions are frequently used for CSS classes (e.g., `btn`, `btn--primary`, `modal-overlay--active`).
*   **Responsive Design:** Mobile-first approach using `@media` queries for responsive adjustments.
*   **Accessibility (A11y):** Emphasis on semantic HTML, ARIA attributes (e.g., `role`, `aria-label`), and keyboard operability for interactive elements.
*   **Comments:** Extensive use of comments in both HTML and CSS to explain sections, design choices, and usage notes. JavaScript also includes function-level comments.
*   **Consistent Styling:** Use of predefined color values (e.g., `#3498db` for primary, `#2ecc71` for success) and consistent spacing values.
*   **No Build Tools:** The project is intentionally free of build tools, transpilers, or package managers to maintain its "copy-paste ready" nature.

## Extending the Library

To add new components or patterns:

1.  Create a new `.html` file within an existing or new category folder.
2.  Ensure the file is self-contained with embedded HTML, CSS, and JavaScript.
3.  Include clear comments explaining the component's structure, styling, and functionality.
4.  Update `INDEX.html` to include a link and description of the new component for discoverability.
