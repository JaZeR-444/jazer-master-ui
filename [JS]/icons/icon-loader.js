// Icon loader utility for dynamically loading icons

class IconLoader {
  constructor(options = {}) {
    this.options = {
      basePath: options.basePath || './icons/',
      defaultFormat: options.defaultFormat || 'svg',
      cache: options.cache !== false,
      cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
    };
    
    this.iconCache = new Map();
    this.loadingPromises = new Map();
  }

  // Load a single icon by name
  async loadIcon(name, options = {}) {
    const { format = this.options.defaultFormat, path = this.options.basePath } = options;
    
    // Check if icon is in cache
    const cacheKey = `${name}.${format}`;
    if (this.iconCache.has(cacheKey)) {
      const cached = this.iconCache.get(cacheKey);
      // Check if cache is still valid
      if (Date.now() - cached.timestamp < this.options.cacheTimeout) {
        return cached.content;
      } else {
        // Remove expired cache
        this.iconCache.delete(cacheKey);
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Create loading promise
    const loadPromise = this.fetchIcon(`${path}${name}.${format}`)
      .then(content => {
        if (this.options.cache) {
          this.iconCache.set(cacheKey, {
            content,
            timestamp: Date.now()
          });
        }
        this.loadingPromises.delete(cacheKey);
        return content;
      })
      .catch(error => {
        this.loadingPromises.delete(cacheKey);
        throw error;
      });

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  // Fetch icon content from the specified URL
  async fetchIcon(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load icon: ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error loading icon from ${url}:`, error);
      throw error;
    }
  }

  // Load multiple icons at once
  async loadIcons(names, options = {}) {
    const { format = this.options.defaultFormat, path = this.options.basePath } = options;
    
    const promises = names.map(name => this.loadIcon(name, { format, path }));
    const icons = await Promise.all(promises);
    
    // Return an object with icon names as keys
    const result = {};
    names.forEach((name, index) => {
      result[name] = icons[index];
    });
    
    return result;
  }

  // Preload a set of icons
  preload(names, options = {}) {
    // Don't wait for the promise, just start the loading
    this.loadIcons(names, options).catch(error => {
      console.error('Error preloading icons:', error);
    });
  }

  // Clear the cache
  clearCache() {
    this.iconCache.clear();
  }

  // Get cached icon count
  getCachedIconCount() {
    return this.iconCache.size;
  }

  // Remove specific icon from cache
  removeFromCache(name, format = this.options.defaultFormat) {
    const cacheKey = `${name}.${format}`;
    return this.iconCache.delete(cacheKey);
  }
}

// Function to create and return an SVG icon element
function createSVGIcon(svgContent, className = '', title = '') {
  // Parse the SVG content
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  
  if (!svg) {
    console.error('Invalid SVG content provided');
    return null;
  }

  // Add class if provided
  if (className) {
    svg.classList.add(...className.split(' '));
  }

  // Add title if provided
  if (title) {
    const titleElement = document.createElement('title');
    titleElement.textContent = title;
    svg.prepend(titleElement);
  }

  return svg;
}

// Function to render an icon in a container
async function renderIcon(container, iconName, options = {}) {
  const { 
    basePath = './icons/',
    format = 'svg',
    className = '',
    title = '',
    loaderOptions = {}
  } = options;

  // Create a new icon loader instance
  const loader = new IconLoader(loaderOptions);
  
  try {
    // Load the icon
    const svgContent = await loader.loadIcon(iconName, { format, path: basePath });
    
    // Create the SVG element
    const svgElement = createSVGIcon(svgContent, className, title);
    
    if (svgElement) {
      // Clear container and append icon
      container.innerHTML = '';
      container.appendChild(svgElement);
      return svgElement;
    } else {
      throw new Error('Could not create SVG icon element');
    }
  } catch (error) {
    console.error(`Error rendering icon ${iconName}:`, error);
    throw error;
  }
}

// Export the class and functions
export { IconLoader, createSVGIcon, renderIcon };