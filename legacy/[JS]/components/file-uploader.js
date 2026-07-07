/**
 * File Uploader Component
 * Drag-and-drop file uploader with validation and progress tracking
 * Compatible with jazer-brand.css styling
 */

class FileUploader {
  /**
   * Creates a new file uploader component
   * @param {HTMLElement} uploaderElement - The uploader container element
   * @param {Object} options - Configuration options
   */
  constructor(uploaderElement, options = {}) {
    this.uploader = uploaderElement;
    this.options = {
      maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
      allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
      maxFiles: 5,
      multiple: true,
      showPreview: true,
      previewSize: 100, // pixels
      autoUpload: false,
      uploadUrl: null,
      withCredentials: false,
      headers: {},
      fieldName: 'file',
      ...options
    };

    this.files = [];
    this.isDragging = false;
    this.uploadQueue = [];
    this.currentUploads = new Map();

    this.init();
  }

  /**
   * Initializes the file uploader
   */
  init() {
    // Set up the uploader structure
    this.setupUploader();

    // Bind events
    this.bindEvents();

    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Sets up the uploader structure
   */
  setupUploader() {
    // Add uploader classes
    this.uploader.classList.add('file-uploader');
    
    // Create upload area
    this.uploadArea = document.createElement('div');
    this.uploadArea.classList.add('upload-area');
    this.uploadArea.innerHTML = `
      <div class="upload-area-content">
        <div class="upload-icon">📁</div>
        <div class="upload-text">Drag & drop files here or click to browse</div>
        <div class="upload-hint">Supports: ${this.options.allowedTypes.join(', ')}</div>
        <div class="upload-size-hint">Max file size: ${(this.options.maxFileSize / (1024 * 1024)).toFixed(1)}MB</div>
      </div>
    `;
    
    // Create file input (hidden)
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.multiple = this.options.multiple;
    this.fileInput.accept = this.options.allowedTypes.join(',');
    this.fileInput.style.display = 'none';
    
    // Create files container
    this.filesContainer = document.createElement('div');
    this.filesContainer.classList.add('files-container');
    this.filesContainer.style.display = 'none';
    
    // Create upload button if auto-upload is disabled
    if (!this.options.autoUpload && this.options.uploadUrl) {
      this.uploadButton = document.createElement('button');
      this.uploadButton.classList.add('upload-all-button', 'btn');
      this.uploadButton.textContent = 'Upload All Files';
      this.uploadButton.style.display = 'none';
    }
    
    // Add elements to uploader
    this.uploader.appendChild(this.uploadArea);
    this.uploader.appendChild(this.fileInput);
    this.uploader.appendChild(this.filesContainer);
    
    if (this.uploadButton) {
      this.uploader.appendChild(this.uploadButton);
    }
  }

  /**
   * Binds event listeners for the uploader
   */
  bindEvents() {
    // Click on upload area - triggers file input
    this.uploadArea.addEventListener('click', () => {
      this.fileInput.click();
    });

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag and drop events
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('drag-over');
      this.isDragging = true;
    });

