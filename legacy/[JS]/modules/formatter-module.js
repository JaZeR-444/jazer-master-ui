/**
 * Formatter Module
 * Comprehensive formatting utilities for strings, numbers, dates, and more
 * Compatible with jazer-brand.css styling for formatted elements
 */

class Formatter {
  /**
   * Creates a new formatter instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultLocale: 'en-US',
      defaultCurrency: 'USD',
      ...options
    };
  }

  /**
   * Formats a number with thousands separators and decimal places
   * @param {number} number - Number to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted number
   */
  formatNumber(number, options = {}) {
    if (number === null || number === undefined || isNaN(number)) {
      return '';
    }

    const formatOptions = {
      minimumFractionDigits: options.minimumFractionDigits || 0,
      maximumFractionDigits: options.maximumFractionDigits || 2,
      useGrouping: options.useGrouping !== false,
      style: options.style || undefined,
      currency: options.currency || this.options.defaultCurrency,
      locale: options.locale || this.options.defaultLocale,
      ...options
    };

    try {
      return new Intl.NumberFormat(formatOptions.locale, formatOptions).format(number);
    } catch (e) {
      // Fallback formatting
      const fixedNumber = number.toFixed(formatOptions.maximumFractionDigits);
      return this.addThousandsSeparator(fixedNumber, options.thousandsSeparator || ',');
    }
  }

  /**
   * Formats a number as currency
   * @param {number} amount - Amount to format
   * @param {Object} options - Currency formatting options
   * @returns {string} Formatted currency
   */
  formatCurrency(amount, options = {}) {
    const currencyOptions = {
      style: 'currency',
      currency: options.currency || this.options.defaultCurrency,
      minimumFractionDigits: options.minimumFractionDigits || 2,
      maximumFractionDigits: options.maximumFractionDigits || 2,
      locale: options.locale || this.options.defaultLocale,
      ...options
    };

    return this.formatNumber(amount, currencyOptions);
  }

  /**
   * Formats a number as a percentage
   * @param {number} value - Value to format as percentage (e.g., 0.75 for 75%)
   * @param {Object} options - Percentage formatting options
   * @returns {string} Formatted percentage
   */
  formatPercentage(value, options = {}) {
    const percentageOptions = {
      style: 'percent',
      minimumFractionDigits: options.minimumFractionDigits || 0,
      maximumFractionDigits: options.maximumFractionDigits || 2,
      locale: options.locale || this.options.defaultLocale,
      ...options
    };

    return this.formatNumber(value, percentageOptions);
  }

  /**
   * Formats a date
   * @param {Date|string|number} date - Date to format
   * @param {Object} options - Date formatting options
   * @returns {string} Formatted date
   */
  formatDate(date, options = {}) {
    if (!date) {
      return '';
    }

    // Convert to Date object if needed
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return '';
    }

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const formatOptions = {
      year: options.year || 'numeric',
      month: options.month || 'short',
      day: options.day || 'numeric',
      hour: options.hour || undefined,
      minute: options.minute || undefined,
      second: options.second || undefined,
      weekday: options.weekday || undefined,
      timeZoneName: options.timeZoneName || undefined,
      locale: options.locale || this.options.defaultLocale,
      ...options
    };

