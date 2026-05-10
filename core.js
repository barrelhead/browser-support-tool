/**
 * Core module for PDF Tools
 * Handles initialization, theme management, and shared utilities
 */

// DOM Elements references used across modules
export const elements = {};

// Shared state
export const state = {
  theme: 'light',
  toolType: 'sign'
};

/**
 * Initialize the PDF tools page
 */
export function initializeTools() {
  console.log('PDF Tools page initialized');
  
  // Get URL parameters to determine which tool to show
  const urlParams = new URLSearchParams(window.location.search);
  state.toolType = urlParams.get('tool') || 'sign';
  
  // Apply theme from localStorage
  applyThemeFromStorage();
  
  // Cache DOM elements for better performance
  cacheElements();
}

/**
 * Cache DOM elements for better performance and easier access
 */
export function cacheElements() {
  console.log('Caching DOM elements');
  elements.pdfUploadInput = document.getElementById('pdf-upload');
  elements.uploadButton = document.getElementById('upload-button');
  elements.clearPdfButton = document.getElementById('clear-pdf-button');
  elements.pdfContainer = document.getElementById('pdf-container');
  elements.pdfViewer = document.getElementById('pdf-viewer');
  elements.prevPageButton = document.getElementById('prev-page');
  elements.nextPageButton = document.getElementById('next-page');
  elements.pageInfo = document.getElementById('page-info');
  elements.tabButtons = document.querySelectorAll('.tab-button');
  elements.tabContents = document.querySelectorAll('.tab-content');
  elements.signaturePad = document.getElementById('signature-pad');
  elements.clearSignatureButton = document.getElementById('clear-signature');
  elements.saveSignatureButton = document.getElementById('save-signature');
  elements.typedSignatureInput = document.getElementById('typed-signature');
  elements.fontSelect = document.getElementById('font-select');
  elements.saveTypedButton = document.getElementById('save-typed');
  elements.savedSignaturesContainer = document.getElementById('saved-signatures');
  elements.savePdfButton = document.getElementById('save-pdf');
  elements.notification = document.getElementById('notification');
  elements.toolTitle = document.getElementById('tool-title');
  elements.signToolLayout = document.getElementById('sign-tool-layout');
  elements.mergeToolLayout = document.getElementById('merge-tool-layout');
  elements.mergeUploadInput = document.getElementById('merge-pdf-upload');
  elements.mergeUploadButton = document.getElementById('merge-upload-button');
  elements.mergePdfsButton = document.getElementById('merge-pdfs');
  elements.pdfList = document.getElementById('pdf-list');
  
  // Log the cached elements to help debug
  console.log('Cached upload button:', elements.uploadButton);
  console.log('Cached PDF upload input:', elements.pdfUploadInput);
  
  // Check if important elements are found
  if (!elements.uploadButton || !elements.pdfUploadInput) {
    console.error('Critical UI elements not found!');
  }
}

/**
 * Apply theme from localStorage
 */
export function applyThemeFromStorage() {
  const theme = localStorage.getItem('theme') || 'system';
  state.theme = theme;
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  } else if (theme === 'system') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark-theme');
    }
  }
}

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, etc.)
 */
export function showNotification(message, type) {
  if (!elements.notification) return;
  
  elements.notification.textContent = message;
  elements.notification.className = 'notification ' + type;
  elements.notification.classList.remove('hidden');
  
  setTimeout(function() {
    elements.notification.classList.add('hidden');
  }, 3000);
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @return {string} Formatted size with units
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Read a file as ArrayBuffer
 * @param {File} file - File to read
 * @return {Promise<ArrayBuffer>} Promise resolving to file content
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      resolve(event.target.result);
    };
    
    reader.onerror = function(error) {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Clear loaded PDF and reset UI
 */
export function clearLoadedPdf() {
  console.log('Clearing loaded PDF');
  
  // Signal to other modules that PDF is being cleared
  const clearEvent = new CustomEvent('pdf-cleared');
  document.dispatchEvent(clearEvent);
  
  // Reset UI
  if (elements.pdfViewer) {
    elements.pdfViewer.innerHTML = '';
  }
  
  // Reset page info
  if (elements.pageInfo) {
    elements.pageInfo.textContent = 'Page 1 of 1';
  }
  
  // Disable navigation buttons
  if (elements.prevPageButton && elements.nextPageButton) {
    elements.prevPageButton.disabled = true;
    elements.nextPageButton.disabled = true;
  }
  
  // Disable clear PDF button
  if (elements.clearPdfButton) {
    elements.clearPdfButton.disabled = true;
  }
  
  // Reset file input
  if (elements.pdfUploadInput) {
    elements.pdfUploadInput.value = '';
  }
  
  // Disable save button
  if (elements.savePdfButton) {
    elements.savePdfButton.disabled = true;
  }
  
  showNotification('PDF cleared', 'success');
}
