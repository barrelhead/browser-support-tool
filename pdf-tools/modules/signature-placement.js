/**
 * Signature Placement module for PDF Tools
 * Handles adding and manipulating signatures on the PDF
 */

import { elements, showNotification } from './core.js';
import { getPdfState } from './pdf-viewer.js';
import { getSelectedSignature } from './signature-manager.js';

// Signature tracking variables
let signaturePositions = {}; // Store signature positions by page number
let signatureElements = {}; // Store signature DOM elements by page number
let currentSignatureId = 0; // Unique ID for each placed signature

/**
 * Initialize the signature placement functionality
 */
export function initializeSignaturePlacement() {
  // Listen for PDF cleared events
  document.addEventListener('pdf-cleared', onPdfCleared);
}

/**
 * Handle PDF cleared event
 */
function onPdfCleared() {
  signaturePositions = {};
  signatureElements = {};
  currentSignatureId = 0;
}

/**
 * Add a signature to the PDF preview
 * @param {Object} signature - Signature data to add
 * @param {number} x - X position on the page
 * @param {number} y - Y position on the page
 */
export function addSignatureToPdfPreview(signature, x, y) {
  const { pageNum } = getPdfState();
  const pdfViewer = elements.pdfViewer;
  
  if (!pdfViewer || !signature) return;
  
  const signatureId = currentSignatureId++;
  const timestamp = new Date();
  
  // Create container for signature and controls
  const signatureContainer = document.createElement('div');
  signatureContainer.className = 'signature-preview-container';
  signatureContainer.style.position = 'absolute';
  signatureContainer.style.left = x + 'px';
  signatureContainer.style.top = y + 'px';
  signatureContainer.style.zIndex = 10;
  signatureContainer.style.display = 'flex';
  signatureContainer.style.flexDirection = 'column';
  
  // Create signature element
  const signatureElement = document.createElement('img');
  signatureElement.src = signature.image;
  signatureElement.className = 'signature-preview';
  signatureElement.draggable = false;
  signatureElement.dataset.signatureId = signatureId;
  
  // Set the signature element style
  signatureElement.style.maxWidth = '150px';
  signatureElement.style.maxHeight = '80px';
  signatureElement.style.cursor = 'move';
  
  // Create timestamp element
  const timestampElement = document.createElement('div');
  timestampElement.className = 'signature-timestamp';
  timestampElement.textContent = 'Signed: ' + timestamp.toLocaleString();
  // Force timestamp to bottom position
  timestampElement.style.top = 'auto';
  timestampElement.style.bottom = '-22px';
  timestampElement.style.position = 'absolute';
  
  // Create control buttons container
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'signature-controls';
  
  // Create delete button
  const deleteButton = document.createElement('button');
  deleteButton.className = 'signature-control-btn signature-delete-btn';
  deleteButton.innerHTML = '&times;';
  deleteButton.title = 'Delete signature';
  deleteButton.addEventListener('click', function(e) {
    e.stopPropagation();
    deleteSignatureFromPdf(signatureId, pageNum);
  });
  
  // Add controls to container
  controlsContainer.appendChild(deleteButton);
  
  // Create resize handles
  const seHandle = document.createElement('div');
  seHandle.className = 'resize-handle resize-handle-se';
  
  const neHandle = document.createElement('div');
  neHandle.className = 'resize-handle resize-handle-ne';
  
  const swHandle = document.createElement('div');
  swHandle.className = 'resize-handle resize-handle-sw';
  
  const nwHandle = document.createElement('div');
  nwHandle.className = 'resize-handle resize-handle-nw';
  
  // Combine all elements - with flexbox layout, order is important
  // Add signature image first (will be at the top)
  signatureContainer.appendChild(signatureElement);
  // Add timestamp second (will be below the signature)
  signatureContainer.appendChild(timestampElement);
  // Add controls last (positioned absolutely so won't affect flow)
  signatureContainer.appendChild(controlsContainer);
  signatureContainer.appendChild(seHandle);
  signatureContainer.appendChild(neHandle);
  signatureContainer.appendChild(swHandle);
  signatureContainer.appendChild(nwHandle);
  
  // Add the signature container to the PDF viewer
  pdfViewer.appendChild(signatureContainer);
  
  // Make signature repositionable
  signatureElement.addEventListener('mousedown', startDragSignature);
  
  // Add resize functionality
  seHandle.addEventListener('mousedown', function(e) {
    startResizeSignature(e, signatureElement, 'se');
  });
  neHandle.addEventListener('mousedown', function(e) {
    startResizeSignature(e, signatureElement, 'ne');
  });
  swHandle.addEventListener('mousedown', function(e) {
    startResizeSignature(e, signatureElement, 'sw');
  });
  nwHandle.addEventListener('mousedown', function(e) {
    startResizeSignature(e, signatureElement, 'nw');
  });
  
  // Add signature position to tracking object
  if (!signaturePositions[pageNum]) {
    signaturePositions[pageNum] = [];
  }
  if (!signatureElements[pageNum]) {
    signatureElements[pageNum] = [];
  }
  
  signaturePositions[pageNum].push({
    id: signatureId,
    signature: signature,
    x: x,
    y: y,
    width: signatureElement.offsetWidth,
    height: signatureElement.offsetHeight,
    rotation: 0,
    timestamp: timestamp.toISOString()
  });
  
  signatureElements[pageNum].push(signatureContainer);
  
  // Enable the save button
  if (elements.savePdfButton) {
    elements.savePdfButton.disabled = false;
  }
  
  showNotification('Signature placed on document', 'success');
}

