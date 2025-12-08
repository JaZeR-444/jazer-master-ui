// Page template utilities

function createPageTemplate(title, content, options = {}) {
  const {
    cssFiles = [],
    jsFiles = [],
    headerContent = '',
    footerContent = '',
    useBootstrap = false,
    customStyles = ''
  } = options;

  // Build the HTML structure
  let html = '<!DOCTYPE html>\n';
  html += '<html lang="en">\n';
  html += '<head>\n';
  html += `  <meta charset="UTF-8">\n`;
  html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
  html += `  <title>${title}</title>\n`;

  // Add Bootstrap if requested
  if (useBootstrap) {
    html += '  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n';
  }

  // Add custom CSS files
  cssFiles.forEach(file => {
    html += `  <link rel="stylesheet" href="${file}">\n`;
  });

  // Add custom styles
  if (customStyles) {
    html += '  <style>\n';
    html += customStyles;
    html += '  </style>\n';
  }

  html += '</head>\n';
  html += '<body>\n';
  
  // Add header content
  if (headerContent) {
    html += `  <header>\n    ${headerContent}\n  </header>\n`;
  }

  // Add main content
  html += `  <main>\n    ${content}\n  </main>\n`;

  // Add footer content
  if (footerContent) {
    html += `  <footer>\n    ${footerContent}\n  </footer>\n`;
  }

  // Add Bootstrap JS if requested
  if (useBootstrap) {
    html += '  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n';
  }

  // Add custom JS files
  jsFiles.forEach(file => {
    html += `  <script src="${file}"></script>\n`;
  });

  html += '</body>\n';
  html += '</html>';

  return html;
}

// Layout template
function createLayoutTemplate(layoutType, contentAreas, options = {}) {
  const {
    title = 'Page',
    sidebarContent = '',
    navigationContent = '',
    customClasses = ''
  } = options;

  let layoutHTML = '';

  switch (layoutType) {
    case 'sidebar':
      layoutHTML = `
        <div class="layout-container ${customClasses}">
          <aside class="sidebar">
            ${sidebarContent}
          </aside>
          <div class="main-content">
            <nav class="navigation">
              ${navigationContent}
            </nav>
            <div class="content">
              ${contentAreas.main || ''}
            </div>
          </div>
        </div>
      `;
      break;

    case 'header-footer':
      layoutHTML = `
        <div class="layout-container ${customClasses}">
          <header class="page-header">
            ${contentAreas.header || ''}
          </header>
          <main class="main-content">
            ${contentAreas.main || ''}
          </main>
          <footer class="page-footer">
            ${contentAreas.footer || ''}
          </footer>
        </div>
      `;
      break;

    case 'grid':
      layoutHTML = `
        <div class="layout-container ${customClasses}">
          <div class="grid-layout">
            ${contentAreas.gridItems ? contentAreas.gridItems.map(item => `<div class="grid-item">${item}</div>`).join('\n') : ''}
          </div>
        </div>
      `;
      break;

    default:
      layoutHTML = `
        <div class="layout-container ${customClasses}">
          <main class="main-content">
            ${contentAreas.main || ''}
          </main>
        </div>
      `;
  }

  return createPageTemplate(title, layoutHTML, options);
}

export { createPageTemplate, createLayoutTemplate };