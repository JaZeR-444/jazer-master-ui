// File validation utilities for forms

// File type validators
const FileTypeValidators = {
  // Image files
  isImage: (file) => /^image\//.test(file.type),
  isJPG: (file) => file.type === 'image/jpeg',
  isPNG: (file) => file.type === 'image/png',
  isGIF: (file) => file.type === 'image/gif',
  isWebP: (file) => file.type === 'image/webp',
  
  // Document files
  isPDF: (file) => file.type === 'application/pdf',
  isDOC: (file) => file.type === 'application/msword',
  isDOCX: (file) => file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  isXLS: (file) => file.type === 'application/vnd.ms-excel',
  isXLSX: (file) => file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  isPPT: (file) => file.type === 'application/vnd.ms-powerpoint',
  isPPTX: (file) => file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // Text files
  isText: (file) => file.type === 'text/plain',
  isJSON: (file) => file.type === 'application/json',
  isCSV: (file) => file.type === 'text/csv',
  
  // Archive files
  isZIP: (file) => file.type === 'application/zip',
  isRAR: (file) => file.type === 'application/x-rar-compressed',
};

// File validation class
class FileValidator {
  constructor(options = {}) {
    this.options = {
      maxSize: options.maxSize || 5 * 1024 * 1024, // 5MB default
      allowedTypes: options.allowedTypes || [], // All types allowed by default
      minSize: options.minSize || 0, // No minimum size by default
      maxFiles: options.maxFiles || 1, // Single file by default
      ...options
    };
  }
  
  // Validate a single file
  validateFile(file) {
    const errors = [];
    
    // Check size
    if (file.size > this.options.maxSize) {
      errors.push({
        type: 'size',
        message: `File size exceeds the limit of ${this.formatFileSize(this.options.maxSize)}`,
        expected: this.options.maxSize,
        actual: file.size
      });
    }
    
    if (file.size < this.options.minSize) {
      errors.push({
        type: 'size',
        message: `File size is below the minimum of ${this.formatFileSize(this.options.minSize)}`,
        expected: this.options.minSize,
        actual: file.size
      });
    }
    
    // Check type
    if (this.options.allowedTypes.length > 0) {
      const isAllowed = this.options.allowedTypes.some(allowedType => {
        if (typeof allowedType === 'string') {
          // If it's a string, check if the file type starts with it (for image/*, etc.)
          return file.type.startsWith(allowedType);
        } else if (typeof allowedType === 'function') {
          // If it's a function, use the custom validator
          return allowedType(file);
        }
        return false;
      });
      
      if (!isAllowed) {
        errors.push({
          type: 'type',
          message: `File type "${file.type}" is not allowed`,
          expected: this.options.allowedTypes,
          actual: file.type
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      file
    };
  }
  
  // Validate multiple files
  validateFiles(files) {
    const results = [];
    const allErrors = [];
    
    if (files.length > this.options.maxFiles) {
      return {
        isValid: false,
        errors: [{
          type: 'count',
          message: `Too many files. Maximum ${this.options.maxFiles} allowed.`,
          expected: this.options.maxFiles,
          actual: files.length
        }],
        results: []
      };
    }
    
    for (let i = 0; i < files.length; i++) {
      const result = this.validateFile(files[i]);
      results.push(result);
      allErrors.push(...result.errors);
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      results
    };
  }
  
  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Check if files match specific criteria
  static async checkDimensions(file, options = {}) {
    return new Promise((resolve) => {
      if (!FileTypeValidators.isImage(file)) {
        resolve({
          isValid: false,
          errors: [{ type: 'type', message: 'File is not an image' }],
          file
        });
        return;
      }
      
      const img = new Image();
      img.onload = function() {
        const errors = [];
        
        if (options.minWidth && img.width < options.minWidth) {
          errors.push({
            type: 'dimensions',
            message: `Image width is too small. Minimum width is ${options.minWidth}px.`,
            expected: options.minWidth,
            actual: img.width
          });
        }
        
        if (options.maxWidth && img.width > options.maxWidth) {
          errors.push({
            type: 'dimensions',
            message: `Image width is too large. Maximum width is ${options.maxWidth}px.`,
            expected: options.maxWidth,
            actual: img.width
          });
        }
        
        if (options.minHeight && img.height < options.minHeight) {
          errors.push({
            type: 'dimensions',
            message: `Image height is too small. Minimum height is ${options.minHeight}px.`,
            expected: options.minHeight,
            actual: img.height
          });
        }
        
        if (options.maxHeight && img.height > options.maxHeight) {
          errors.push({
            type: 'dimensions',
            message: `Image height is too large. Maximum height is ${options.maxHeight}px.`,
            expected: options.maxHeight,
            actual: img.height
          });
        }
        
        resolve({
          isValid: errors.length === 0,
          errors,
          file,
          dimensions: { width: img.width, height: img.height }
        });
      };
      
      img.onerror = function() {
        resolve({
          isValid: false,
          errors: [{ type: 'load', message: 'Could not load image to check dimensions' }],
          file
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Validate image content (check if it's a real image, not just the file extension)
  static async validateImageContent(file) {
    return new Promise((resolve) => {
      if (!FileTypeValidators.isImage(file)) {
        resolve({
          isValid: false,
          errors: [{ type: 'type', message: 'File is not an image' }],
          file
        });
        return;
      }
      
      const img = new Image();
      img.onload = function() {
        resolve({
          isValid: true,
          errors: [],
          file
        });
      };
      
      img.onerror = function() {
        resolve({
          isValid: false,
          errors: [{ type: 'content', message: 'File is not a valid image' }],
          file
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}

// File validation utility functions
function createFileInputValidator(inputSelector, validator, options = {}) {
  const input = typeof inputSelector === 'string' ? 
    document.querySelector(inputSelector) : inputSelector;
    
  if (!input || input.type !== 'file') {
    throw new Error('Invalid file input element');
  }
  
  const validateOnChange = () => {
    if (!input.files || input.files.length === 0) {
      return { isValid: true, errors: [], results: [] };
    }
    
    const result = validator.validateFiles(input.files);
    
    // Add custom validity to the input element
    if (!result.isValid && options.showErrors) {
      input.setCustomValidity(result.errors[0].message);
    } else {
      input.setCustomValidity('');
    }
    
    // Trigger custom event
    const event = new CustomEvent('file-validation', {
      detail: { ...result }
    });
    input.dispatchEvent(event);
    
    return result;
  };
  
  input.addEventListener('change', validateOnChange);
  
  // Return a method to manually validate
  return {
    validate: validateOnChange,
    element: input
  };
}

// Export the validator class and utility functions
export { 
  FileValidator, 
  FileTypeValidators, 
  createFileInputValidator 
};