    try {
      return new Intl.DateTimeFormat(formatOptions.locale, formatOptions).format(dateObj);
    } catch (e) {
      // Fallback formatting
      return dateObj.toLocaleDateString();
    }
  }

  /**
   * Formats a date range
   * @param {Date|string|number} startDate - Start date
   * @param {Date|string|number} endDate - End date
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date range
   */
  formatDateRange(startDate, endDate, options = {}) {
    const start = this.formatDate(startDate, options);
    const end = this.formatDate(endDate, options);
    
    return `${start} - ${end}`;
  }

  /**
   * Formats a time duration in milliseconds to a human-readable format
   * @param {number} milliseconds - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(milliseconds) {
    if (milliseconds < 0) return '0 seconds';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];
    
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
    if (seconds % 60 > 0) parts.push(`${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(' ') : '0 seconds';
  }

  /**
   * Formats a string with various options
   * @param {string} str - String to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted string
   */
  formatString(str, options = {}) {
    if (typeof str !== 'string') {
      str = String(str);
    }

    let result = str;

    // Apply transformations
    if (options.uppercase) result = result.toUpperCase();
    if (options.lowercase) result = result.toLowerCase();
    if (options.capitalize) result = this.capitalizeWords(result);
    if (options.capitalizeFirst) result = this.capitalizeFirstLetter(result);
    if (options.trim) result = result.trim();
    if (options.escapeHtml) result = this.escapeHtml(result);

    // Apply length constraints
    if (options.maxLength && result.length > options.maxLength) {
      result = result.substring(0, options.maxLength);
      if (options.ellipsis !== false) {
        result += '...';
      }
    }

    return result;
  }

  /**
   * Capitalizes the first letter of each word in a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Capitalizes the first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Formats bytes to a human-readable format
   * @param {number} bytes - Number of bytes
   * @param {Object} options - Formatting options
   * @returns {string} Formatted bytes
   */
  formatBytes(bytes, options = {}) {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 0) return '0 Bytes';
    
    const k = options.decimal ? 1000 : 1024;
    const sizes = options.decimal 
      ? ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formats a phone number
   * @param {string} phoneNumber - Phone number to format
   * @param {string} format - Format pattern (default: (###) ###-####)
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber, format = '(###) ###-####') {
    if (!phoneNumber) return '';
    
    // Remove all non-numeric characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Apply format pattern
    let formattedNumber = format;
    let numberIndex = 0;
    
    for (let i = 0; i < format.length; i++) {
      if (format[i] === '#' && numberIndex < cleanNumber.length) {
        formattedNumber = formattedNumber.substring(0, i) + 
                         cleanNumber[numberIndex] + 
                         formattedNumber.substring(i + 1);
        numberIndex++;
      }
    }
    
    // Remove any remaining # symbols
    formattedNumber = formattedNumber.replace(/#/g, '');
    
    return formattedNumber;
  }

  /**
   * Formats a credit card number
   * @param {string} cardNumber - Credit card number to format
   * @param {string} separator - Separator between groups (default: space)
   * @returns {string} Formatted credit card number
   */
  formatCreditCard(cardNumber, separator = ' ') {
    if (!cardNumber) return '';
    
    // Remove all non-numeric characters
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    // Format in groups of 4
    return cleanNumber.match(/.{1,4}/g)?.join(separator) || cleanNumber;
  }

  /**
   * Formats text as markdown (basic implementation)
   * @param {string} text - Text to format as markdown
   * @returns {string} HTML formatted from markdown
   */
  formatMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Code blocks
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }

  /**
   * Adds thousands separators to a number string
   * @param {string} numberString - Number as string
   * @param {string} separator - Separator character
   * @returns {string} Number string with separators
   */
  addThousandsSeparator(numberString, separator = ',') {
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  /**
   * Escapes HTML in a string
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Formats an object as a human-readable string
   * @param {Object} obj - Object to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted object string
   */
  formatObject(obj, options = {}) {
    if (!obj) return '';
    
    const indent = options.indent || 2;
    const space = ' '.repeat(indent);
    
    return JSON.stringify(obj, null, space);
  }

  /**
   * Formats a list of items
   * @param {Array} items - Array of items to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted list
   */
  formatList(items, options = {}) {
    if (!Array.isArray(items)) return '';
    
    const separator = options.separator || ', ';
    const lastSeparator = options.lastSeparator || ' and ';
    const property = options.property || null;
    
    if (items.length === 0) return '';
    if (items.length === 1) return property ? items[0][property] : items[0];
    if (items.length === 2) {
      const first = property ? items[0][property] : items[0];
      const second = property ? items[1][property] : items[1];
      return `${first}${lastSeparator}${second}`;
    }
    
    const allButLast = items.slice(0, -1).map(item => 
      property ? item[property] : item
    );
    const lastItem = property ? items[items.length - 1][property] : items[items.length - 1];
    
    return `${allButLast.join(separator)}${lastSeparator}${lastItem}`;
  }

  /**
   * Formats an email address (obfuscates part of it)
   * @param {string} email - Email address to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted email
   */
  formatEmail(email, options = {}) {
    if (!email) return '';
    
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    
    const [localPart, domain] = parts;
    
    if (localPart.length <= 1) {
      return `${localPart}@${domain}`;
    }
    
    const visibleChars = options.visibleChars || 1;
    const obfuscatedPart = localPart.substring(0, visibleChars) + 
                          '*'.repeat(localPart.length - visibleChars);
    
    return `${obfuscatedPart}@${domain}`;
  }

  /**
   * Formats a text with prefix and suffix
   * @param {string|number} text - Text to format
   * @param {Object} options - Formatting options with prefix and/or suffix
   * @returns {string} Formatted text
   */
  formatWithPrefixSuffix(text, options = {}) {
    const prefix = options.prefix || '';
    const suffix = options.suffix || '';
    
    return prefix + text + suffix;
  }

  /**
   * Formats an array of values with a custom formatter function
   * @param {Array} array - Array to format
   * @param {Function} formatter - Function to format each item
   * @returns {Array} Array of formatted items
   */
  formatArray(array, formatter) {
    if (!Array.isArray(array)) return [];
    
    return array.map(formatter);
  }

  /**
   * Formats a slug from a string
   * @param {string} text - Text to convert to slug
   * @param {Object} options - Formatting options
   * @returns {string} Formatted slug
   */
  formatSlug(text, options = {}) {
    if (!text) return '';
    
    const separator = options.separator || '-';
    
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, separator)           // Replace spaces with separator
      .replace(/[^\w\-]+/g, '')            // Remove all non-word chars
      .replace(/\-\-+/g, separator)         // Replace multiple separators with single
      .replace(/^-+/, '')                   // Trim separator from start
      .replace(/-+$/, '');                  // Trim separator from end
  }

  /**
   * Formats a UUID
   * @param {string} uuid - UUID to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted UUID
   */
  formatUUID(uuid, options = {}) {
    if (!uuid) return '';
    
    const uppercase = options.uppercase || false;
    const removeDashes = options.removeDashes || false;
    
    let formatted = uuid.toString();
    
    if (removeDashes) {
      formatted = formatted.replace(/-/g, '');
    }
    
    return uppercase ? formatted.toUpperCase() : formatted.toLowerCase();
  }
}

