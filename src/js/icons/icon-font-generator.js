// Icon font generator utility

class IconFontGenerator {
  constructor(options = {}) {
    this.options = {
      fontFamily: options.fontFamily || 'CustomIcons',
      fontWeight: options.fontWeight || 'normal',
      fontStyle: options.fontStyle || 'normal',
      cssPrefix: options.cssPrefix || 'icon-',
      generateCSS: options.generateCSS !== false,
      generateHTML: options.generateHTML !== false,
      ...options
    };
    
    this.icons = new Map();
    this.iconCodes = {};
    this.nextCode = 0xE001; // Start from private use area
  }
  
  // Add an icon to the font
  addIcon(name, svgPath) {
    // Normalize the name to be CSS-friendly
    const normalizedName = this.normalizeName(name);
    
    if (this.icons.has(normalizedName)) {
      console.warn(`Icon ${normalizedName} already exists. Overwriting.`);
    }
    
    // Assign a Unicode code point
    const codePoint = this.iconCodes[normalizedName] || this.nextCode;
    if (!this.iconCodes[normalizedName]) {
      this.iconCodes[normalizedName] = codePoint;
      this.nextCode++;
    }
    
    this.icons.set(normalizedName, {
      name: normalizedName,
      path: svgPath,
      codePoint: codePoint,
      originalName: name
    });
    
    return this;
  }
  
  // Add multiple icons at once
  addIcons(iconMap) {
    for (const [name, svgPath] of Object.entries(iconMap)) {
      this.addIcon(name, svgPath);
    }
    return this;
  }
  
  // Remove an icon
  removeIcon(name) {
    const normalizedName = this.normalizeName(name);
    this.icons.delete(normalizedName);
    delete this.iconCodes[normalizedName];
    return this;
  }
  
  // Normalize icon name to be CSS-friendly
  normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Generate CSS for the icon font
  generateCSS() {
    if (!this.options.generateCSS) {
      return '';
    }
    
    let css = `@font-face {
  font-family: "${this.options.fontFamily}";
  src: url('./${this.options.fontFamily}.woff2') format('woff2'),
       url('./${this.options.fontFamily}.woff') format('woff');
  font-weight: ${this.options.fontWeight};
  font-style: ${this.options.fontStyle};
  font-display: block;
}

.${this.options.cssPrefix} {
  font-family: "${this.options.fontFamily}" !important;
  font-style: ${this.options.fontStyle} !important;
  font-weight: ${this.options.fontWeight} !important;
  font-variant: normal !important;
  text-transform: none !important;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}\n\n`;

    // Add each icon's CSS class
    for (const [name, icon] of this.icons) {
      css += `.${this.options.cssPrefix}${name}:before { content: "\\${icon.codePoint.toString(16)}"; }\n`;
    }
    
    return css;
  }
  
