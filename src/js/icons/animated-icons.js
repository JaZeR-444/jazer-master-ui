// Icon component with animation capabilities

function createAnimatedIcon(name, className = '', size = 24, animation = '') {
  const iconElement = document.createElement('span');
  iconElement.className = `icon ${className} ${animation}`;
  iconElement.innerHTML = getIconSVG(name, size);
  return iconElement;
}

function getIconSVG(name, size) {
  // This is a simplified version - in a real implementation, you'd have more icons
  const icons = {
    spinner: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m-4-6H4m12 0h4M3 12h4m12 0h4m-7-7v4m0 12v4m-3-9a3 3 0 1 0 6 0 3 3 0 1 0-6 0z"></path></svg>`,
    loading: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    success: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline></svg>`,
    error: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    warning: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  };

  return icons[name] || '';
}

// Function to add animation classes to icons
function animateIcon(iconElement, animationType) {
  const animations = {
    spin: 'icon-spin',
    pulse: 'icon-pulse',
    bounce: 'icon-bounce',
    shake: 'icon-shake',
  };

  const animationClass = animations[animationType] || '';
  if (animationClass) {
    iconElement.classList.add(animationClass);
  }
}

// Function to create CSS for animations
function loadIconAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    .icon-spin {
      animation: icon-spin 1s linear infinite;
    }
    
    .icon-pulse {
      animation: icon-pulse 1.5s ease-in-out infinite;
    }
    
    .icon-bounce {
      animation: icon-bounce 1s infinite;
    }
    
    .icon-shake {
      animation: icon-shake 0.5s infinite;
    }
    
    @keyframes icon-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes icon-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes icon-bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
      60% { transform: translateY(-3px); }
    }
    
    @keyframes icon-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize animations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadIconAnimations);
} else {
  loadIconAnimations();
}

export { createAnimatedIcon, getIconSVG, animateIcon, loadIconAnimations };