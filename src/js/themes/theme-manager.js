// Theme management utilities

class ThemeManager {
  constructor() {
    this.themes = {
      light: {
        '--primary-color': '#007bff',
        '--secondary-color': '#6c757d',
        '--background-color': '#ffffff',
        '--text-color': '#333333',
        '--border-color': '#dee2e6',
        '--shadow-color': 'rgba(0, 0, 0, 0.1)',
      },
      dark: {
        '--primary-color': '#0d6efd',
        '--secondary-color': '#6c757d',
        '--background-color': '#212529',
        '--text-color': '#f8f9fa',
        '--border-color': '#495057',
        '--shadow-color': 'rgba(0, 0, 0, 0.3)',
      },
      blue: {
        '--primary-color': '#0d6efd',
        '--secondary-color': '#0dcaf0',
        '--background-color': '#e7f1ff',
        '--text-color': '#0a58ca',
        '--border-color': '#0d6efd',
        '--shadow-color': 'rgba(13, 110, 253, 0.2)',
      },
      green: {
        '--primary-color': '#198754',
        '--secondary-color': '#20c997',
        '--background-color': '#d1e7dd',
        '--text-color': '#0a3622',
        '--border-color': '#198754',
        '--shadow-color': 'rgba(25, 135, 84, 0.2)',
      },
    };
    
    this.currentTheme = this.getStoredTheme() || 'light';
    this.applyTheme(this.currentTheme);
  }

  // Apply a theme by name
  applyTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme '${themeName}' does not exist.`);
      return;
    }

    const root = document.documentElement;
    const theme = this.themes[themeName];

    for (const [property, value] of Object.entries(theme)) {
      root.style.setProperty(property, value);
    }

    this.currentTheme = themeName;
    this.storeTheme(themeName);
    this.dispatchThemeChangeEvent(themeName);
  }

  // Get the current theme
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Store the theme preference
  storeTheme(themeName) {
    try {
      localStorage.setItem('preferred-theme', themeName);
    } catch (e) {
      console.warn('Could not store theme preference:', e);
    }
  }

  // Get the stored theme preference
  getStoredTheme() {
    try {
      return localStorage.getItem('preferred-theme');
    } catch (e) {
      console.warn('Could not retrieve stored theme:', e);
      return null;
    }
  }

  // Toggle between light and dark themes
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    return newTheme;
  }

  // Add a new theme
  addTheme(name, properties) {
    this.themes[name] = properties;
  }

  // Dispatch a custom event when theme changes
  dispatchThemeChangeEvent(themeName) {
    const event = new CustomEvent('themeChange', {
      detail: { themeName }
    });
    document.dispatchEvent(event);
  }

  // Check if the current theme is dark
  isDarkTheme() {
    return this.currentTheme === 'dark';
  }

  // Get all available theme names
  getAvailableThemes() {
    return Object.keys(this.themes);
  }
}

// Initialize the theme manager
const themeManager = new ThemeManager();

// Export the theme manager
export default themeManager;