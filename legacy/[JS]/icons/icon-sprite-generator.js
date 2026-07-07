// Icon sprite generator utility

class IconSpriteGenerator {
  constructor(options = {}) {
    this.options = {
      spriteId: options.spriteId || 'icon-sprite',
      generateCSS: options.generateCSS !== false,
      generateHTML: options.generateHTML !== false,
      viewBox: options.viewBox || '0 0 24 24',
      ...options
    };
    
    this.icons = new Map();
  }
  
  // Add an icon to the sprite
  addIcon(name, svgContent) {
    // Validate and normalize the SVG content
    const normalizedSvg = this.normalizeSVG(svgContent);
    
    // Extract the icon content (everything inside the SVG tags)
    const iconContent = this.extractIconContent(normalizedSvg);
    
    this.icons.set(name, {
      name: name,
      content: iconContent,
      original: svgContent
    });
    
    return this;
  }
  
  // Add multiple icons at once
  addIcons(iconMap) {
    for (const [name, svg] of Object.entries(iconMap)) {
      this.addIcon(name, svg);
    }
    return this;
  }
  
  // Remove an icon
  removeIcon(name) {
    return this.icons.delete(name);
  }
  
  // Normalize SVG content
  normalizeSVG(svgString) {
    // Ensure the SVG has proper namespace
    if (!svgString.includes('xmlns=')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // Ensure viewBox is set
    if (!svgString.includes('viewBox=')) {
      svgString = svgString.replace('<svg', `<svg viewBox="${this.options.viewBox}"`);
    }
    
    return svgString;
  }
  
  // Extract content inside SVG tags
  extractIconContent(svgString) {
    const start = svgString.indexOf('>', svgString.indexOf('<svg')) + 1;
    const end = svgString.lastIndexOf('</svg>');
    return svgString.substring(start, end).trim();
  }
  
  // Generate the sprite SVG
  generateSprite() {
    let sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;" id="${this.options.spriteId}">\n`;
    
    for (const [name, icon] of this.icons) {
      sprite += `  <symbol id="icon-${name}" viewBox="${this.options.viewBox}">\n`;
      sprite += `    ${icon.content}\n`;
      sprite += `  </symbol>\n`;
    }
    
    sprite += '</svg>';
    
    return sprite;
  }
  
  // Generate CSS for using the sprite
  generateCSS() {
    if (!this.options.generateCSS) {
      return '';
    }
    
    let css = `/* Icon Sprite CSS */\n\n`;
    css += `.icon {\n`;
    css += `  display: inline-block;\n`;
    css += `  width: 1em;\n`;
    css += `  height: 1em;\n`;
    css += `  fill: currentColor;\n`;
    css += `  stroke: currentColor;\n`;
    css += `}\n\n`;
    
    // Add specific icon classes
    for (const name of this.icons.keys()) {
      css += `.icon-${name} {\n`;
      css += `  /* Use with: <svg class="icon icon-${name}"><use href="#icon-${name}"></use></svg> */\n`;
      css += `}\n\n`;
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
  <title>Icon Sprite Demo</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 20px;
    }
    
    .icon-item {
      text-align: center;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    
    .icon {
      display: inline-block;
      width: 2em;
      height: 2em;
      fill: currentColor;
      stroke: currentColor;
      margin-bottom: 10px;
    }
    
    .icon-name {
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <!-- Icon Sprite - Include this in your page -->\n`;
    
    html += this.generateSprite() + '\n\n';
    
    html += `  <h1>Icon Sprite Demo</h1>
  <div class="icon-grid">\n`;
    
    for (const [name] of this.icons) {
      html += `    <div class="icon-item">
      <svg class="icon"><use href="#icon-${name}"></use></svg>
      <div class="icon-name">${name}</div>
    </div>\n`;
    }
    
    html += `  </div>
  <h2>Usage</h2>
  <p>To use an icon, include the sprite in your page and use the &lt;use&gt; element:</p>
  <pre>&lt;svg class="icon"&gt;&lt;use href="#icon-iconName"&gt;&lt;/use&gt;&lt;/svg&gt;</pre>
</body>
</html>`;
    
    return html;
  }
  
  // Generate JavaScript helper functions
  generateJS() {
    return `// Icon Sprite JavaScript Helper
class IconSpriteHelper {
  constructor(spriteId = '${this.options.spriteId}') {
    this.spriteId = spriteId;
  }
  
  // Create an icon element
  createIcon(name, className = '') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon ' + className);
    
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#icon-${this.options.spriteId}::icon-' + name);
    use.setAttribute('href', '#icon-' + name);
    
    svg.appendChild(use);
    return svg;
  }
  
  // Render an icon in a container
  renderIcon(container, name, className = '') {
    const iconEl = this.createIcon(name, className);
    container.appendChild(iconEl);
    return iconEl;
  }
  
  // Check if icon exists in sprite
  hasIcon(name) {
    return document.getElementById('icon-' + name) !== null;
  }
}

// Global instance
const iconSprite = new IconSpriteHelper();
`;
  }
  
  // Create an inline sprite by embedding it in the DOM
  createInlineSprite(container = document.body) {
    const sprite = this.generateSprite();
    const div = document.createElement('div');
    div.innerHTML = sprite;
    div.style.display = 'none';
    container.appendChild(div);
  }
  
  // Export all assets
  export() {
    return {
      sprite: this.generateSprite(),
      css: this.generateCSS(),
      html: this.generateHTML(),
      javascript: this.generateJS(),
      iconCount: this.icons.size,
      names: Array.from(this.icons.keys())
    };
  }
  
  // Get all registered icons
  getIcons() {
    return Array.from(this.icons.values());
  }
  
  // Check if an icon exists
  hasIcon(name) {
    return this.icons.has(name);
  }
  
  // Clear all icons
  clear() {
    this.icons.clear();
  }
}

// Helper function to create a sprite from a directory of SVG files (simulated)
function createSpriteFromSVGs(svgObjects, options = {}) {
  const spriteGenerator = new IconSpriteGenerator(options);
  
  // Add each SVG object to the sprite
  for (const [name, svgContent] of Object.entries(svgObjects)) {
    spriteGenerator.addIcon(name, svgContent);
  }
  
  return spriteGenerator;
}

// Helper function to create a sprite from a list of icon components
function createSpriteFromComponents(components, options = {}) {
  const spriteGenerator = new IconSpriteGenerator(options);
  
  for (const component of components) {
    if (component.name && component.svg) {
      spriteGenerator.addIcon(component.name, component.svg);
    }
  }
  
  return spriteGenerator;
}

// SVG optimization utility
class SVGOptimizer {
  constructor(options = {}) {
    this.options = {
      removeXMLTag: options.removeXMLTag !== false,
      removeComments: options.removeComments !== false,
      removeMetadata: options.removeMetadata !== false,
      removeEditors: options.removeEditors !== false,
      minify: options.minify !== false,
      ...options
    };
  }
  
  optimize(svgString) {
    // Remove XML tag if configured
    if (this.options.removeXMLTag) {
      svgString = svgString.replace(/<\?xml.*?\?>/g, '');
    }
    
    // Remove comments
    if (this.options.removeComments) {
      svgString = svgString.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    // Remove metadata and editor elements
    if (this.options.removeMetadata) {
      svgString = svgString.replace(/<metadata>[\s\S]*?<\/metadata>/g, '');
    }
    
    if (this.options.removeEditors) {
      svgString = svgString.replace(/<sodipodi:[\s\S]*?<\/sodipodi:[^>]+>/g, '');
      svgString = svgString.replace(/<inkscape:[\s\S]*?<\/inkscape:[^>]+>/g, '');
      svgString = svgString.replace(/\s*inkscape:[^="]+="[^"]*"/g, '');
      svgString = svgString.replace(/\s*sodipodi:[^="]+="[^"]*"/g, '');
    }
    
    // Minify (remove unnecessary whitespace)
    if (this.options.minify) {
      svgString = svgString
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
    }
    
    return svgString;
  }
}

// Utility to fetch and process remote SVGs for a sprite
async function createSpriteFromURLs(iconMap, options = {}) {
  const spriteGenerator = new IconSpriteGenerator(options);
  const optimizer = new SVGOptimizer(options.optimizer || {});
  
  // Create promises for fetching each SVG
  const fetchPromises = Object.entries(iconMap).map(async ([name, url]) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }
      
      let svgContent = await response.text();
      
      // Optimize the SVG if requested
      if (options.optimize) {
        svgContent = optimizer.optimize(svgContent);
      }
      
      spriteGenerator.addIcon(name, svgContent);
    } catch (error) {
      console.error(`Error processing icon ${name} from ${url}:`, error);
    }
  });
  
  // Wait for all fetches to complete
  await Promise.all(fetchPromises);
  
  return spriteGenerator;
}

// Export the classes and functions
export { 
  IconSpriteGenerator, 
  createSpriteFromSVGs, 
  createSpriteFromComponents, 
  SVGOptimizer, 
  createSpriteFromURLs 
};