/**
 * Creates a new formatter instance
 * @param {Object} options - Formatter options
 * @returns {Formatter} New formatter instance
 */
function createFormatter(options = {}) {
  return new Formatter(options);
}

/**
 * Default formatter instance
 */
const defaultFormatter = new Formatter();

/**
 * Format a number with default settings
 * @param {number} number - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number
 */
function formatNumber(number, options = {}) {
  return defaultFormatter.formatNumber(number, options);
}

/**
 * Format a currency with default settings
 * @param {number} amount - Amount to format
 * @param {Object} options - Currency formatting options
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, options = {}) {
  return defaultFormatter.formatCurrency(amount, options);
}

/**
 * Format a percentage with default settings
 * @param {number} value - Value to format as percentage
 * @param {Object} options - Percentage formatting options
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, options = {}) {
  return defaultFormatter.formatPercentage(value, options);
}

/**
 * Format a date with default settings
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Date formatting options
 * @returns {string} Formatted date
 */
function formatDate(date, options = {}) {
  return defaultFormatter.formatDate(date, options);
}

/**
 * Format bytes with default settings
 * @param {number} bytes - Number of bytes
 * @param {Object} options - Formatting options
 * @returns {string} Formatted bytes
 */
function formatBytes(bytes, options = {}) {
  return defaultFormatter.formatBytes(bytes, options);
}

/**
 * Format a phone number with default settings
 * @param {string} phoneNumber - Phone number to format
 * @param {string} format - Format pattern
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phoneNumber, format = '(###) ###-####') {
  return defaultFormatter.formatPhoneNumber(phoneNumber, format);
}

/**
 * Format a credit card number with default settings
 * @param {string} cardNumber - Credit card number to format
 * @param {string} separator - Separator between groups
 * @returns {string} Formatted credit card number
 */
function formatCreditCard(cardNumber, separator = ' ') {
  return defaultFormatter.formatCreditCard(cardNumber, separator);
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Formatter,
    createFormatter,
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatDate,
    formatBytes,
    formatPhoneNumber,
    formatCreditCard
  };
}

// Also make it available globally
window.Formatter = Formatter;
window.createFormatter = createFormatter;
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;
window.formatPercentage = formatPercentage;
window.formatDate = formatDate;
window.formatBytes = formatBytes;
window.formatPhoneNumber = formatPhoneNumber;
window.formatCreditCard = formatCreditCard;