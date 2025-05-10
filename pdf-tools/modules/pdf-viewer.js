/**
 * PDF Viewer module for PDF Tools
 * Handles PDF loading, rendering, and navigation
 */

import { elements, showNotification } from './core.js';
import { restoreSignaturesOnPage } from './signature-placement.js';

// PDF document reference
let pdfDoc = null;
let pageNum = 1;
let pageCount = 0;
let currentPdfArrayBuffer = null;
let pdfjsLib = null;

/**
 * Initialize the PDF.js library
 */
export function initializePdfViewer() {
  console.log('Setting up PDF.js');
  
  try {
    pdfjsLib = window.pdfjsLib;
    
    if (pdfjsLib) {
      console.log('PDF.js library found in window.pdfjsLib');
      if (!pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions = {};
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc = '../libs/pdf.worker.min.js';
    } else {
      console.error('PDF.js library not found in window.pdfjsLib');
    }
  } catch (error) {
    console.error('Error initializing PDF.js:', error);
  }
  
  // Listen for PDF clear events
  document.addEventListener('pdf-cleared', onPdfCleared);
}

/**
 * Handle PDF cleared event
 */
function onPdfCleared() {
  pdfDoc = null;
  pageNum = 1;
  pageCount = 0;
  currentPdfArrayBuffer = null;
}

/**
 * Load PDF from ArrayBuffer
 * @param {ArrayBuffer} arrayBuffer - PDF file content
 */
export function loadPdfFromArrayBuffer(arrayBuffer) {
  if (!pdfjsLib) {
    showNotification('PDF.js library not loaded properly', 'error');
    return;
  }
  
  // Store the PDF array buffer for later use
  currentPdfArrayBuffer = arrayBuffer;
  
  // Load the PDF document
  pdfjsLib.getDocument({data: arrayBuffer}).promise.then(function(pdf) {
    pdfDoc = pdf;
    pageCount = pdf.numPages;
    pageNum = 1;
    
    updatePageInfo();
    renderPage(pageNum);
    
    // Enable buttons
    if (elements.prevPageButton && elements.nextPageButton) {
      elements.prevPageButton.disabled = pageNum <= 1;
      elements.nextPageButton.disabled = pageNum >= pageCount;
    }
    
    if (elements.savePdfButton) {
      elements.savePdfButton.disabled = true; // Enable after a signature is applied
    }
    
    if (elements.clearPdfButton) {
      elements.clearPdfButton.disabled = false;
    }
    
    // Display a hint about dragging signatures
    showNotification('Drag & drop signatures onto the document', 'success');
    
    // Notify other modules that PDF has been loaded
    const pdfLoadedEvent = new CustomEvent('pdf-loaded', {
      detail: { pageCount, currentPdfArrayBuffer }
    });
    document.dispatchEvent(pdfLoadedEvent);
    
    showNotification('PDF loaded successfully', 'success');
  }).catch(function(error) {
    console.error('Error loading PDF:', error);
    showNotification('Error loading PDF: ' + error.message, 'error');
  });
}

/**
 * Render a specific page of the PDF
 * @param {number} num - Page number to render
 */
export function renderPage(num) {
  if (!pdfDoc || !elements.pdfViewer) return;
  
  // Notify that page rendering is starting
  const pageChangeEvent = new CustomEvent('page-changing', {
    detail: { oldPageNum: pageNum, newPageNum: num }
  });
  document.dispatchEvent(pageChangeEvent);
  
  // Update current page number
  pageNum = num;
  
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({scale: 1.0});
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match page
    const scale = elements.pdfViewer.clientWidth / viewport.width;
    const scaledViewport = page.getViewport({scale: scale});
    
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    
    // Clear previous content
    elements.pdfViewer.innerHTML = '';
    elements.pdfViewer.appendChild(canvas);
    
    // Render PDF page
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    };
    
    page.render(renderContext).promise.then(function() {
      // Notify that page rendering is complete
      const pageRenderedEvent = new CustomEvent('page-rendered', {
        detail: { pageNum, pageCount, canvas }
      });
      document.dispatchEvent(pageRenderedEvent);
      
      // Restore signatures for this page
      restoreSignaturesOnPage(pageNum);
    });
  }).catch(function(error) {
    console.error('Error rendering page:', error);
    showNotification('Error rendering page: ' + error.message, 'error');
  });
}

/**
 * Update page info display
 */
export function updatePageInfo() {
  if (elements.pageInfo) {
    elements.pageInfo.textContent = `Page ${pageNum} of ${pageCount}`;
  }
}

/**
 * Show previous page
 */
export function showPrevPage() {
  if (pageNum <= 1 || !pdfDoc) return;
  
  renderPage(pageNum - 1);
  updatePageInfo();
  
  if (elements.prevPageButton && elements.nextPageButton) {
    elements.prevPageButton.disabled = pageNum <= 1;
    elements.nextPageButton.disabled = pageNum >= pageCount;
  }
}

/**
 * Show next page
 */
export function showNextPage() {
  if (pageNum >= pageCount || !pdfDoc) return;
  
  renderPage(pageNum + 1);
  updatePageInfo();
  
  if (elements.prevPageButton && elements.nextPageButton) {
    elements.prevPageButton.disabled = pageNum <= 1;
    elements.nextPageButton.disabled = pageNum >= pageCount;
  }
}

/**
 * Get the current PDF state
 * @return {Object} Current PDF state
 */
export function getPdfState() {
  return {
    pdfDoc,
    pageNum,
    pageCount,
    currentPdfArrayBuffer
  };
}
