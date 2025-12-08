// Icon grid component for displaying collections of icons

class IconGrid {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? 
      document.querySelector(container) : container;
    
    this.options = {
      columns: options.columns || 4,
      responsive: options.responsive !== false,
      iconSize: options.iconSize || '24px',
      spacing: options.spacing || '10px',
      showLabels: options.showLabels !== false,
      searchable: options.searchable !== false,
      filterable: options.filterable || false,
      icons: options.icons || [],
      ...options
    };
    
    this.icons = this.options.icons;
    this.filteredIcons = [...this.icons];
    this.renderedIcons = [];
    
    this.init();
  }

  init() {
    // Create the grid container
    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'icon-grid-container';
    
    // Add CSS for the grid
    this.addStyles();
    
    // Add search functionality if enabled
    if (this.options.searchable) {
      this.addSearchControl();
    }
    
    // Add filter functionality if enabled
    if (this.options.filterable) {
      this.addFilterControls();
    }
    
    // Add the grid to the container
    this.container.appendChild(this.gridContainer);
    
    // Render the icons
    this.render();
  }

  addStyles() {
    // Add default styles for the icon grid
    const style = document.createElement('style');
    style.textContent = `
      .icon-grid-container {
        display: grid;
        grid-template-columns: repeat(${this.options.columns}, 1fr);
        gap: ${this.options.spacing};
        padding: ${this.options.spacing};
      }

      .icon-grid-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .icon-grid-item:hover {
        background-color: #f0f0f0;
      }

      .icon-grid-icon {
        width: ${this.options.iconSize};
        height: ${this.options.iconSize};
        margin-bottom: 5px;
      }

      .icon-grid-label {
        font-size: 12px;
        color: #666;
      }

      .icon-search-container {
        margin-bottom: 15px;
      }

      .icon-search-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }

      .icon-filter-container {
        margin-bottom: 15px;
      }

      .icon-filter-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .icon-filter-btn {
        padding: 5px 10px;
        border: 1px solid #ccc;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }

      .icon-filter-btn.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }

      @media (max-width: 768px) {
        .icon-grid-container {
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  addSearchControl() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'icon-search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search icons...';
    searchInput.className = 'icon-search-input';
    
    searchInput.addEventListener('input', (e) => {
      this.filterIcons(e.target.value);
    });
    
    searchContainer.appendChild(searchInput);
    this.container.insertBefore(searchContainer, this.gridContainer);
  }

  addFilterControls() {
    if (!this.options.filterable.categories) return;
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'icon-filter-container';
    
    const filterButtons = document.createElement('div');
    filterButtons.className = 'icon-filter-buttons';
    
    // Add "All" filter
    const allBtn = document.createElement('button');
    allBtn.className = 'icon-filter-btn active';
    allBtn.textContent = 'All';
    allBtn.dataset.filter = 'all';
    
    allBtn.addEventListener('click', (e) => {
      this.applyFilter('all');
      this.clearActiveButtons();
      e.target.classList.add('active');
    });
    
    filterButtons.appendChild(allBtn);
    
    // Add category buttons
    this.options.filterable.categories.forEach(category => {
      const btn = document.createElement('button');
      btn.className = 'icon-filter-btn';
      btn.textContent = category;
      btn.dataset.filter = category;
      
      btn.addEventListener('click', (e) => {
        this.applyFilter(category);
        this.clearActiveButtons();
        e.target.classList.add('active');
      });
      
      filterButtons.appendChild(btn);
    });
    
    filterContainer.appendChild(filterButtons);
    this.container.insertBefore(filterContainer, this.gridContainer);
  }

  clearActiveButtons() {
    const buttons = this.container.querySelectorAll('.icon-filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
  }

  filterIcons(searchTerm) {
    if (!searchTerm) {
      this.filteredIcons = [...this.icons];
    } else {
      this.filteredIcons = this.icons.filter(icon => 
        icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (icon.tags && icon.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    this.render();
  }

  applyFilter(category) {
    if (category === 'all') {
      this.filteredIcons = [...this.icons];
    } else {
      this.filteredIcons = this.icons.filter(icon => 
        icon.category === category || 
        (Array.isArray(icon.categories) && icon.categories.includes(category))
      );
    }
    
    this.render();
  }

  render() {
    // Clear the grid container
    this.gridContainer.innerHTML = '';
    
    // Render each icon
    this.filteredIcons.forEach(icon => {
      const iconEl = this.createIconElement(icon);
      this.gridContainer.appendChild(iconEl);
    });
  }

  createIconElement(icon) {
    const item = document.createElement('div');
    item.className = 'icon-grid-item';
    item.title = icon.name;
    
    // Create icon element
    const iconEl = document.createElement('div');
    iconEl.className = 'icon-grid-icon';
    iconEl.innerHTML = icon.svg || icon.content || `<span>${icon.name.charAt(0)}</span>`;
    
    // Add click event to the item
    if (icon.onClick) {
      item.addEventListener('click', () => icon.onClick(icon));
    } else if (this.options.onIconClick) {
      item.addEventListener('click', () => this.options.onIconClick(icon));
    }
    
    item.appendChild(iconEl);
    
    // Add label if enabled
    if (this.options.showLabels) {
      const label = document.createElement('div');
      label.className = 'icon-grid-label';
      label.textContent = icon.name;
      item.appendChild(label);
    }
    
    return item;
  }

  // Add icons to the grid
  addIcons(icons) {
    this.icons.push(...icons);
    this.filteredIcons = [...this.icons];
    this.render();
  }

  // Update an existing icon
  updateIcon(name, newIconData) {
    const index = this.icons.findIndex(icon => icon.name === name);
    if (index !== -1) {
      this.icons[index] = { ...this.icons[index], ...newIconData };
      this.filteredIcons = [...this.icons];
      this.render();
    }
  }

  // Remove an icon
  removeIcon(name) {
    this.icons = this.icons.filter(icon => icon.name !== name);
    this.filteredIcons = [...this.icons];
    this.render();
  }

  // Get current icons
  getIcons() {
    return [...this.icons];
  }

  // Update grid options
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    if (newOptions.columns) {
      this.gridContainer.style.gridTemplateColumns = `repeat(${newOptions.columns}, 1fr)`;
    }
    if (newOptions.iconSize) {
      const style = document.createElement('style');
      style.textContent = `
        .icon-grid-icon {
          width: ${newOptions.iconSize};
          height: ${newOptions.iconSize};
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Export icons to a collection
  export() {
    return {
      icons: this.getIcons(),
      options: { ...this.options }
    };
  }
}

// Function to create a responsive icon grid
function createResponsiveIconGrid(container, icons, options = {}) {
  const defaultOptions = {
    columns: 4,
    responsive: true,
    ...options
  };
  
  // Adjust columns based on screen size if responsive
  if (defaultOptions.responsive) {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 576) defaultOptions.columns = 3;
      else if (width < 768) defaultOptions.columns = 4;
      else if (width < 992) defaultOptions.columns = 5;
      else defaultOptions.columns = 6;
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
  }
  
  return new IconGrid(container, { ...defaultOptions, icons });
}

// Export the class and function
export { IconGrid, createResponsiveIconGrid };