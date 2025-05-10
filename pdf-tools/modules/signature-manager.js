/**
 * Signature Manager module for PDF Tools
 * Handles storage and management of signatures
 */

import { elements, showNotification } from './core.js';
import { addSignatureToPdfPreview } from './signature-placement.js';

// Selected signature reference
let selectedSignature = null;

/**
 * Initialize the signature manager
 */
export function initializeSignatureManager() {
  loadSavedSignatures();
}

/**
 * Save a new signature to storage
 * @param {Object} signatureData - Signature data to save
 */
export function saveSignature(signatureData) {
  // Store signature in chrome.storage.local
  chrome.storage.local.get({signatures: []}, function(result) {
    const signatures = result.signatures;
    signatures.push(signatureData);
    
    chrome.storage.local.set({signatures: signatures}, function() {
      showNotification('Signature saved successfully', 'success');
      loadSavedSignatures(); // Refresh the saved signatures display
    });
  });
}

/**
 * Load saved signatures from storage and display them
 */
export function loadSavedSignatures() {
  if (!elements.savedSignaturesContainer) {
    console.error('Saved signatures container not found');
    return;
  }
  
  chrome.storage.local.get({signatures: []}, function(result) {
    const signatures = result.signatures;
    
    if (signatures.length === 0) {
      elements.savedSignaturesContainer.innerHTML = '<p>No saved signatures yet.</p>';
      return;
    }
    
    elements.savedSignaturesContainer.innerHTML = '';
    
    signatures.forEach((signature, index) => {
      const signatureItem = document.createElement('div');
      signatureItem.className = 'signature-item';
      
      const signatureImg = document.createElement('img');
      signatureImg.src = signature.image;
      signatureImg.alt = 'Signature ' + (index + 1);
      signatureImg.className = 'signature-img';
      signatureImg.draggable = true;
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-signature';
      deleteButton.innerHTML = '&times;';
      deleteButton.title = 'Delete signature';
      
      signatureItem.appendChild(signatureImg);
      signatureItem.appendChild(deleteButton);
      elements.savedSignaturesContainer.appendChild(signatureItem);
      
      // Add event listeners for signature selection
      signatureImg.addEventListener('click', function() {
        document.querySelectorAll('.signature-img').forEach(img => {
          img.classList.remove('selected');
        });
        
        signatureImg.classList.add('selected');
        selectedSignature = signature;
        
        // Display a hint if PDF is loaded
        const pdfViewerExists = !!document.getElementById('pdf-viewer') && 
                               document.getElementById('pdf-viewer').childElementCount > 0;
        if (pdfViewerExists) {
          showNotification('Drag signature onto document', 'success');
        }
      });
      
      // Add event listener for signature deletion
      deleteButton.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteSignature(index);
      });
      
      // Improved drag and drop capability
      signatureImg.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', index.toString());
        selectedSignature = signature;
        // Add a ghost image for better drag feedback
        const ghostImg = new Image();
        ghostImg.src = signature.image;
        if (e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(ghostImg, 20, 20);
        }
      });
    });
  });
  
  // Add enhanced drop handling to PDF viewer
  setupDropZone();
}

/**
 * Setup the drop zone for signatures on the PDF viewer
 */
function setupDropZone() {
  const pdfViewer = document.getElementById('pdf-viewer');
  if (!pdfViewer) return;
  
  pdfViewer.addEventListener('dragover', function(e) {
    e.preventDefault();
    // Add visual indication that dropping is allowed
    e.dataTransfer.dropEffect = 'copy';
  });
  
  pdfViewer.addEventListener('drop', function(e) {
    e.preventDefault();
    
    if (selectedSignature) {
      const rect = pdfViewer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Add signature to the current page
      addSignatureToPdfPreview(selectedSignature, x, y);
    }
  });
}

/**
 * Delete a signature from storage
 * @param {number} index - Index of the signature to delete
 */
export function deleteSignature(index) {
  chrome.storage.local.get({signatures: []}, function(result) {
    const signatures = result.signatures;
    
    if (index >= 0 && index < signatures.length) {
      signatures.splice(index, 1);
      
      chrome.storage.local.set({signatures: signatures}, function() {
        showNotification('Signature deleted', 'success');
        loadSavedSignatures();
        
        if (selectedSignature && signatures.length === 0) {
          selectedSignature = null;
        }
      });
    }
  });
}

/**
 * Get the currently selected signature
 * @return {Object} Selected signature data or null
 */
export function getSelectedSignature() {
  return selectedSignature;
}

/**
 * Set the selected signature
 * @param {Object} signature - Signature data to select
 */
export function setSelectedSignature(signature) {
  selectedSignature = signature;
}
