/**
 * Main module for PDF Tools
 * Initializes and coordinates all other modules
 */

import { initializeTools, state, elements } from './core.js';
import { initializePdfViewer, showPrevPage, showNextPage } from './pdf-viewer.js';
import { initializeSignatureCanvas, clearSignatureCanvas, saveDrawnSignature, saveTypedSignature } from './signature-canvas.js';
import { initializeSignatureManager } from './signature-manager.js';
import { initializeSignaturePlacement } from './signature-placement.js';
import { initializePdfExport } from './pdf-export.js';
import { initializePdfMerge, resetPdfMerge } from './pdf-merge.js';
import { initializePdfUpload } from './pdf-upload.js';
import { initializeModals } from './modal.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize core functionality
  initializeTools();
  
  // Initialize modules
  initializePdfViewer();
  initializePdfUpload();
  initializeSignatureCanvas();
  initializeSignatureManager();
  initializeSignaturePlacement();
  initializePdfExport();
  initializeModals();
  
  // Initialize based on tool type
  if (state.toolType === 'sign') {
    initializeSignTool();
  } else if (state.toolType === 'merge') {
    initializeMergeTool();
  }
  
  // Set up common event listeners
  setupEventListeners();
});

/**
 * Initialize the PDF signing tool
 */
function initializeSignTool() {
  console.log('Initializing PDF Sign Tool');
  
  // Update title
  if (elements.toolTitle) {
    elements.toolTitle.textContent = 'PDF Signing Tool';
  }
  
  // Show sign tool, hide merge tool
  if (elements.signToolLayout && elements.mergeToolLayout) {
    elements.signToolLayout.classList.remove('hidden');
    elements.mergeToolLayout.classList.add('hidden');
    
    // Force display property to ensure complete separation
    elements.signToolLayout.style.display = 'grid';
    elements.mergeToolLayout.style.display = 'none';
  }
}

/**
 * Initialize the PDF merge tool
 */
function initializeMergeTool() {
  console.log('Initializing PDF Merge Tool');
  
  // Update title
  if (elements.toolTitle) {
    elements.toolTitle.textContent = 'PDF Merge Tool';
  }
  
  // Show merge tool, hide sign tool
  if (elements.signToolLayout && elements.mergeToolLayout) {
    elements.signToolLayout.classList.add('hidden');
    elements.mergeToolLayout.classList.remove('hidden');
    
    // Force display property to ensure complete separation
    elements.signToolLayout.style.display = 'none';
    elements.mergeToolLayout.style.display = 'grid';
  }
  
  // Initialize PDF merge functionality
  initializePdfMerge();
}

/**
 * Set up common event listeners
 */
function setupEventListeners() {
  // PDF navigation
  if (elements.prevPageButton && elements.nextPageButton) {
    elements.prevPageButton.addEventListener('click', showPrevPage);
    elements.nextPageButton.addEventListener('click', showNextPage);
  }
  
  // Signature creation
  if (elements.clearSignatureButton) {
    elements.clearSignatureButton.addEventListener('click', clearSignatureCanvas);
  }
  
  if (elements.saveSignatureButton) {
    elements.saveSignatureButton.addEventListener('click', saveDrawnSignature);
  }
  
  if (elements.saveTypedButton) {
    elements.saveTypedButton.addEventListener('click', saveTypedSignature);
  }
}