/**
 * Restore signatures when navigating between pages
 * @param {number} pageNumber - Page number to restore signatures for
 */
export function restoreSignaturesOnPage(pageNumber) {
  if (!signaturePositions[pageNumber] || !signaturePositions[pageNumber].length) return;
  
  const pdfViewer = elements.pdfViewer;
  if (!pdfViewer) return;
  
  // Clear existing signature elements array for this page
  signatureElements[pageNumber] = [];
  
  // Restore each signature for this page
  signaturePositions[pageNumber].forEach(pos => {
    if (!pos || !pos.signature) return;
    
    // Create container for signature and controls
    const signatureContainer = document.createElement('div');
    signatureContainer.className = 'signature-preview-container';
    signatureContainer.style.position = 'absolute';
    signatureContainer.style.left = pos.x + 'px';
    signatureContainer.style.top = pos.y + 'px';
    signatureContainer.style.zIndex = 10;
    signatureContainer.style.display = 'flex';
    signatureContainer.style.flexDirection = 'column';
    
    // Create signature element
    const signatureElement = document.createElement('img');
    signatureElement.src = pos.signature.image;
    signatureElement.className = 'signature-preview';
    signatureElement.draggable = false;
    signatureElement.dataset.signatureId = pos.id;
    
    // Set the signature element style
    if (pos.width) signatureElement.style.width = pos.width + 'px';
    if (pos.height) signatureElement.style.height = pos.height + 'px';
    if (pos.rotation) signatureElement.style.transform = `rotate(${pos.rotation}deg)`;
    signatureElement.dataset.rotation = pos.rotation || '0';
    signatureElement.style.cursor = 'move';
    
    // Create timestamp element
    const timestampElement = document.createElement('div');
    timestampElement.className = 'signature-timestamp';
    const signDate = new Date(pos.timestamp || Date.now());
    timestampElement.textContent = 'Signed: ' + signDate.toLocaleString();
    // Ensure timestamp is at the bottom of the signature
    timestampElement.style.top = 'auto';
    timestampElement.style.bottom = '-22px';
    timestampElement.style.position = 'absolute';
    
    // Create control buttons container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'signature-controls';
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'signature-control-btn signature-delete-btn';
    deleteButton.innerHTML = '&times;';
    deleteButton.title = 'Delete signature';
    deleteButton.addEventListener('click', function(e) {
      e.stopPropagation();
      deleteSignatureFromPdf(pos.id, pageNumber);
    });
    
    // Add controls to container
    controlsContainer.appendChild(deleteButton);
    
    // Create resize handles
    const seHandle = document.createElement('div');
    seHandle.className = 'resize-handle resize-handle-se';
    
    const neHandle = document.createElement('div');
    neHandle.className = 'resize-handle resize-handle-ne';
    
    const swHandle = document.createElement('div');
    swHandle.className = 'resize-handle resize-handle-sw';
    
    const nwHandle = document.createElement('div');
    nwHandle.className = 'resize-handle resize-handle-nw';
    
    // Combine all elements - with flexbox layout, order is important
    // Add signature image first (will be at the top)
    signatureContainer.appendChild(signatureElement);
    // Add timestamp second (will be below the signature)
    signatureContainer.appendChild(timestampElement);
    // Add controls last (positioned absolutely so won't affect flow)
    signatureContainer.appendChild(controlsContainer);
    signatureContainer.appendChild(seHandle);
    signatureContainer.appendChild(neHandle);
    signatureContainer.appendChild(swHandle);
    signatureContainer.appendChild(nwHandle);
    
    // Add the signature container to the PDF viewer
    pdfViewer.appendChild(signatureContainer);
    
    // Make signature repositionable
    signatureElement.addEventListener('mousedown', startDragSignature);
    
    // Add resize functionality
    seHandle.addEventListener('mousedown', function(e) {
      startResizeSignature(e, signatureElement, 'se');
    });
    neHandle.addEventListener('mousedown', function(e) {
      startResizeSignature(e, signatureElement, 'ne');
    });
    swHandle.addEventListener('mousedown', function(e) {
      startResizeSignature(e, signatureElement, 'sw');
    });
    nwHandle.addEventListener('mousedown', function(e) {
      startResizeSignature(e, signatureElement, 'nw');
    });
    
    // Store the element reference
    signatureElements[pageNumber].push(signatureContainer);
  });
}

