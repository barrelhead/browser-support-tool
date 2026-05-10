/**
 * PDF Upload module for PDF Tools
 * Handles PDF file selection and loading
 */

import { elements, showNotification, clearLoadedPdf } from './core.js';
import { loadPdfFromArrayBuffer } from './pdf-viewer.js';

/**
 * Initialize the PDF upload functionality
 */
export function initializePdfUpload() {
  console.log('Initializing PDF upload module');
  console.log('Upload button element:', elements.uploadButton);
  console.log('PDF upload input element:', elements.pdfUploadInput);
  setupUploadEventListeners();
}

/**
 * Setup event listeners for PDF upload
 */
function setupUploadEventListeners() {
  console.log('Setting up PDF upload event listeners');
  
  // Try direct DOM access if cached elements are not available
  const uploadButton = elements.uploadButton || document.getElementById('upload-button');
  const pdfUploadInput = elements.pdfUploadInput || document.getElementById('pdf-upload');
  const clearPdfButton = elements.clearPdfButton || document.getElementById('clear-pdf-button');
  
  console.log('Direct DOM access:', { uploadButton, pdfUploadInput });
  
  // PDF upload and clearing
  if (uploadButton && pdfUploadInput) {
    console.log('Adding upload button click handler');
    
    uploadButton.addEventListener('click', function() {
      console.log('Upload button clicked');
      pdfUploadInput.click();
    });
    
    pdfUploadInput.addEventListener('change', function(e) {
      console.log('File input change event triggered', e);
      if (e.target.files.length === 0) {
        console.log('No files selected');
        return;
      }
      
      let file = e.target.files[0];
      console.log('File selected:', file);
      
      if (file.type !== 'application/pdf') {
        showNotification('Please select a PDF file', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(event) {
        console.log('File read complete');
        const arrayBuffer = event.target.result;
        loadPdfFromArrayBuffer(arrayBuffer);
        
        // Enable the clear PDF button
        if (clearPdfButton) {
          clearPdfButton.disabled = false;
        }
      };
      
      reader.onerror = function(fileError) {
        console.error('Error reading file:', fileError);
        showNotification('Error reading file: ' + fileError, 'error');
      };
      
      console.log('Starting file read as ArrayBuffer');
      reader.readAsArrayBuffer(file);
    });
  } else {
    console.error('Upload button or PDF input not found', elements.uploadButton, elements.pdfUploadInput);
  }
  
  // Add event listener for clear PDF button
  if (clearPdfButton) {
    clearPdfButton.addEventListener('click', clearLoadedPdf);
  }
}
