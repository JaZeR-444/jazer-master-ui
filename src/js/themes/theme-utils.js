// Theme utility functions for CSS custom properties and advanced theming

// Function to generate CSS variables for a theme
function generateThemeCSS(themeObject, themeName) {
  let css = `/* ${themeName} theme */\n:root[data-theme="${themeName}"] {\n`;
  
  for (const [property, value] of Object.entries(themeObject)) {
    css += `  ${property}: ${value};\n`;
  }
  
  css += '}\n';
  
  return css;
}

// Function to load theme from an external file/URL
async function loadExternalTheme(themeUrl) {
  try {
    const response = await fetch(themeUrl);
    if (!response.ok) {
      throw new Error(`Failed to load theme: ${response.status} ${response.statusText}`);
    }
    const themeData = await response.json();
    return themeData;
  } catch (error) {
    console.error('Error loading external theme:', error);
    return null;
  }
}

// Function to create a theme pack (multiple related themes)
function createThemePack(packName, themes) {
  return {
    packName,
    themes,
    applyTheme: function(themeName) {
      if (this.themes[themeName]) {
        const root = document.documentElement;
        for (const [property, value] of Object.entries(this.themes[themeName])) {
          root.style.setProperty(property, value);
        }
        // Store the applied theme
        document.documentElement.setAttribute('data-theme', themeName);
      } else {
        console.warn(`Theme '${themeName}' not found in pack '${packName}'`);
      }
    }
  };
}

// Function to validate theme properties
function validateTheme(themeObject) {
  const requiredProperties = [
    '--primary-color',
    '--background-color',
    '--text-color'
  ];
  
  const missingProperties = [];
  requiredProperties.forEach(prop => {
    if (!themeObject[prop]) {
      missingProperties.push(prop);
    }
  });
  
  if (missingProperties.length > 0) {
    console.warn(`Theme is missing required properties: ${missingProperties.join(', ')}`);
    return false;
  }
  
  return true;
}

// Function to merge multiple themes
function mergeThemes(...themes) {
  const mergedTheme = {};
  themes.forEach(theme => {
    Object.assign(mergedTheme, theme);
  });
  return mergedTheme;
}

// Function to create a theme based on a base theme with customizations
function createDerivedTheme(baseTheme, customizations) {
  const derivedTheme = { ...baseTheme };
  Object.assign(derivedTheme, customizations);
  return derivedTheme;
}

// Function to export the current theme as CSS
function exportCurrentTheme() {
  const rootStyles = getComputedStyle(document.documentElement);
  let css = ':root {\n';
  
  // This is a simplified version - in practice you'd only export CSS custom properties
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules).forEach(rule => {
        if (rule.selectorText === ':root' && rule.style) {
          for (let i = 0; i < rule.style.length; i++) {
            const property = rule.style[i];
            if (property.startsWith('--')) {
              css += `  ${property}: ${rule.style.getPropertyValue(property)};\n`;
            }
          }
        }
      });
    } catch (e) {
      // Skip cross-origin stylesheets
    }
  });
  
  css += '}\n';
  return css;
}

// Function to set theme with animation
function setAnimatedTheme(themeManager, newTheme, duration = 300) {
  const body = document.body;
  body.style.transition = `background-color ${duration}ms, color ${duration}ms`;
  
  // Add animation class
  body.classList.add('theme-transition');
  
  // Update theme after a brief delay to allow for transition
  setTimeout(() => {
    themeManager.applyTheme(newTheme);
    
    // Remove animation class after transition completes
    setTimeout(() => {
      body.classList.remove('theme-transition');
    }, duration);
  }, 10);
}

// Add default transition CSS
const transitionStyle = document.createElement('style');
transitionStyle.textContent = `
  .theme-transition {
    transition: background-color 300ms ease, color 300ms ease, border-color 300ms ease;
  }
`;
document.head.appendChild(transitionStyle);

export { 
  generateThemeCSS, 
  loadExternalTheme, 
  createThemePack, 
  validateTheme,
  mergeThemes,
  createDerivedTheme,
  exportCurrentTheme,
  setAnimatedTheme
};