/**
 * Delete a signature from the PDF
 * @param {number} signatureId - ID of the signature to delete
 * @param {number} pageNumber - Page number the signature is on
 */
export function deleteSignatureFromPdf(signatureId, pageNumber) {
  if (!signaturePositions[pageNumber] || !signatureElements[pageNumber]) return;
  
  // Find the signature position and element
  const posIndex = signaturePositions[pageNumber].findIndex(pos => pos.id === signatureId);
  if (posIndex === -1) return;
  
  // Remove the position from tracking
  signaturePositions[pageNumber].splice(posIndex, 1);
  
  // Find and remove the element
  const elementIndex = signatureElements[pageNumber].findIndex(elem => {
    const img = elem.querySelector('.signature-preview');
    return img && parseInt(img.dataset.signatureId) === signatureId;
  });
  
  if (elementIndex !== -1) {
    const element = signatureElements[pageNumber][elementIndex];
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    signatureElements[pageNumber].splice(elementIndex, 1);
  }
  
  // Disable save button if no signatures left
  let hasSignatures = false;
  for (const page in signaturePositions) {
    if (signaturePositions[page] && signaturePositions[page].length > 0) {
      hasSignatures = true;
      break;
    }
  }
  
  if (!hasSignatures && elements.savePdfButton) {
    elements.savePdfButton.disabled = true;
  }
  
  showNotification('Signature removed', 'success');
}

/**
 * Start dragging a signature
 * @param {Event} e - Mouse event
 */
function startDragSignature(e) {
  e.preventDefault();
  
  // Find the container (parent element)
  const element = e.target;
  const container = element.closest('.signature-preview-container');
  if (!container) return;
  
  let startX = e.clientX;
  let startY = e.clientY;
  
  function moveSignature(moveEvent) {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;
    
    const left = parseInt(container.style.left) || 0;
    const top = parseInt(container.style.top) || 0;
    
    container.style.left = (left + dx) + 'px';
    container.style.top = (top + dy) + 'px';
    
    startX = moveEvent.clientX;
    startY = moveEvent.clientY;
    
    // Update position in our tracking object
    const signatureId = parseInt(element.dataset.signatureId);
    const { pageNum } = getPdfState();
    const pageSignatures = signaturePositions[pageNum] || [];
    const sigPosition = pageSignatures.find(pos => pos.id === signatureId);
    
    if (sigPosition) {
      sigPosition.x = parseInt(container.style.left);
      sigPosition.y = parseInt(container.style.top);
    }
  }
  
  function stopDragSignature() {
    document.removeEventListener('mousemove', moveSignature);
    document.removeEventListener('mouseup', stopDragSignature);
  }
  
  document.addEventListener('mousemove', moveSignature);
  document.addEventListener('mouseup', stopDragSignature);
}

