// JaZeR Global Script File
// This file can contain any global JavaScript functionality for the JaZeR UI library

// Example: Function to dynamically load the brand CSS (if needed for some reason)
function loadBrandCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './jazer-brand.css';
  document.head.appendChild(link);
}

// Example: Theme switcher functionality
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Save preference to localStorage
  localStorage.setItem('theme', newTheme);
}

// Initialize theme based on user preference or system setting
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  // Default is light theme if no preference is set
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTheme);

// Example: Utility functions for components
const JaZeRUICore = {
  // Show a notification
  showNotification: function(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} slide-up`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  },
  
  // Toggle modal visibility
  toggleModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.toggle('active');
    }
  }
};

// Export for use in other scripts if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JaZeRUICore;
}