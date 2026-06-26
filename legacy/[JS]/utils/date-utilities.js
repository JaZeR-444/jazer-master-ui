/**
 * Date Utilities Module
 * Comprehensive date manipulation and utility functions
 * Compatible with jazer-brand.css styling for date-related utilities
 */

class DateUtils {
  /**
   * Creates a new date utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultLocale: 'en-US',
      defaultFormat: 'YYYY-MM-DD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...options
    };
  }

  /**
   * Formats a date according to the specified pattern
   * @param {Date|string|number} date - Date to format
   * @param {string} format - Format pattern (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY HH:mm:ss')
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date string
   */
  static format(date, format = 'YYYY-MM-DD', options = {}) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date provided to DateUtils.format');
    }

    const locale = options.locale || this.options.defaultLocale;
    const tz = options.timezone || this.options.timezone;

    // Create formatter with specified options
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      year: format.includes('YYYY') ? 'numeric' : undefined,
      month: format.includes('MM') ? '2-digit' : 
             format.includes('MMM') ? 'short' : 
             format.includes('MMMM') ? 'long' : undefined,
      day: format.includes('DD') ? '2-digit' : undefined,
      hour: format.includes('HH') ? '2-digit' : undefined,
      minute: format.includes('mm') ? '2-digit' : undefined,
      second: format.includes('ss') ? '2-digit' : undefined
    });

    // For custom format patterns not supported by Intl.DateTimeFormat, handle manually
    const formatted = formatter.format(d);
    
    // This is a simplified version - a full implementation would parse the format string
    // and replace each token with the appropriate date component
    let result = format
      .replace(/YYYY/g, d.getFullYear())
      .replace(/MM/g, String(d.getMonth() + 1).padStart(2, '0'))
      .replace(/DD/g, String(d.getDate()).padStart(2, '0'))
      .replace(/HH/g, String(d.getHours()).padStart(2, '0'))
      .replace(/mm/g, String(d.getMinutes()).padStart(2, '0'))
      .replace(/ss/g, String(d.getSeconds()).padStart(2, '0'))
      .replace(/MMM/g, d.toLocaleString(locale, { month: 'short' }))
      .replace(/MMMM/g, d.toLocaleString(locale, { month: 'long' }));

    return result;
  }

  /**
   * Parses a date string according to the specified format
   * @param {string} dateString - Date string to parse
   * @param {string} format - Expected format
   * @returns {Date} Parsed date object
   */
  static parse(dateString, format) {
    if (typeof dateString !== 'string' || typeof format !== 'string') {
      throw new TypeError('Date string and format must be strings');
    }

    // Simple date parsing for common formats
    // A more comprehensive implementation would handle various format patterns
    
    // Try ISO 8601 format first
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Try common formats based on the format string
    // This is a simplified implementation - a full parser would be more complex
    try {
      // Handle common formats
      if (format.includes('YYYY-MM-DD')) {
        return new Date(dateString);
      } else if (format.includes('MM/DD/YYYY')) {
        const [month, day, year] = dateString.split('/');
        return new Date(year, month - 1, day);
      } else if (format.includes('DD/MM/YYYY')) {
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day);
      } else {
        // Try to parse using the general Date constructor
        return new Date(dateString);
      }
    } catch (e) {
      throw new Error(`Unable to parse date string "${dateString}" with format "${format}"`);
    }
  }

  /**
   * Adds time units to a date
   * @param {Date} date - Date to add to
   * @param {number} amount - Amount to add
   * @param {string} unit - Unit type ('milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years')
   * @returns {Date} New date with units added
   */
  static add(date, amount, unit) {
    const d = new Date(date);
    
    switch (unit.toLowerCase()) {
      case 'milliseconds':
        d.setMilliseconds(d.getMilliseconds() + amount);
        break;
      case 'seconds':
        d.setSeconds(d.getSeconds() + amount);
        break;
      case 'minutes':
        d.setMinutes(d.getMinutes() + amount);
        break;
      case 'hours':
        d.setHours(d.getHours() + amount);
        break;
      case 'days':
        d.setDate(d.getDate() + amount);
        break;
      case 'weeks':
        d.setDate(d.getDate() + (amount * 7));
        break;
      case 'months':
        d.setMonth(d.getMonth() + amount);
        break;
      case 'years':
        d.setFullYear(d.getFullYear() + amount);
        break;
      default:
        throw new Error(`Invalid unit: ${unit}`);
    }
    
    return d;
  }

  /**
   * Subtracts time units from a date
   * @param {Date} date - Date to subtract from
   * @param {number} amount - Amount to subtract
   * @param {string} unit - Unit type
   * @returns {Date} New date with units subtracted
   */
  static subtract(date, amount, unit) {
    return DateUtils.add(date, -amount, unit);
  }

  /**
   * Gets the difference between two dates in specified units
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @param {string} unit - Unit type
   * @returns {number} Difference in specified units
   */
  static difference(date1, date2, unit) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    const msDiff = d2.getTime() - d1.getTime();
    
    switch (unit.toLowerCase()) {
      case 'milliseconds':
        return msDiff;
      case 'seconds':
        return Math.floor(msDiff / 1000);
      case 'minutes':
        return Math.floor(msDiff / (1000 * 60));
      case 'hours':
        return Math.floor(msDiff / (1000 * 60 * 60));
      case 'days':
        return Math.floor(msDiff / (1000 * 60 * 60 * 24));
      case 'weeks':
        return Math.floor(msDiff / (1000 * 60 * 60 * 24 * 7));
      case 'months':
        // Calculate months difference with more precision
        let months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months += d2.getMonth() - d1.getMonth();
        
        // Adjust if the day of the second month is less than first
        if (d2.getDate() < d1.getDate()) {
          months--;
        }
        
        return months;
      case 'years':
        // Calculate years difference with more precision
        let years = d2.getFullYear() - d1.getFullYear();
        
        // Adjust if the same year but the second date is earlier in the year
        if (d2.getMonth() < d1.getMonth() || 
            (d2.getMonth() === d1.getMonth() && d2.getDate() < d1.getDate())) {
          years--;
        }
        
        return years;
      default:
        throw new Error(`Invalid unit: ${unit}`);
    }
  }

  /**
   * Checks if a date is valid
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the date is valid
   */
  static isValid(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Checks if a date is within a range
   * @param {Date} date - Date to check
   * @param {Date} start - Start of range
   * @param {Date} end - End of range
   * @returns {boolean} Whether the date is in the range
   */
  static inRange(date, start, end) {
    const d = new Date(date);
    const s = new Date(start);
    const e = new Date(end);
    
    return d >= s && d <= e;
  }

  /**
   * Checks if a date is today
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the date is today
   */
  static isToday(date) {
    const today = new Date();
    const d = new Date(date);
    
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  }

  /**
   * Checks if a date is tomorrow
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the date is tomorrow
   */
  static isTomorrow(date) {
    const tomorrow = DateUtils.add(new Date(), 1, 'days');
    const d = new Date(date);
    
    return DateUtils.isSameDay(d, tomorrow);
  }

  /**
   * Checks if a date is yesterday
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the date is yesterday
   */
  static isYesterday(date) {
    const yesterday = DateUtils.subtract(new Date(), 1, 'days');
    const d = new Date(date);
    
    return DateUtils.isSameDay(d, yesterday);
  }

  /**
   * Checks if two dates are on the same day
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {boolean} Whether the dates are on the same day
   */
  static isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  /**
   * Checks if two dates are in the same month
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {boolean} Whether the dates are in the same month
   */
  static isSameMonth(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth();
  }

  /**
   * Checks if two dates are in the same year
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {boolean} Whether the dates are in the same year
   */
  static isSameYear(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear();
  }

  /**
   * Gets the start of the day for a date
   * @param {Date} date - Date to get start of day for
   * @returns {Date} Start of the day
   */
  static startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Gets the end of the day for a date
   * @param {Date} date - Date to get end of day for
   * @returns {Date} End of the day
   */
  static endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Gets the start of the month for a date
   * @param {Date} date - Date to get start of month for
   * @returns {Date} Start of the month
   */
  static startOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    return DateUtils.startOfDay(d);
  }

  /**
   * Gets the end of the month for a date
   * @param {Date} date - Date to get end of month for
   * @returns {Date} End of the month
   */
  static endOfMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1, 0); // Set to last day of current month
    return DateUtils.endOfDay(d);
  }

  /**
   * Gets the start of the year for a date
   * @param {Date} date - Date to get start of year for
   * @returns {Date} Start of the year
   */
  static startOfYear(date) {
    const d = new Date(date);
    d.setMonth(0, 1); // Set to January 1st
    return DateUtils.startOfDay(d);
  }

  /**
   * Gets the end of the year for a date
   * @param {Date} date - Date to get end of year for
   * @returns {Date} End of the year
   */
  static endOfYear(date) {
    const d = new Date(date);
    d.setMonth(11, 31); // Set to December 31st
    return DateUtils.endOfDay(d);
  }

  /**
   * Gets the start of the week for a date (Sunday as first day)
   * @param {Date} date - Date to get start of week for
   * @param {number} firstDay - First day of the week (0 = Sunday, 1 = Monday, etc.)
   * @returns {Date} Start of the week
   */
  static startOfWeek(date, firstDay = 0) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day - firstDay + 7) % 7;
    d.setDate(d.getDate() - diff);
    return DateUtils.startOfDay(d);
  }

  /**
   * Gets the end of the week for a date
   * @param {Date} date - Date to get end of week for
   * @param {number} firstDay - First day of the week (0 = Sunday, 1 = Monday, etc.)
   * @returns {Date} End of the week
   */
  static endOfWeek(date, firstDay = 0) {
    const startOfWeek = DateUtils.startOfWeek(date, firstDay);
    return DateUtils.add(startOfWeek, 6, 'days');
  }

  /**
   * Gets the quarter of the year for a date
   * @param {Date} date - Date to get quarter for
   * @returns {number} Quarter (1-4)
   */
  static getQuarter(date) {
    const month = new Date(date).getMonth();
    return Math.floor(month / 3) + 1;
  }

  /**
   * Gets the number of days in the month of a date
   * @param {Date} date - Date to get days in month for
   * @returns {number} Number of days in the month
   */
  static getDaysInMonth(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  /**
   * Gets the number of days in the year of a date
   * @param {Date} date - Date to get days in year for
   * @returns {number} Number of days in the year
   */
  static getDaysInYear(date) {
    const year = new Date(date).getFullYear();
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 366 : 365;
  }

  /**
   * Checks if the year of a date is a leap year
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the year is a leap year
   */
  static isLeapYear(date) {
    const year = new Date(date).getFullYear();
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Gets the week number of the year for a date
   * @param {Date} date - Date to get week number for
   * @returns {number} Week number (ISO 8601)
   */
  static getWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  }

  /**
   * Creates a date range between two dates
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @param {string} unit - Unit to increment by ('day', 'week', 'month', 'year')
   * @returns {Array<Date>} Array of dates in the range
   */
  static createRange(start, end, unit = 'day') {
    const dates = [];
    let current = new Date(start);
    const endDate = new Date(end);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      
      switch (unit.toLowerCase()) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'year':
          current.setFullYear(current.getFullYear() + 1);
          break;
        default:
          throw new Error(`Invalid unit: ${unit}`);
      }
    }
    
    return dates;
  }

  /**
   * Formats a date as relative time (e.g., '2 hours ago')
   * @param {Date} date - Date to format relatively
   * @param {Date} referenceDate - Reference date (default: current date)
   * @returns {string} Relative time string
   */
  static formatRelative(date, referenceDate = new Date()) {
    const d = new Date(date);
    const ref = new Date(referenceDate);
    const diff = ref.getTime() - d.getTime();
    const absDiff = Math.abs(diff);
    
    // Define time units in milliseconds
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;
    
    let value, unit;
    
    if (absDiff < minute) {
      value = Math.round(absDiff / 1000);
      unit = 'second';
    } else if (absDiff < hour) {
      value = Math.round(absDiff / minute);
      unit = 'minute';
    } else if (absDiff < day) {
      value = Math.round(absDiff / hour);
      unit = 'hour';
    } else if (absDiff < week) {
      value = Math.round(absDiff / day);
      unit = 'day';
    } else if (absDiff < month) {
      value = Math.round(absDiff / week);
      unit = 'week';
    } else if (absDiff < year) {
      value = Math.round(absDiff / month);
      unit = 'month';
    } else {
      value = Math.round(absDiff / year);
      unit = 'year';
    }
    
    const suffix = diff > 0 ? 'ago' : 'from now';
    const plural = value !== 1 ? 's' : '';
    
    return `${value} ${unit}${plural} ${suffix}`;
  }

  /**
   * Formats a date to local string according to the specified format
   * @param {Date} date - Date to format
   * @param {string} format - Format type ('date', 'time', 'datetime', 'full')
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date string
   */
  static formatLocale(date, format = 'datetime', options = {}) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const locale = options.locale || this.options.defaultLocale;

    switch (format.toLowerCase()) {
      case 'date':
        return d.toLocaleDateString(locale);
      case 'time':
        return d.toLocaleTimeString(locale);
      case 'datetime':
        return d.toLocaleString(locale);
      case 'full':
        return d.toLocaleString(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      default:
        return d.toLocaleString(locale);
    }
  }

  /**
   * Creates a date calculator utility
   * @returns {Object} Date calculator with arithmetic methods
   */
  static createCalculator() {
    return {
      add: DateUtils.add,
      subtract: DateUtils.subtract,
      difference: DateUtils.difference,
      
      // Additional convenience methods
      addDays: (date, amount) => DateUtils.add(date, amount, 'days'),
      addWeeks: (date, amount) => DateUtils.add(date, amount, 'weeks'),
      addMonths: (date, amount) => DateUtils.add(date, amount, 'months'),
      addYears: (date, amount) => DateUtils.add(date, amount, 'years'),
      
      subtractDays: (date, amount) => DateUtils.subtract(date, amount, 'days'),
      subtractWeeks: (date, amount) => DateUtils.subtract(date, amount, 'weeks'),
      subtractMonths: (date, amount) => DateUtils.subtract(date, amount, 'months'),
      subtractYears: (date, amount) => DateUtils.subtract(date, amount, 'years'),
      
      daysBetween: (date1, date2) => Math.abs(DateUtils.difference(date1, date2, 'days')),
      weeksBetween: (date1, date2) => Math.abs(DateUtils.difference(date1, date2, 'weeks')),
      monthsBetween: (date1, date2) => Math.abs(DateUtils.difference(date1, date2, 'months')),
      yearsBetween: (date1, date2) => Math.abs(DateUtils.difference(date1, date2, 'years'))
    };
  }

  /**
   * Creates a date parser utility with multiple format support
   * @returns {Object} Date parser with multiple parsing methods
   */
  static createParser() {
    return {
      parse: DateUtils.parse,
      parseISO: (str) => new Date(str),
      parseUnix: (timestamp) => new Date(timestamp * 1000),
      parseHuman: (str) => {
        // Handle human-readable date strings
        const date = new Date(str);
        return isNaN(date.getTime()) ? null : date;
      },
      
      // Parse different date formats
      parseUS: (str) => {
        // MM/DD/YYYY format
        const parts = str.split('/');
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[0] - 1, parts[1]);
      },
      
      parseEuropean: (str) => {
        // DD/MM/YYYY format
        const parts = str.split('/');
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[1] - 1, parts[0]);
      },
      
      parseCustom: (str, format) => {
        // Delegate to the main parse function
        return DateUtils.parse(str, format);
      }
    };
  }

  /**
   * Creates a date formatter utility with multiple format support
   * @returns {Object} Date formatter with multiple formatting methods
   */
  static createFormatter() {
    return {
      format: DateUtils.format,
      formatISO: (date) => new Date(date).toISOString(),
      formatUnix: (date) => Math.floor(new Date(date).getTime() / 1000),
      formatUS: (date) => DateUtils.format(date, 'MM/DD/YYYY'),
      formatEuropean: (date) => DateUtils.format(date, 'DD/MM/YYYY'),
      formatRFC3339: (date) => new Date(date).toISOString().replace(/\.\d{3}Z$/, 'Z'),
      formatCustom: (date, format) => DateUtils.format(date, format),
      
      // Format with specific styles
      formatShort: (date) => DateUtils.formatLocale(date, 'date'),
      formatMedium: (date) => DateUtils.formatLocale(date, 'datetime'),
      formatLong: (date) => DateUtils.formatLocale(date, 'full')
    };
  }

  /**
   * Creates a date validator utility
   * @returns {Object} Date validator with multiple validation methods
   */
  static createValidator() {
    return {
      isValid: DateUtils.isValid,
      isFuture: (date) => new Date(date) > new Date(),
      isPast: (date) => new Date(date) < new Date(),
      isInRange: DateUtils.inRange,
      isToday: DateUtils.isToday,
      isTomorrow: DateUtils.isTomorrow,
      isYesterday: DateUtils.isYesterday,
      isWeekend: (date) => {
        const d = new Date(date);
        const day = d.getDay();
        return day === 0 || day === 6;
      },
      isWeekday: (date) => !this.isWeekend(date),
      isLeapYear: DateUtils.isLeapYear,
      isSameDay: DateUtils.isSameDay,
      isSameMonth: DateUtils.isSameMonth,
      isSameYear: DateUtils.isSameYear,
      
      validateFormat: (dateStr, format) => {
        try {
          const parsed = DateUtils.parse(dateStr, format);
          return DateUtils.isValid(parsed);
        } catch (e) {
          return false;
        }
      },
      
      validateAge: (dateOfBirth, minAge, maxAge) => {
        const birthDate = new Date(dateOfBirth);
        if (!DateUtils.isValid(birthDate)) return false;
        
        const today = new Date();
        const age = DateUtils.difference(birthDate, today, 'years');
        
        if (minAge && age < minAge) return false;
        if (maxAge && age > maxAge) return false;
        
        return true;
      }
    };
  }

  /**
   * Creates a date comparison utility
   * @returns {Object} Date comparison tools
   */
  static createComparator() {
    return {
      isSameDay: DateUtils.isSameDay,
      isSameMonth: DateUtils.isSameMonth,
      isSameYear: DateUtils.isSameYear,
      isBefore: (date1, date2) => new Date(date1) < new Date(date2),
      isAfter: (date1, date2) => new Date(date1) > new Date(date2),
      isBetween: (date, start, end) => DateUtils.inRange(date, start, end),
      compare: (date1, date2) => {
        const d1 = new Date(date1).getTime();
        const d2 = new Date(date2).getTime();
        return d1 === d2 ? 0 : d1 > d2 ? 1 : -1;
      }
    };
  }

  /**
   * Gets the age from a date of birth
   * @param {Date} dob - Date of birth
   * @param {Date} referenceDate - Reference date (default: current date)
   * @returns {number} Age in years
   */
  static getAge(dob, referenceDate = new Date()) {
    const birth = new Date(dob);
    const ref = new Date(referenceDate);
    
    let age = ref.getFullYear() - birth.getFullYear();
    const monthDiff = ref.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Gets the age in days from a date of birth
   * @param {Date} dob - Date of birth
   * @param {Date} referenceDate - Reference date (default: current date)
   * @returns {number} Age in days
   */
  static getAgeInDays(dob, referenceDate = new Date()) {
    const birth = new Date(dob);
    const ref = new Date(referenceDate);
    
    const diffTime = Math.abs(ref.getTime() - birth.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Creates a date utility instance with all functionality
   * @param {Object} options - Date utility options
   * @returns {Object} Comprehensive date utility instance
   */
  static createInstance(options = {}) {
    const instance = new DateUtils(options);
    
    return {
      // Formatting
      format: (date, format) => DateUtils.format(date, format, options),
      formatLocale: (date, format) => DateUtils.formatLocale(date, format, options),
      
      // Parsing
      parse: (date, format) => DateUtils.parse(date, format),
      parseISO: (str) => DateUtils.parseISO(str),
      parseUnix: (timestamp) => DateUtils.parseUnix(timestamp),
      
      // Arithmetic
      add: (date, amount, unit) => DateUtils.add(date, amount, unit),
      subtract: (date, amount, unit) => DateUtils.subtract(date, amount, unit),
      difference: (date1, date2, unit) => DateUtils.difference(date1, date2, unit),
      
      // Validations
      isValid: DateUtils.isValid,
      isToday: DateUtils.isToday,
      isFuture: (date) => DateUtils.isFuture(date),
      isPast: (date) => DateUtils.isPast(date),
      inRange: DateUtils.inRange,
      
      // Utilities
      getAge: (dob, ref) => DateUtils.getAge(dob, ref),
      getAgeInDays: (dob, ref) => DateUtils.getAgeInDays(dob, ref),
      createRange: DateUtils.createRange,
      formatRelative: (date, ref) => DateUtils.formatRelative(date, ref),
      
      // Creators
      createCalculator: () => DateUtils.createCalculator(),
      createParser: () => DateUtils.createParser(),
      createFormatter: () => DateUtils.createFormatter(),
      createValidator: () => DateUtils.createValidator(),
      createComparator: () => DateUtils.createComparator()
    };
  }

  /**
   * Creates a date range selector utility
   * @param {Object} options - Range selector options
   * @returns {Object} Date range selector with start/end date controls
   */
  static createRangeSelector(options = {}) {
    const rangeOptions = {
      startDate: options.startDate || new Date(),
      endDate: options.endDate || DateUtils.add(new Date(), 7, 'days'),
      onChange: options.onChange || null,
      ...options
    };

    let startDate = new Date(rangeOptions.startDate);
    let endDate = new Date(rangeOptions.endDate);
    
    return {
      startDate,
      endDate,
      
      setStartDate: (date) => {
        const newDate = new Date(date);
        if (DateUtils.isValid(newDate)) {
          startDate = newDate;
          if (startDate > endDate) {
            endDate = DateUtils.add(startDate, 1, 'days');
          }
          if (rangeOptions.onChange) {
            rangeOptions.onChange({ startDate, endDate });
          }
          return true;
        }
        return false;
      },
      
      setEndDate: (date) => {
        const newDate = new Date(date);
        if (DateUtils.isValid(newDate) && newDate >= startDate) {
          endDate = newDate;
          if (rangeOptions.onChange) {
            rangeOptions.onChange({ startDate, endDate });
          }
          return true;
        }
        return false;
      },
      
      getRange: () => ({ startDate, endDate }),
      getDays: () => DateUtils.createRange(startDate, endDate, 'day'),
      getWeeks: () => DateUtils.createRange(startDate, endDate, 'week'),
      getWeeks: () => DateUtils.createRange(startDate, endDate, 'month'),
      
      extendStart: (amount, unit) => {
        startDate = DateUtils.subtract(startDate, amount, unit);
        if (rangeOptions.onChange) {
          rangeOptions.onChange({ startDate, endDate });
        }
      },
      
      extendEnd: (amount, unit) => {
        endDate = DateUtils.add(endDate, amount, unit);
        if (rangeOptions.onChange) {
          rangeOptions.onChange({ startDate, endDate });
        }
      },
      
      changeRange: (newStartDate, newEndDate) => {
        const start = new Date(newStartDate);
        const end = new Date(newEndDate);
        
        if (DateUtils.isValid(start) && DateUtils.isValid(end) && start <= end) {
          startDate = start;
          endDate = end;
          if (rangeOptions.onChange) {
            rangeOptions.onChange({ startDate, endDate });
          }
          return true;
        }
        return false;
      }
    };
  }

  /**
   * Creates a timezone converter utility
   * @param {string} sourceTz - Source timezone
   * @param {string} targetTz - Target timezone
   * @returns {Object} Timezone converter utility
   */
  static createTimezoneConverter(sourceTz, targetTz) {
    return {
      convert: (date) => {
        try {
          const sourceDate = new Date(date);
          const utc = sourceDate.getTime() + (sourceDate.getTimezoneOffset() * 60000);
          const targetDate = new Date(utc + (new Date().getTimezoneOffset() * 60000));
          
          // Use Intl.DateTimeFormat for more accurate conversion
          return new Date(
            targetDate.toLocaleString('en-US', { timeZone: targetTz })
          );
        } catch (e) {
          console.error('Timezone conversion error:', e);
          return new Date(date);
        }
      },
      
      getOffset: (date) => {
        // Calculate timezone offset difference
        const sourceDate = new Date(date);
        const sourceTime = sourceDate.toLocaleString('en-US', { timeZone: sourceTz, hour12: false });
        const targetTime = sourceDate.toLocaleString('en-US', { timeZone: targetTz, hour12: false });
        
        const sourceDt = new Date(sourceTime);
        const targetDt = new Date(targetTime);
        
        return targetDt.getTime() - sourceDt.getTime();
      }
    };
  }

  /**
   * Formats date as a countdown timer string (days:hours:minutes:seconds)
   * @param {Date} targetDate - Target date for countdown
   * @param {Date} startDate - Start date for countdown (default: now)
   * @returns {string} Formatted countdown string (D:H:M:S)
   */
  static formatCountdown(targetDate, startDate = new Date()) {
    const start = new Date(startDate);
    const target = new Date(targetDate);
    
    // Calculate difference in milliseconds
    const diff = target.getTime() - start.getTime();
    
    if (diff <= 0) {
      return '0:0:0:0';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${days}:${hours}:${minutes}:${seconds}`;
  }

  /**
   * Creates a date iterator that cycles through dates in a range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} step - Step size ('day', 'week', 'month', 'year')
   * @returns {Generator} Date iterator generator
   */
  static *dateIterator(startDate, endDate, step = 'day') {
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      yield new Date(current);
      
      switch (step) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'year':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }
  }

  /**
   * Converts a date to different calendar formats (Gregorian, Julian, etc.)
   * @param {Date} date - Date to convert
   * @param {string} calendar - Calendar format ('gregory', 'japanese', 'buddhist', etc.)
   * @returns {Date} Date converted to specified calendar
   */
  static convertCalendar(date, calendar) {
    try {
      const d = new Date(date);
      
      // Use Intl.DateTimeFormat with calendar option
      const formatter = new Intl.DateTimeFormat('en-US', {
        calendar,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
      });
      
      // Parse back into a Date object
      const formatted = formatter.format(d);
      return new Date(formatted);
    } catch (e) {
      console.error('Calendar conversion error:', e);
      return new Date(date);
    }
  }

  /**
   * Adds dynamic styles for date utilities
   */
  static addDynamicStyles() {
    if (document.getElementById('date-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'date-utilities-styles';
    style.textContent = `
      /* Date utility related styles */
      .date-display {
        font-family: monospace;
        padding: 8px 12px;
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 6px;
        color: var(--text-light, #fff);
      }
      
      .date-range-display {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .date-input {
        padding: 8px 12px;
        background: var(--bg-dark, #0a0a0a);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 6px;
        color: var(--text-light, #fff);
      }
      
      .date-input:focus {
        outline: none;
        border-color: var(--jazer-cyan, #00f2ea);
        box-shadow: 0 0 0 2px rgba(0, 242, 234, 0.2);
      }
      
      .date-relative-time {
        font-style: italic;
        color: var(--text-gray, #aaa);
      }
      
      .age-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        background: var(--bg-accent, #007acc);
        color: white;
        font-size: 0.8rem;
      }
      
      .countdown-display {
        font-family: monospace;
        font-size: 1.2rem;
        color: var(--jazer-cyan, #00f2ea);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the date utilities instance and cleans up
   */
  destroy() {
    // No specific cleanup needed for date utilities
    this.options = null;
    this.cache = null;
  }
}

// Create default instance
const dateUtils = new DateUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DateUtils,
    dateUtils
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.DateUtils = DateUtils;
  window.dateUtils = dateUtils;
}