/**
 * Start resizing a signature
 * @param {Event} e - Mouse event
 * @param {HTMLElement} element - Signature element to resize
 * @param {string} corner - Corner being dragged ('se', 'sw', 'ne', 'nw')
 */
function startResizeSignature(e, element, corner) {
  e.preventDefault();
  e.stopPropagation();
  
  if (!element) {
    element = e.target.closest('.signature-preview-container').querySelector('.signature-preview');
    if (!element) return;
  }
  
  const container = element.closest('.signature-preview-container');
  if (!container) return;
  
  // Add a resizing class to indicate active resize
  container.classList.add('resizing');
  
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = element.offsetWidth;
  const startHeight = element.offsetHeight;
  const containerLeft = parseInt(container.style.left) || 0;
  const containerTop = parseInt(container.style.top) || 0;
  
  function resizeMove(moveEvent) {
    let newWidth, newHeight, newLeft = containerLeft, newTop = containerTop;
    
    // Calculate new dimensions based on corner being dragged
    switch(corner) {
      case 'se':  // Bottom-right corner
        newWidth = startWidth + (moveEvent.clientX - startX);
        newHeight = startHeight + (moveEvent.clientY - startY);
        break;
      case 'sw':  // Bottom-left corner
        newWidth = startWidth - (moveEvent.clientX - startX);
        newHeight = startHeight + (moveEvent.clientY - startY);
        newLeft = containerLeft + (moveEvent.clientX - startX);
        break;
      case 'ne':  // Top-right corner
        newWidth = startWidth + (moveEvent.clientX - startX);
        newHeight = startHeight - (moveEvent.clientY - startY);
        newTop = containerTop + (moveEvent.clientY - startY);
        break;
      case 'nw':  // Top-left corner
        newWidth = startWidth - (moveEvent.clientX - startX);
        newHeight = startHeight - (moveEvent.clientY - startY);
        newLeft = containerLeft + (moveEvent.clientX - startX);
        newTop = containerTop + (moveEvent.clientY - startY);
        break;
    }
    
    // Apply new dimensions with minimum size constraints
    if (newWidth >= 50) {
      element.style.width = newWidth + 'px';
      container.style.left = newLeft + 'px';
    }
    if (newHeight >= 25) {
      element.style.height = newHeight + 'px';
      container.style.top = newTop + 'px';
    }
    
    // Update dimensions in tracking object
    const signatureId = parseInt(element.dataset.signatureId);
    const { pageNum } = getPdfState();
    const pageSignatures = signaturePositions[pageNum] || [];
    const sigPosition = pageSignatures.find(pos => pos.id === signatureId);
    
    if (sigPosition) {
      sigPosition.width = element.offsetWidth;
      sigPosition.height = element.offsetHeight;
      sigPosition.x = parseInt(container.style.left);
      sigPosition.y = parseInt(container.style.top);
    }
  }
  
  function stopResize() {
    document.removeEventListener('mousemove', resizeMove);
    document.removeEventListener('mouseup', stopResize);
    
    // Remove resizing class
    container.classList.remove('resizing');
    
    // Notify the user
    showNotification('Signature resized', 'success');
  }
  
  document.addEventListener('mousemove', resizeMove);
  document.addEventListener('mouseup', stopResize);
}

/**
 * Get the signature positions object
 * @return {Object} Signature positions object
 */
export function getSignaturePositions() {
  return signaturePositions;
}