  // Generate HTML demo page
  generateHTML() {
    if (!this.options.generateHTML) {
      return '';
    }
    
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>${this.options.fontFamily} Demo</title>
  <style>
    @font-face {
      font-family: "${this.options.fontFamily}";
      src: url('./${this.options.fontFamily}.woff2') format('woff2'),
           url('./${this.options.fontFamily}.woff') format('woff');
      font-weight: ${this.options.fontWeight};
      font-style: ${this.options.fontStyle};
      font-display: block;
    }
    
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .icon-item {
      text-align: center;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    
    .icon {
      font-family: "${this.options.fontFamily}" !important;
      font-style: ${this.options.fontStyle} !important;
      font-weight: ${this.options.fontWeight} !important;
      font-variant: normal !important;
      text-transform: none !important;
      line-height: 1;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-size: 2em;
      margin-bottom: 10px;
      display: block;
    }
    
    .icon-name {
      font-size: 0.9em;
      color: #666;
    }
    
    .icon-code {
      font-size: 0.8em;
      color: #999;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <h1>${this.options.fontFamily} Icon Font</h1>
  <div class="icon-grid">\n`;
    
    for (const [name, icon] of this.icons) {
      html += `    <div class="icon-item">
      <span class="${this.options.cssPrefix} ${this.options.cssPrefix}${name} icon"></span>
      <div class="icon-name">${icon.originalName}</div>
      <div class="icon-code">\\${icon.codePoint.toString(16)}</div>
    </div>\n`;
    }
    
    html += `  </div>
</body>
</html>`;
    
    return html;
  }
  
  // Generate icon font configuration
  generateConfig() {
    return {
      fontFamily: this.options.fontFamily,
      fontWeight: this.options.fontWeight,
      fontStyle: this.options.fontStyle,
      cssPrefix: this.options.cssPrefix,
      icons: Array.from(this.icons.values()).map(icon => ({
        name: icon.name,
        originalName: icon.originalName,
        codePoint: icon.codePoint,
        unicode: `\\${icon.codePoint.toString(16)}`
      }))
    };
  }
  
  // Export the font assets
  async export() {
    const config = this.generateConfig();
    const css = this.generateCSS();
    const html = this.generateHTML();
    
    return {
      config,
      css,
      html,
      iconCount: this.icons.size
    };
  }
  
  // Get all registered icons
  getIcons() {
    return Array.from(this.icons.values());
  }
  
  // Check if an icon exists
  hasIcon(name) {
    return this.icons.has(this.normalizeName(name));
  }
  
  // Clear all icons
  clear() {
    this.icons.clear();
    this.iconCodes = {};
    this.nextCode = 0xE001;
  }
}

// SVG to path converter utility
function svgToPath(svgString) {
  // Parse the SVG string and extract path data
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const paths = doc.querySelectorAll('path');
  
  if (paths.length === 0) {
    throw new Error('No path elements found in SVG');
  }
  
  // Combine all path data
  const pathData = Array.from(paths).map(path => path.getAttribute('d')).join(' ');
  
  return pathData;
}

// Create an icon font from a collection of SVGs
function createIconFontFromSVGs(svgCollection, fontFamily, options = {}) {
  const generator = new IconFontGenerator({
    fontFamily,
    ...options
  });
  
  for (const [name, svg] of Object.entries(svgCollection)) {
    try {
      const path = svgToPath(svg);
      generator.addIcon(name, path);
    } catch (error) {
      console.error(`Error processing SVG for icon ${name}:`, error);
    }
  }
  
  return generator;
}

// Font utility functions
function validateSVG(svgString) {
  // Simple validation to check if it looks like an SVG
  if (!svgString.includes('<svg') || !svgString.includes('</svg>')) {
    return false;
  }
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    
    if (!svgElement) {
      return false;
    }
    
    // Check if it has path elements or other valid SVG shapes
    const validShapes = svgElement.querySelectorAll('path, circle, rect, polygon, line, ellipse');
    return validShapes.length > 0;
  } catch (e) {
    return false;
  }
}

// Utility to create a CSS-only icon system (without font generation)
class CSSIconSystem {
  constructor(options = {}) {
    this.options = {
      className: options.className || 'css-icon',
      size: options.size || '1em',
      ...options
    };
    
    this.icons = new Map();
    this.setupCSS();
  }
  
  setupCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .${this.options.className} {
        display: inline-block;
        width: ${this.options.size};
        height: ${this.options.size};
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
  }
  
  addIcon(name, svg) {
    if (!validateSVG(svg)) {
      throw new Error(`Invalid SVG for icon: ${name}`);
    }
    
    // Convert SVG to data URI
    const dataUri = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    this.icons.set(name, dataUri);
    
    // Add specific CSS for this icon
    const style = document.createElement('style');
    style.textContent = `
      .${this.options.className}.${this.options.className}-${name} {
        background-image: ${dataUri};
      }
    `;
    document.head.appendChild(style);
  }
  
  createIconElement(name) {
    if (!this.icons.has(name)) {
      console.error(`Icon ${name} not found`);
      return null;
    }
    
    const element = document.createElement('span');
    element.className = `${this.options.className} ${this.options.className}-${name}`;
    element.setAttribute('aria-label', name);
    element.setAttribute('role', 'img');
    
    return element;
  }
  
  addIcons(iconMap) {
    for (const [name, svg] of Object.entries(iconMap)) {
      this.addIcon(name, svg);
    }
  }
}

// Export the classes and functions
export { 
  IconFontGenerator, 
  svgToPath, 
  createIconFontFromSVGs, 
  validateSVG,
  CSSIconSystem
};