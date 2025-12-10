// Theme switching components and utilities

// Theme switcher component
function createThemeSwitcher(container, options = {}) {
  const {
    themes = ['light', 'dark'],
    defaultTheme = 'light',
    showLabels = true,
    showIcons = true
  } = options;

  // Create the theme switcher container
  const switcher = document.createElement('div');
  switcher.className = 'theme-switcher';
  
  // Add CSS for the switcher
  const style = document.createElement('style');
  style.textContent = `
    .theme-switcher {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .theme-option {
      display: flex;
      align-items: center;
      padding: 5px 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .theme-option.active {
      background-color: var(--primary-color);
      color: white;
    }
    
    .theme-icon {
      margin-right: 5px;
    }
  `;
  
  document.head.appendChild(style);

  // Add theme options
  themes.forEach(theme => {
    const option = document.createElement('div');
    option.className = 'theme-option';
    option.dataset.theme = theme;
    
    if (showIcons) {
      const icon = document.createElement('span');
      icon.className = 'theme-icon';
      icon.innerHTML = getThemeIcon(theme);
      option.appendChild(icon);
    }
    
    if (showLabels) {
      const label = document.createElement('span');
      label.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
      option.appendChild(label);
    }
    
    option.addEventListener('click', () => {
      document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
      });
      option.classList.add('active');
      window.themeManager.applyTheme(theme);
    });
    
    // Mark as active if it matches the current theme
    if (theme === window.themeManager.getCurrentTheme()) {
      option.classList.add('active');
    }
    
    switcher.appendChild(option);
  });
  
  container.appendChild(switcher);
  return switcher;
}

// Function to get an icon for a theme
function getThemeIcon(themeName) {
  const icons = {
    light: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    dark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    blue: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line><line x1="9" y1="15" x2="9.01" y2="15"></line><line x1="15" y1="15" x2="15.01" y2="15"></line></svg>`,
    green: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"></path></svg>`
  };
  
  return icons[themeName] || `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
}

// Function to apply theme to specific elements
function applyThemeToElement(element, themeName, themeManager) {
  if (!themeManager || !themeManager.themes[themeName]) {
    console.warn(`Theme '${themeName}' does not exist or theme manager not provided.`);
    return;
  }

  const theme = themeManager.themes[themeName];

  for (const [property, value] of Object.entries(theme)) {
    element.style.setProperty(property, value);
  }
}

// Function to automatically switch theme based on system preference
function setSystemThemeListener(themeManager) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e) => {
    const newTheme = e.matches ? 'dark' : 'light';
    themeManager.applyTheme(newTheme);
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  // Apply initial theme based on system preference
  handleChange(mediaQuery);
  
  return () => mediaQuery.removeEventListener('change', handleChange);
}

export { createThemeSwitcher, getThemeIcon, applyThemeToElement, setSystemThemeListener };