    this.uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('drag-over');
      this.isDragging = false;
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('drag-over');
      this.isDragging = false;
      this.handleFiles(e.dataTransfer.files);
    });

    // Upload all button click
    if (this.uploadButton) {
      this.uploadButton.addEventListener('click', () => {
        this.uploadAllFiles();
      });
    }
  }

  /**
   * Handles selected files
   * @param {FileList} fileList - List of selected files
   */
  handleFiles(fileList) {
    const filesArray = Array.from(fileList);
    
    // Validate files
    const validFiles = filesArray.filter(file => this.validateFile(file));
    
    // Check if adding these files exceeds max count
    if (this.files.length + validFiles.length > this.options.maxFiles) {
      const remainingSlots = this.options.maxFiles - this.files.length;
      validFiles.splice(remainingSlots);
      
      if (validFiles.length < filesArray.length) {
        this.showNotification(`Maximum ${this.options.maxFiles} files allowed. Only added ${validFiles.length} more.`, 'warning');
      }
    }
    
    // Add valid files to the list
    validFiles.forEach(file => {
      this.addFile(file);
    });
    
    // Show notification if some files were rejected
    const rejectedFiles = filesArray.length - validFiles.length;
    if (rejectedFiles > 0) {
      this.showNotification(`Rejected ${rejectedFiles} file(s) due to validation errors.`, 'warning');
    }
  }

  /**
   * Validates a file against options
   * @param {File} file - File to validate
   * @returns {boolean} True if file is valid
   */
  validateFile(file) {
    // Check file size
    if (file.size > this.options.maxFileSize) {
      return false;
    }
    
    // Check file type
    if (this.options.allowedTypes.length > 0) {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      return this.options.allowedTypes.some(allowedType => {
        if (allowedType.startsWith('image/')) {
          return fileType.startsWith('image/');
        } else if (allowedType.startsWith('application/')) {
          return fileType.startsWith('application/');
        } else if (allowedType.startsWith('.')) {
          // Handle extension-based check
          return fileName.endsWith(allowedType);
        } else if (allowedType === '*') {
          return true;
        }
        return fileType === allowedType;
      });
    }
    
    return true;
  }

  /**
   * Adds a file to the list
   * @param {File} file - File to add
   */
  addFile(file) {
    // Create file object with status
    const fileObj = {
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      element: null
    };
    
    // Add to files array
    this.files.push(fileObj);
    
    // Create file element
    fileObj.element = this.createFileElement(fileObj);
    
    // Add to container
    this.filesContainer.appendChild(fileObj.element);
    this.filesContainer.style.display = 'block';
    
    // Show upload button if auto-upload is disabled and there's a URL
    if (!this.options.autoUpload && this.options.uploadUrl && this.files.length > 0) {
      this.uploadButton.style.display = 'block';
    }
    
    // Auto-upload if enabled
    if (this.options.autoUpload && this.options.uploadUrl) {
      this.uploadFile(fileObj);
    }
  }

  /**
   * Creates a file element for the UI
   * @param {Object} fileObj - File object
   * @returns {HTMLElement} File element
   */
  createFileElement(fileObj) {
    const fileElement = document.createElement('div');
    fileElement.classList.add('file-item');
    fileElement.setAttribute('data-file-id', fileObj.id);
    
    // Format file size
    const sizeStr = this.formatFileSize(fileObj.size);
    
    // Create file preview if allowed
    let previewHtml = '';
    if (this.options.showPreview) {
      if (fileObj.type.startsWith('image/')) {
        // Create image preview
        previewHtml = `<div class="file-preview"><img src="${URL.createObjectURL(fileObj.file)}" alt="${fileObj.name}" style="max-width: ${this.options.previewSize}px; max-height: ${this.options.previewSize}px;"></div>`;
      } else {
        // Create icon for non-image files
        previewHtml = `<div class="file-preview file-icon">📄</div>`;
      }
    }
    
    fileElement.innerHTML = `
      ${previewHtml}
      <div class="file-info">
        <div class="file-name" title="${fileObj.name}">${fileObj.name}</div>
        <div class="file-meta">${sizeStr}</div>
        <div class="file-status">Waiting</div>
      </div>
      <div class="file-actions">
        <button class="remove-file-btn" aria-label="Remove file">&times;</button>
      </div>
      <div class="file-progress" style="display: none;">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="progress-text">0%</div>
      </div>
    `;
    
    // Add event listener to remove button
    const removeBtn = fileElement.querySelector('.remove-file-btn');
    removeBtn.addEventListener('click', () => {
      this.removeFile(fileObj.id);
    });
    
    return fileElement;
  }

  /**
   * Removes a file from the list
   * @param {string|number} fileId - ID of the file to remove
   */
  removeFile(fileId) {
    const fileIndex = this.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;
    
    const fileObj = this.files[fileIndex];
    
    // If the file is currently uploading, cancel the upload
    if (fileObj.status === 'uploading' && this.currentUploads.has(fileId)) {
      const xhr = this.currentUploads.get(fileId);
      xhr.abort();
      this.currentUploads.delete(fileId);
    }
    
    // Remove from array
    this.files.splice(fileIndex, 1);
    
    // Remove from UI
    if (fileObj.element && fileObj.element.parentNode) {
      fileObj.element.parentNode.removeChild(fileObj.element);
    }
    
    // Hide files container if no files left
    if (this.files.length === 0) {
      this.filesContainer.style.display = 'none';
    }
    
    // Hide upload button if no files left
    if (this.uploadButton && this.files.length === 0) {
      this.uploadButton.style.display = 'none';
    }
    
    // Dispatch event
    this.uploader.dispatchEvent(new CustomEvent('fileRemoved', {
      detail: { file: fileObj }
    }));
  }

  /**
   * Uploads a single file
   * @param {Object} fileObj - File object to upload
   */
  async uploadFile(fileObj) {
    if (!this.options.uploadUrl) {
      console.error('No upload URL specified');
      return;
    }
    
    // Update status
    fileObj.status = 'uploading';
    this.updateFileDisplay(fileObj);
    
    // Create FormData
    const formData = new FormData();
    formData.append(this.options.fieldName, fileObj.file, fileObj.name);
    
    // Create XMLHttpRequest
    const xhr = new XMLHttpRequest();
    this.currentUploads.set(fileObj.id, xhr);
    
    // Setup progress tracking
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        fileObj.progress = percentComplete;
        this.updateFileDisplay(fileObj);
      }
    });
    
    // Handle response
    xhr.addEventListener('load', () => {
      this.currentUploads.delete(fileObj.id);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        // Success
        fileObj.status = 'success';
        fileObj.response = xhr.response;
        this.updateFileDisplay(fileObj);
        
        // Dispatch success event
        this.uploader.dispatchEvent(new CustomEvent('fileUploadSuccess', {
          detail: { file: fileObj, response: xhr.response }
        }));
      } else {
        // Error
        fileObj.status = 'error';
        fileObj.error = xhr.statusText || 'Upload failed';
        this.updateFileDisplay(fileObj);
        
        // Dispatch error event
        this.uploader.dispatchEvent(new CustomEvent('fileUploadError', {
          detail: { file: fileObj, error: xhr.statusText }
        }));
      }
    });
    
    // Handle errors
    xhr.addEventListener('error', () => {
      this.currentUploads.delete(fileObj.id);
      fileObj.status = 'error';
      fileObj.error = 'Network error';
      this.updateFileDisplay(fileObj);
      
      // Dispatch error event
      this.uploader.dispatchEvent(new CustomEvent('fileUploadError', {
        detail: { file: fileObj, error: 'Network error' }
      }));
    });
    
    // Handle abort
    xhr.addEventListener('abort', () => {
      this.currentUploads.delete(fileObj.id);
      fileObj.status = 'cancelled';
      this.updateFileDisplay(fileObj);
      
      // Dispatch cancel event
      this.uploader.dispatchEvent(new CustomEvent('fileUploadCancelled', {
        detail: { file: fileObj }
      }));
    });
    
    // Open and send request
    xhr.open('POST', this.options.uploadUrl);
    
    // Set headers
    Object.keys(this.options.headers).forEach(key => {
      xhr.setRequestHeader(key, this.options.headers[key]);
    });
    
    if (this.options.withCredentials) {
      xhr.withCredentials = true;
    }
    
    xhr.send(formData);
  }

  /**
   * Uploads all pending files
   */
  uploadAllFiles() {
    if (this.files.length === 0) {
      this.showNotification('No files to upload', 'info');
      return;
    }
    
    // Filter files that aren't already uploading, successful or failed
    const pendingFiles = this.files.filter(f => f.status === 'pending' || f.status === 'error');
    
    if (pendingFiles.length === 0) {
      this.showNotification('All files have been processed', 'info');
      return;
    }
    
    pendingFiles.forEach(fileObj => {
      if (fileObj.status === 'pending' || fileObj.status === 'error') {
        // Reset error status for retry
        if (fileObj.status === 'error') {
          fileObj.status = 'pending';
        }
        this.uploadFile(fileObj);
      }
    });
  }

  /**
   * Updates the display of a file
   * @param {Object} fileObj - File object to update
   */
  updateFileDisplay(fileObj) {
    if (!fileObj.element) return;
    
    // Update status text
    const statusElement = fileObj.element.querySelector('.file-status');
    const progressContainer = fileObj.element.querySelector('.file-progress');
    const progressFill = fileObj.element.querySelector('.progress-fill');
    const progressText = fileObj.element.querySelector('.progress-text');
    
    switch (fileObj.status) {
      case 'pending':
        statusElement.textContent = 'Waiting';
        statusElement.className = 'file-status status-pending';
        progressContainer.style.display = 'none';
        break;
      case 'uploading':
        statusElement.textContent = 'Uploading...';
        statusElement.className = 'file-status status-uploading';
        progressContainer.style.display = 'flex';
        progressFill.style.width = `${fileObj.progress}%`;
        progressText.textContent = `${Math.round(fileObj.progress)}%`;
        break;
      case 'success':
        statusElement.textContent = 'Complete';
        statusElement.className = 'file-status status-success';
        progressContainer.style.display = 'none';
        break;
      case 'error':
        statusElement.textContent = fileObj.error || 'Error';
        statusElement.className = 'file-status status-error';
        progressContainer.style.display = 'none';
        break;
      case 'cancelled':
        statusElement.textContent = 'Cancelled';
        statusElement.className = 'file-status status-cancelled';
        progressContainer.style.display = 'none';
        break;
    }
  }

  /**
   * Formats file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Shows a notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, warning, error)
   */
  showNotification(message, type) {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.className = `file-uploader-notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      z-index: 10000;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
    `;
    
    // Set background based on type
    switch (type) {
      case 'success':
        notification.style.background = '#28a745';
        break;
      case 'warning':
        notification.style.background = '#ffc107';
        break;
      case 'error':
        notification.style.background = '#dc3545';
        break;
      default:
        notification.style.background = '#007bff';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Gets all uploaded files
   * @returns {Array} Array of file objects
   */
  getFiles() {
    return [...this.files];
  }

  /**
   * Gets files by status
   * @param {string} status - Status to filter by
   * @returns {Array} Array of file objects with the specified status
   */
  getFilesByStatus(status) {
    return this.files.filter(f => f.status === status);
  }

  /**
   * Cancels an upload
   * @param {string|number} fileId - ID of the file to cancel
   */
  cancelUpload(fileId) {
    const fileObj = this.files.find(f => f.id === fileId);
    if (fileObj && fileObj.status === 'uploading' && this.currentUploads.has(fileId)) {
      const xhr = this.currentUploads.get(fileId);
      xhr.abort();
    }
  }

  /**
   * Cancels all uploads
   */
  cancelAllUploads() {
    this.currentUploads.forEach(xhr => {
      xhr.abort();
    });
  }

  /**
   * Clears all files
   */
  clearAllFiles() {
    this.cancelAllUploads();
    this.files.forEach(fileObj => {
      if (fileObj.element && fileObj.element.parentNode) {
        fileObj.element.parentNode.removeChild(fileObj.element);
      }
    });
    this.files = [];
    this.filesContainer.style.display = 'none';
    if (this.uploadButton) {
      this.uploadButton.style.display = 'none';
    }
  }

  /**
   * Adds dynamic styles for the uploader
   */
  addDynamicStyles() {
    if (document.getElementById('file-uploader-styles')) return;

    const style = document.createElement('style');
    style.id = 'file-uploader-styles';
    style.textContent = `
      .file-uploader {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
      }
      
      .upload-area {
        border: 2px dashed var(--border-default, #4facfe);
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: var(--bg-darker, #111);
      }
      
      .upload-area:hover, .upload-area.drag-over {
        border-color: var(--jazer-cyan, #00f2ea);
        background: var(--bg-darkest, #0a0a0a);
      }
      
      .upload-area-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .upload-icon {
        font-size: 3rem;
        margin-bottom: 15px;
      }
      
      .upload-text {
        font-size: 1.2rem;
        margin-bottom: 10px;
        color: var(--text-light, #fff);
      }
      
      .upload-hint, .upload-size-hint {
        font-size: 0.9rem;
        color: var(--text-gray, #aaa);
        margin-bottom: 5px;
      }
      
      .files-container {
        margin-top: 20px;
      }
      
      .file-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border: 1px solid var(--border-lighter, #222);
        border-radius: 6px;
        margin-bottom: 10px;
        background: var(--bg-darker, #111);
      }
      
      .file-preview {
        margin-right: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .file-icon {
        font-size: 2rem;
      }
      
      .file-info {
        flex: 1;
      }
      
      .file-name {
        font-weight: bold;
        margin-bottom: 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .file-meta {
        font-size: 0.9rem;
        color: var(--text-gray, #aaa);
        margin-bottom: 5px;
      }
      
      .file-status {
        font-size: 0.9rem;
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
      }
      
      .status-pending { background: #6c757d; }
      .status-uploading { background: #007bff; }
      .status-success { background: #28a745; }
      .status-error { background: #dc3545; }
      .status-cancelled { background: #6c757d; }
      
      .file-actions {
        margin-left: 10px;
      }
      
      .remove-file-btn {
        background: none;
        border: 1px solid var(--border-default, #4facfe);
        color: var(--text-light, #fff);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
      }
      
      .file-progress {
        margin-top: 10px;
        width: 100%;
        display: flex;
        align-items: center;
      }
      
      .progress-bar {
        flex: 1;
        height: 10px;
        background: var(--bg-darkest, #0a0a0a);
        border-radius: 5px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background: var(--jazer-cyan, #00f2ea);
        transition: width 0.3s ease;
      }
      
      .progress-text {
        margin-left: 10px;
        font-size: 0.9rem;
        color: var(--text-gray, #aaa);
        min-width: 40px;
      }
      
      .upload-all-button {
        display: block;
        margin: 20px auto 0;
        padding: 12px 30px;
      }
      
      .file-uploader-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Destroys the uploader and cleans up
   */
  destroy() {
    // Cancel all uploads
    this.cancelAllUploads();
    
    // Remove event listeners would normally be done here
    // For simplicity in this implementation, we'll just remove the element
    
    if (this.uploader.parentNode) {
      this.uploader.parentNode.removeChild(this.uploader);
    }
  }
}

/**
 * Initializes all file uploaders on the page
 * @param {HTMLElement|Document} container - Container to search for uploaders
 * @returns {Array<FileUploader>} Array of initialized uploader instances
 */
function initFileUploaders(container = document) {
  const uploaders = container.querySelectorAll('.file-uploader, [data-uploader]');
  const instances = [];

  uploaders.forEach(uploader => {
    if (!uploader.hasAttribute('data-uploader-initialized')) {
      uploader.setAttribute('data-uploader-initialized', 'true');

      // Get options from data attributes
      const options = {
        maxFileSize: parseInt(uploader.dataset.maxFileSize) || 10 * 1024 * 1024,
        allowedTypes: (uploader.dataset.allowedTypes || 'image/*,application/pdf,.doc,.docx,.txt').split(','),
        maxFiles: parseInt(uploader.dataset.maxFiles) || 5,
        multiple: uploader.dataset.multiple !== 'false',
        showPreview: uploader.dataset.showPreview !== 'false',
        previewSize: parseInt(uploader.dataset.previewSize) || 100,
        autoUpload: uploader.dataset.autoUpload === 'true',
        uploadUrl: uploader.dataset.uploadUrl || null,
        withCredentials: uploader.dataset.withCredentials === 'true',
        headers: uploader.dataset.headers ? JSON.parse(uploader.dataset.headers) : {},
        fieldName: uploader.dataset.fieldName || 'file'
      };

      const instance = new FileUploader(uploader, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize file uploaders when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initFileUploaders();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FileUploader, initFileUploaders };
}

// Also make it available globally
window.FileUploader = FileUploader;
window.initFileUploaders = initFileUploaders;