/**
 * Signature Canvas module for PDF Tools
 * Handles drawing and creating signatures
 */

import { elements, showNotification } from './core.js';
import { saveSignature } from './signature-manager.js';

// Fabric.js canvas for signature pad
let canvas = null;

/**
 * Initialize the signature canvas
 */
export function initializeSignatureCanvas() {
  setupSignatureCanvas();
  setupTabs();
  checkForSavedSignatures();
}

/**
 * Check if there are saved signatures and switch to Saved tab if any exist
 */
function checkForSavedSignatures() {
  chrome.storage.local.get({signatures: []}, function(result) {
    const signatures = result.signatures;
    
    if (signatures && signatures.length > 0) {
      // Switch to saved signatures tab if signatures exist
      switchTab('saved');
    }
  });
}

/**
 * Set up the signature drawing canvas with Fabric.js
 */
function setupSignatureCanvas() {
  try {
    console.log('Setting up signature canvas');
    
    if (!window.fabric) {
      console.error('Fabric.js library not loaded');
      showNotification('Error: Fabric.js library not loaded', 'error');
      return;
    }
    
    if (!elements.signaturePad) {
      console.error('Signature pad element not found');
      showNotification('Error: Signature pad element not found', 'error');
      return;
    }
    
    // Create canvas with error handling
    setTimeout(function() {
      try {
        canvas = new fabric.Canvas(elements.signaturePad);
        console.log('Canvas created:', canvas);
        
        if (canvas) {
          canvas.setWidth(300);
          canvas.setHeight(150);
          canvas.setBackgroundColor('#f5f5f5');
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.width = 2;
          canvas.freeDrawingBrush.color = '#000000';
          canvas.renderAll();
        }
      } catch (canvasError) {
        console.error('Error creating canvas:', canvasError);
        showNotification('Error creating signature canvas: ' + canvasError.message, 'error');
      }
    }, 500); // Short delay to ensure DOM is fully processed
  } catch (error) {
    console.error('Error in setupSignatureCanvas:', error);
    showNotification('Error setting up signature canvas: ' + error.message, 'error');
  }
}

/**
 * Set up signature tab switching
 */
function setupTabs() {
  if (!elements.tabButtons || !elements.tabContents) return;
  
  elements.tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

/**
 * Switch between signature tabs (draw, type, saved)
 * @param {string} tabId - ID of the tab to switch to
 */
export function switchTab(tabId) {
  // Update tab buttons
  elements.tabButtons.forEach(button => {
    if (button.getAttribute('data-tab') === tabId) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Update tab content
  elements.tabContents.forEach(content => {
    if (content.id === tabId + '-tab') {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });
}

/**
 * Check if the canvas has any signature content
 * @return {boolean} True if signature exists
 */
export function hasSignatureContent() {
  return canvas && canvas.getObjects().length > 0;
}

/**
 * Clear the signature canvas
 */
export function clearSignatureCanvas() {
  if (canvas) {
    canvas.clear();
    canvas.setBackgroundColor('#f5f5f5');
    canvas.renderAll();
  }
}

/**
 * Save the drawn signature
 */
export function saveDrawnSignature() {
  if (!canvas) {
    showNotification('Canvas not initialized', 'error');
    return;
  }
  
  if (!hasSignatureContent()) {
    showNotification('Please draw a signature first', 'error');
    return;
  }
  
  // Remove background for transparent signature
  const originalBg = canvas.backgroundColor;
  canvas.backgroundColor = 'rgba(0,0,0,0)';
  canvas.renderAll();
  
  const signatureImage = canvas.toDataURL('image/png');
  const signatureData = {
    type: 'drawn',
    image: signatureImage,
    created: new Date().toISOString()
  };
  
  // Restore background
  canvas.backgroundColor = originalBg;
  canvas.renderAll();
  
  // Save the signature
  saveSignature(signatureData);
}

/**
 * Save the typed signature
 */
export function saveTypedSignature() {
  const text = elements.typedSignatureInput.value.trim();
  if (!text) {
    showNotification('Please type a signature first', 'error');
    return;
  }
  
  const font = elements.fontSelect.value;
  
  // Create a temporary canvas to render the typed signature
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 300;
  tempCanvas.height = 100;
  const ctx = tempCanvas.getContext('2d');
  
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  ctx.font = `30px ${font}`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);
  
  const signatureImage = tempCanvas.toDataURL('image/png');
  const signatureData = {
    type: 'typed',
    text: text,
    font: font,
    image: signatureImage,
    created: new Date().toISOString()
  };
  
  // Save the signature
  saveSignature(signatureData);
}

/**
 * Get the canvas instance
 * @return {Object} Fabric.js canvas instance
 */
export function getCanvas() {
  return canvas;
}
