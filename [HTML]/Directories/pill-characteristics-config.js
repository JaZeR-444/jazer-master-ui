/**
 * JaZeR Pill Characteristics Engine
 * Automatic AI-powered characteristic analysis for UI components
 *
 * Analyzes component filenames, titles, and descriptions to automatically
 * assign the 3 most relevant characteristic pills using pattern matching
 * and intelligent scoring.
 */

const CharacteristicsEngine = {
  /**
   * Universal characteristics applicable to all components
   */
  UNIVERSAL_CHARACTERISTICS: {
    // Complexity levels
    complexity: {
      simple: { label: 'simple', color: 'cyan', priority: 1 },
      moderate: { label: 'moderate', color: 'purple', priority: 2 },
      advanced: { label: 'advanced', color: 'pink', priority: 3 }
    },

    // Interactivity types
    interactivity: {
      interactive: { label: 'interactive', color: 'cyan', priority: 1 },
      static: { label: 'static', color: 'purple', priority: 2 },
      'form-based': { label: 'form-based', color: 'pink', priority: 1 }
    },

    // Responsiveness
    responsiveness: {
      responsive: { label: 'responsive', color: 'cyan', priority: 1 },
      'mobile-first': { label: 'mobile-first', color: 'purple', priority: 2 },
      'desktop-only': { label: 'desktop-only', color: 'pink', priority: 3 }
    }
  },

  /**
   * Category-specific characteristics for each subdirectory
   */
  CATEGORY_CHARACTERISTICS: {
    advanced: {
      'data-driven': { label: 'data-driven', color: 'cyan', priority: 1 },
      'drag-drop': { label: 'drag-drop', color: 'pink', priority: 1 },
      'real-time': { label: 'real-time', color: 'pink', priority: 2 },
      visualization: { label: 'visualization', color: 'cyan', priority: 2 },
      filtering: { label: 'filtering', color: 'purple', priority: 2 },
      editing: { label: 'editing', color: 'purple', priority: 2 },
      collaboration: { label: 'collaboration', color: 'pink', priority: 3 },
      'code-editor': { label: 'code-editor', color: 'purple', priority: 2 }
    },

    components: {
      navigation: { label: 'navigation', color: 'cyan', priority: 1 },
      feedback: { label: 'feedback', color: 'purple', priority: 1 },
      display: { label: 'display', color: 'cyan', priority: 2 },
      input: { label: 'input', color: 'purple', priority: 1 },
      container: { label: 'container', color: 'cyan', priority: 2 },
      notification: { label: 'notification', color: 'pink', priority: 2 },
      overlay: { label: 'overlay', color: 'purple', priority: 2 }
    },

    forms: {
      validation: { label: 'validation', color: 'purple', priority: 1 },
      'multi-step': { label: 'multi-step', color: 'pink', priority: 1 },
      upload: { label: 'upload', color: 'cyan', priority: 2 },
      authentication: { label: 'authentication', color: 'purple', priority: 1 },
      settings: { label: 'settings', color: 'cyan', priority: 2 },
      payment: { label: 'payment', color: 'pink', priority: 1 },
      profile: { label: 'profile', color: 'cyan', priority: 2 },
      search: { label: 'search', color: 'cyan', priority: 2 }
    },

    layouts: {
      dashboard: { label: 'dashboard', color: 'cyan', priority: 1 },
      landing: { label: 'landing', color: 'purple', priority: 1 },
      blog: { label: 'blog', color: 'cyan', priority: 2 },
      ecommerce: { label: 'ecommerce', color: 'pink', priority: 1 },
      documentation: { label: 'documentation', color: 'purple', priority: 2 },
      content: { label: 'content', color: 'cyan', priority: 2 },
      'split-view': { label: 'split-view', color: 'purple', priority: 2 },
      fullpage: { label: 'fullpage', color: 'pink', priority: 2 }
    },

    media: {
      gallery: { label: 'gallery', color: 'cyan', priority: 1 },
      player: { label: 'player', color: 'purple', priority: 1 },
      carousel: { label: 'carousel', color: 'cyan', priority: 2 },
      lightbox: { label: 'lightbox', color: 'purple', priority: 2 },
      video: { label: 'video', color: 'pink', priority: 1 },
      audio: { label: 'audio', color: 'pink', priority: 2 },
      image: { label: 'image', color: 'cyan', priority: 2 },
      embed: { label: 'embed', color: 'purple', priority: 3 }
    },

    navigation: {
      mobile: { label: 'mobile', color: 'cyan', priority: 1 },
      dropdown: { label: 'dropdown', color: 'purple', priority: 1 },
      sticky: { label: 'sticky', color: 'pink', priority: 2 },
      'mega-menu': { label: 'mega-menu', color: 'pink', priority: 1 },
      sidebar: { label: 'sidebar', color: 'cyan', priority: 1 },
      tabs: { label: 'tabs', color: 'purple', priority: 2 },
      breadcrumb: { label: 'breadcrumb', color: 'cyan', priority: 2 },
      stepper: { label: 'stepper', color: 'purple', priority: 2 }
    },

    patterns: {
      saas: { label: 'saas', color: 'cyan', priority: 1 },
      crm: { label: 'crm', color: 'purple', priority: 1 },
      marketing: { label: 'marketing', color: 'pink', priority: 1 },
      onboarding: { label: 'onboarding', color: 'purple', priority: 2 },
      'full-page': { label: 'full-page', color: 'cyan', priority: 2 },
      workflow: { label: 'workflow', color: 'purple', priority: 2 },
      admin: { label: 'admin', color: 'cyan', priority: 2 },
      portal: { label: 'portal', color: 'purple', priority: 2 }
    },

    utilities: {
      loading: { label: 'loading', color: 'cyan', priority: 1 },
      notification: { label: 'notification', color: 'purple', priority: 1 },
      accessibility: { label: 'accessibility', color: 'pink', priority: 1 },
      debugging: { label: 'debugging', color: 'purple', priority: 2 },
      animation: { label: 'animation', color: 'cyan', priority: 2 },
      state: { label: 'state', color: 'purple', priority: 2 },
      helper: { label: 'helper', color: 'cyan', priority: 2 },
      overlay: { label: 'overlay', color: 'purple', priority: 3 }
    }
  },

  /**
   * Pattern matching rules for automatic analysis
   * Patterns are matched against filename, title, and description
   */
  ANALYSIS_PATTERNS: {
    // Filename patterns (weight: +3 points)
    filename: {
      // Complexity indicators
      'wizard|multi-step|advanced|gantt|pivot|workflow|collaborative|virtualized|heatmap': { characteristic: 'advanced', category: 'complexity' },
      'inline|simple|basic|pill|chip|badge|avatar|rating|stepper': { characteristic: 'simple', category: 'complexity' },

      // Interactivity indicators
      'drag|drop|editable|filter|search|sort|reorder|interactive|kanban|calendar': { characteristic: 'interactive', category: 'interactivity' },
      'static|display|showcase|preview|read-only': { characteristic: 'static', category: 'interactivity' },

      // Category-specific filename patterns
      'kanban|drag.*drop|reorder': { characteristic: 'drag-drop', category: 'advanced' },
      'real-time|live|activity': { characteristic: 'real-time', category: 'advanced' },
      'chart|graph|heatmap|pivot|visualization': { characteristic: 'visualization', category: 'advanced' },
      'modal|dialog|drawer|panel|overlay|lightbox': { characteristic: 'overlay', category: 'components' },
      'nav|menu|breadcrumb|tabs|stepper': { characteristic: 'navigation', category: 'components' },
      'alert|toast|notification|banner': { characteristic: 'notification', category: 'components' },
      'login|signup|auth|password|two-factor': { characteristic: 'authentication', category: 'forms' },
      'upload|file|image': { characteristic: 'upload', category: 'forms' },
      'validation|error|inline': { characteristic: 'validation', category: 'forms' },
      'payment|credit|billing': { characteristic: 'payment', category: 'forms' },
      'dashboard': { characteristic: 'dashboard', category: 'layouts' },
      'landing|hero|marketing': { characteristic: 'landing', category: 'layouts' },
      'blog|article|post': { characteristic: 'blog', category: 'layouts' },
      'ecommerce|product|shop|checkout': { characteristic: 'ecommerce', category: 'layouts' },
      'gallery|grid|masonry': { characteristic: 'gallery', category: 'media' },
      'video|player|controls': { characteristic: 'video', category: 'media' },
      'audio|podcast|playlist': { characteristic: 'audio', category: 'media' },
      'carousel|slider|swiper': { characteristic: 'carousel', category: 'media' },
      'mobile|bottom|hamburger': { characteristic: 'mobile', category: 'navigation' },
      'dropdown|select|menu': { characteristic: 'dropdown', category: 'navigation' },
      'sticky|fixed|docked': { characteristic: 'sticky', category: 'navigation' },
      'mega': { characteristic: 'mega-menu', category: 'navigation' },
      'sidebar|drawer|off-canvas': { characteristic: 'sidebar', category: 'navigation' },
      'saas|subscription|pricing': { characteristic: 'saas', category: 'patterns' },
      'crm|contact|deal|account': { characteristic: 'crm', category: 'patterns' },
      'onboarding|wizard|welcome': { characteristic: 'onboarding', category: 'patterns' },
      'admin|settings|console': { characteristic: 'admin', category: 'patterns' },
      'spinner|loading|skeleton|progress': { characteristic: 'loading', category: 'utilities' },
      'toast|notification|alert': { characteristic: 'notification', category: 'utilities' },
      'accessible|skip|aria|focus': { characteristic: 'accessibility', category: 'utilities' },
      'debug|breakpoint|grid-overlay': { characteristic: 'debugging', category: 'utilities' }
    },

    // Content patterns (weight: +2 points)
    content: {
      'drag.*drop|draggable|reorder': { characteristic: 'drag-drop', category: 'advanced' },
      'real.?time|live update|websocket|streaming': { characteristic: 'real-time', category: 'advanced' },
      'chart|graph|visualization|plot|diagram': { characteristic: 'visualization', category: 'advanced' },
      'filter|search|sort|query': { characteristic: 'filtering', category: 'advanced' },
      'edit|modify|update|change': { characteristic: 'editing', category: 'advanced' },
      'modal|popup|overlay|dialog': { characteristic: 'overlay', category: 'components' },
      'navigate|menu|link|route': { characteristic: 'navigation', category: 'components' },
      'alert|message|toast|notification': { characteristic: 'feedback', category: 'components' },
      'input|field|textarea|select': { characteristic: 'input', category: 'components' },
      'validate|error|warning|check': { characteristic: 'validation', category: 'forms' },
      'upload|file|attach|drop': { characteristic: 'upload', category: 'forms' },
      'login|signin|register|authenticate': { characteristic: 'authentication', category: 'forms' },
      'payment|card|checkout|billing': { characteristic: 'payment', category: 'forms' },
      'profile|account|user|settings': { characteristic: 'profile', category: 'forms' },
      'dashboard|widget|metric|analytics': { characteristic: 'dashboard', category: 'layouts' },
      'landing|hero|cta|marketing': { characteristic: 'landing', category: 'layouts' },
      'blog|article|content|post': { characteristic: 'blog', category: 'layouts' },
      'product|shop|store|cart': { characteristic: 'ecommerce', category: 'layouts' },
      'documentation|docs|guide|reference': { characteristic: 'documentation', category: 'layouts' },
      'image|photo|picture|gallery': { characteristic: 'gallery', category: 'media' },
      'video|play|stream|watch': { characteristic: 'video', category: 'media' },
      'audio|sound|music|podcast': { characteristic: 'audio', category: 'media' },
      'carousel|slide|swipe|scroll': { characteristic: 'carousel', category: 'media' },
      'mobile|touch|swipe|responsive': { characteristic: 'mobile', category: 'navigation' },
      'dropdown|select|collapse|expand': { characteristic: 'dropdown', category: 'navigation' },
      'sticky|fixed|floating|anchored': { characteristic: 'sticky', category: 'navigation' },
      'tab|panel|switch|toggle': { characteristic: 'tabs', category: 'navigation' },
      'breadcrumb|path|trail|hierarchy': { characteristic: 'breadcrumb', category: 'navigation' },
      'step|wizard|progress|stage': { characteristic: 'stepper', category: 'navigation' },
      'saas|subscription|tenant|platform': { characteristic: 'saas', category: 'patterns' },
      'crm|customer|contact|sales': { characteristic: 'crm', category: 'patterns' },
      'marketing|campaign|lead|conversion': { characteristic: 'marketing', category: 'patterns' },
      'onboard|welcome|setup|introduction': { characteristic: 'onboarding', category: 'patterns' },
      'admin|manage|configure|control': { characteristic: 'admin', category: 'patterns' },
      'loading|spinner|skeleton|waiting': { characteristic: 'loading', category: 'utilities' },
      'toast|notification|banner|message': { characteristic: 'notification', category: 'utilities' },
      'accessible|a11y|screen.?reader|keyboard': { characteristic: 'accessibility', category: 'utilities' },
      'debug|inspect|test|develop': { characteristic: 'debugging', category: 'utilities' },
      'animate|transition|motion|effect': { characteristic: 'animation', category: 'utilities' }
    },

    // Complexity heuristics (weight: +1 point)
    complexity: {
      advanced: [
        'multi-step', 'wizard', 'collaborative', 'real-time', 'virtualized',
        'pivot', 'gantt', 'workflow', 'nodes', 'edges', 'canvas', 'advanced'
      ],
      moderate: [
        'editable', 'sortable', 'filterable', 'searchable', 'inline',
        'nested', 'accordion', 'tree', 'table', 'moderate'
      ],
      simple: [
        'static', 'display', 'basic', 'pill', 'badge', 'chip', 'avatar',
        'icon', 'button', 'simple'
      ]
    }
  },

  /**
   * Main analysis function - analyzes a component and returns top 3 characteristics
   *
   * @param {Object} component - Component data
   * @param {string} component.filename - Component filename (e.g., "kanban-board.html")
   * @param {string} component.title - Component title from h3
   * @param {string} component.description - Component description from p
   * @param {string} category - Category/subdirectory (e.g., "advanced", "components")
   * @returns {Array} Array of 3 characteristic objects with label and color
   */
  analyzeComponent(component, category) {
    const scores = new Map();
    const { filename = '', title = '', description = '' } = component;

    // Combine all text for analysis
    const filenameText = filename.toLowerCase();
    const contentText = `${title} ${description}`.toLowerCase();

    // Score filename patterns (+3 points)
    for (const [pattern, config] of Object.entries(this.ANALYSIS_PATTERNS.filename)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(filenameText)) {
        const key = `${config.category}:${config.characteristic}`;
        scores.set(key, (scores.get(key) || 0) + 3);
      }
    }

    // Score content patterns (+2 points)
    for (const [pattern, config] of Object.entries(this.ANALYSIS_PATTERNS.content)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(contentText)) {
        const key = `${config.category}:${config.characteristic}`;
        scores.set(key, (scores.get(key) || 0) + 2);
      }
    }

    // Score complexity heuristics (+1 point)
    for (const [level, keywords] of Object.entries(this.ANALYSIS_PATTERNS.complexity)) {
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'i');
        if (regex.test(contentText) || regex.test(filenameText)) {
          const key = `complexity:${level}`;
          scores.set(key, (scores.get(key) || 0) + 1);
        }
      }
    }

    // Add interactivity heuristic
    const interactiveKeywords = ['click', 'hover', 'drag', 'select', 'input', 'filter', 'search', 'edit', 'toggle', 'interactive'];
    const hasInteractive = interactiveKeywords.some(kw =>
      contentText.includes(kw) || filenameText.includes(kw)
    );
    if (hasInteractive) {
      scores.set('interactivity:interactive', (scores.get('interactivity:interactive') || 0) + 1);
    } else {
      scores.set('interactivity:static', (scores.get('interactivity:static') || 0) + 1);
    }

    // Add responsive heuristic (default for most components)
    scores.set('responsiveness:responsive', (scores.get('responsiveness:responsive') || 0) + 1);

    // Convert scores to characteristic objects
    const characteristics = [];
    for (const [key, score] of scores.entries()) {
      const [cat, char] = key.split(':');

      // Get characteristic config
      let config;
      if (this.UNIVERSAL_CHARACTERISTICS[cat] && this.UNIVERSAL_CHARACTERISTICS[cat][char]) {
        config = this.UNIVERSAL_CHARACTERISTICS[cat][char];
      } else if (this.CATEGORY_CHARACTERISTICS[category] && this.CATEGORY_CHARACTERISTICS[category][char]) {
        config = this.CATEGORY_CHARACTERISTICS[category][char];
      }

      if (config) {
        characteristics.push({
          label: config.label,
          color: config.color,
          priority: config.priority,
          score: score
        });
      }
    }

    // Sort by score (descending), then priority (ascending), then alphabetically
    characteristics.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.label.localeCompare(b.label);
    });

    // Return top 3, ensuring diversity
    const result = [];
    const usedCategories = new Set();

    // First pass: get highest scoring unique categories
    for (const char of characteristics) {
      const category = this.getCharacteristicCategory(char.label);
      if (!usedCategories.has(category) && result.length < 3) {
        result.push({ label: char.label, color: char.color });
        usedCategories.add(category);
      }
    }

    // Second pass: fill remaining slots
    for (const char of characteristics) {
      if (result.length >= 3) break;
      if (!result.some(r => r.label === char.label)) {
        result.push({ label: char.label, color: char.color });
      }
    }

    // Ensure we always return exactly 3 pills
    while (result.length < 3) {
      const defaults = [
        { label: 'interactive', color: 'cyan' },
        { label: 'responsive', color: 'cyan' },
        { label: 'simple', color: 'cyan' }
      ];
      for (const def of defaults) {
        if (!result.some(r => r.label === def.label)) {
          result.push(def);
          break;
        }
      }
    }

    return result.slice(0, 3);
  },

  /**
   * Helper: Get the category of a characteristic
   */
  getCharacteristicCategory(label) {
    // Check universal characteristics
    for (const [category, chars] of Object.entries(this.UNIVERSAL_CHARACTERISTICS)) {
      if (chars[label]) return category;
    }
    // Check category-specific characteristics
    for (const [category, chars] of Object.entries(this.CATEGORY_CHARACTERISTICS)) {
      if (chars[label]) return category;
    }
    return 'unknown';
  },

  /**
   * Process all components on the page and assign characteristics
   *
   * @param {string} category - Current page category
   * @returns {Map} Map of component ID to characteristics array
   */
  processAllComponents(category) {
    const results = new Map();
    const cards = document.querySelectorAll('.card[data-component]');

    cards.forEach(card => {
      const component = {
        filename: card.getAttribute('data-component') || '',
        title: card.getAttribute('data-title') || card.querySelector('h3')?.textContent || '',
        description: card.getAttribute('data-desc') || card.querySelector('p')?.textContent || ''
      };

      const characteristics = this.analyzeComponent(component, category);
      results.set(card.getAttribute('data-component'), characteristics);
    });

    return results;
  },

  /**
   * Render characteristics as pill elements in card
   *
   * @param {HTMLElement} card - Card element
   * @param {Array} characteristics - Array of characteristic objects
   */
  renderCharacteristics(card, characteristics) {
    // Find or create pill container
    let pillContainer = card.querySelector('.pill-container');
    if (!pillContainer) {
      pillContainer = document.createElement('div');
      pillContainer.className = 'pill-container';

      // Insert after description
      const description = card.querySelector('p');
      if (description) {
        description.after(pillContainer);
      } else {
        card.appendChild(pillContainer);
      }
    }

    // Clear existing pills
    pillContainer.innerHTML = '';

    // Render pills
    characteristics.forEach(char => {
      const pill = document.createElement('span');
      pill.className = `pill pill-${char.color}`;
      pill.textContent = char.label;
      pill.setAttribute('data-characteristic', char.label);
      pillContainer.appendChild(pill);
    });
  }
};

// Export for use in HTML files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacteristicsEngine;
}
