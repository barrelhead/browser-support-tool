/**
 * PDF Merge module for PDF Tools
 * Handles merging multiple PDF files
 */

import { elements, showNotification, formatFileSize, readFileAsArrayBuffer } from './core.js';

// PDF files for merging
let pdfFilesForMerge = [];

/**
 * Initialize the PDF merge functionality
 */
export function initializePdfMerge() {
  setupMergeEventListeners();

  // Show helper notification
  showNotification('Select multiple PDF files to merge them into one document', 'success');
}

/**
 * Set up event listeners for the PDF merge tool
 */
function setupMergeEventListeners() {
  if (!elements.mergeUploadButton || !elements.mergeUploadInput || !elements.mergePdfsButton) {
    console.error('Merge tool elements not found');
    return;
  }

  elements.mergeUploadButton.addEventListener('click', function() {
    console.log('Merge upload button clicked');
    elements.mergeUploadInput.click();
  });

  elements.mergeUploadInput.addEventListener('change', function(e) {
    console.log('Merge file input change event triggered', e);
    if (e.target.files.length === 0) {
      console.log('No files selected');
      return;
    }

    const files = Array.from(e.target.files);
    console.log(`${files.length} files selected`);

    // Check if all files are PDFs
    const nonPdfFiles = files.filter(file => file.type !== 'application/pdf');
    if (nonPdfFiles.length > 0) {
      showNotification(`${nonPdfFiles.length} non-PDF files were excluded`, 'error');
    }

    // Add only PDF files to the list
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length === 0) {
      showNotification('Please select PDF files', 'error');
      return;
    }

    // Add files to the array
    pdfFilesForMerge = [...pdfFilesForMerge, ...pdfFiles];

    // Update the UI
    updatePdfList();

    // Enable merge button if we have at least 2 PDFs
    if (elements.mergePdfsButton) {
      elements.mergePdfsButton.disabled = pdfFilesForMerge.length < 2;
    }

    showNotification(`${pdfFiles.length} PDF files added`, 'success');
  });

  elements.mergePdfsButton.addEventListener('click', mergePdfFiles);

  // Setup drag and drop for list reordering
  if (elements.pdfList) {
    elements.pdfList.addEventListener('dragover', function(e) {
      e.preventDefault();
    });

    elements.pdfList.addEventListener('drop', function(e) {
      e.preventDefault();
    });
  }
}

/**
 * Update the PDF list in the UI
 */
function updatePdfList() {
  if (!elements.pdfList) return;

  // Clear the current list
  elements.pdfList.innerHTML = '';

  if (pdfFilesForMerge.length === 0) {
    elements.pdfList.innerHTML = '<div class="empty-list-message">No PDFs selected yet</div>';
    return;
  }

  // Add each file to the list
  pdfFilesForMerge.forEach((file, index) => {
    const listItem = createPdfListItem(file, index);
    elements.pdfList.appendChild(listItem);
  });

  // Setup drag and drop for each item
  setupDragAndDropForListItems();
}

/**
 * Create a list item for a PDF file
 * @param {File} file - PDF file
 * @param {number} index - Index in the files array
 * @return {HTMLElement} List item element
 */
function createPdfListItem(file, index) {
  const listItem = document.createElement('div');
  listItem.className = 'pdf-list-item';
  listItem.draggable = true;
  listItem.dataset.index = index;

  // Format file size
  const fileSize = formatFileSize(file.size);

  listItem.innerHTML = `
    <div class="pdf-item-info">
      <div class="pdf-item-icon">📄</div>
      <div>
        <div class="pdf-item-name">${file.name}</div>
        <div class="pdf-item-size">${fileSize}</div>
      </div>
    </div>
    <div class="pdf-item-controls">
      <button class="pdf-control-button pdf-move-up" title="Move Up">▲</button>
      <button class="pdf-control-button pdf-move-down" title="Move Down">▼</button>
      <button class="pdf-control-button pdf-delete-button" title="Remove">✕</button>
    </div>
  `;

  // Add event listeners for buttons
  const moveUpButton = listItem.querySelector('.pdf-move-up');
  const moveDownButton = listItem.querySelector('.pdf-move-down');
  const deleteButton = listItem.querySelector('.pdf-delete-button');

  if (moveUpButton) {
    moveUpButton.addEventListener('click', function() {
      movePdfFile(index, 'up');
    });
  }

  if (moveDownButton) {
    moveDownButton.addEventListener('click', function() {
      movePdfFile(index, 'down');
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', function() {
      removePdfFile(index);
    });
  }

  return listItem;
}

/**
 * Setup drag and drop functionality for list items
 */
function setupDragAndDropForListItems() {
  const listItems = document.querySelectorAll('.pdf-list-item');
  let draggedItem = null;

  listItems.forEach(item => {
    item.addEventListener('dragstart', function(e) {
      draggedItem = item;
      setTimeout(() => {
        item.classList.add('dragging');
      }, 0);
    });

    item.addEventListener('dragend', function() {
      item.classList.remove('dragging');
      draggedItem = null;
    });

    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (!draggedItem || draggedItem === item) return;

      const draggedIndex = parseInt(draggedItem.dataset.index);
      const targetIndex = parseInt(item.dataset.index);

      if (draggedIndex !== targetIndex) {
        const rect = item.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (e.clientY < midY && draggedIndex > targetIndex) {
          // Insert before
          item.parentNode.insertBefore(draggedItem, item);
          swapPdfFiles(draggedIndex, targetIndex);
        } else if (e.clientY >= midY && draggedIndex < targetIndex) {
          // Insert after
          item.parentNode.insertBefore(draggedItem, item.nextSibling);
          swapPdfFiles(draggedIndex, targetIndex);
        }
      }
    });
  });
}

/**
 * Move a PDF file up or down in the list
 * @param {number} index - Index of file to move
 * @param {string} direction - Direction to move ('up' or 'down')
 */
function movePdfFile(index, direction) {
  if (direction === 'up' && index > 0) {
    // Swap with the previous item
    swapPdfFiles(index, index - 1);
  } else if (direction === 'down' && index < pdfFilesForMerge.length - 1) {
    // Swap with the next item
    swapPdfFiles(index, index + 1);
  }

  // Update the UI
  updatePdfList();
}

/**
 * Swap two PDF files in the array
 * @param {number} index1 - First index
 * @param {number} index2 - Second index
 */
function swapPdfFiles(index1, index2) {
  const temp = pdfFilesForMerge[index1];
  pdfFilesForMerge[index1] = pdfFilesForMerge[index2];
  pdfFilesForMerge[index2] = temp;

  // Update indexes for all elements
  const listItems = document.querySelectorAll('.pdf-list-item');
  listItems.forEach((item, i) => {
    item.dataset.index = i;
  });
}

/**
 * Remove a PDF file from the list
 * @param {number} index - Index of file to remove
 */
function removePdfFile(index) {
  pdfFilesForMerge.splice(index, 1);

  // Update the UI
  updatePdfList();

  // Disable merge button if less than 2 PDFs
  if (elements.mergePdfsButton) {
    elements.mergePdfsButton.disabled = pdfFilesForMerge.length < 2;
  }

  showNotification('PDF removed from list', 'success');
}

/**
 * Merge the PDF files
 */
async function mergePdfFiles() {
  if (pdfFilesForMerge.length < 2) {
    showNotification('Need at least 2 PDFs to merge', 'error');
    return;
  }

  try {
    // Disable the merge button to prevent multiple clicks
    if (elements.mergePdfsButton) {
      elements.mergePdfsButton.disabled = true;
      elements.mergePdfsButton.textContent = 'Merging...';
    }

    showNotification('Merging PDF files...', 'success');

    // Load PDF-lib
    const PDFLib = window.PDFLib;
    if (!PDFLib) {
      throw new Error('PDF-lib library not loaded');
    }

    // Create a new PDF document
    const mergedPdf = await PDFLib.PDFDocument.create();

    // Process each PDF file
    for (let i = 0; i < pdfFilesForMerge.length; i++) {
      const file = pdfFilesForMerge[i];

      // Show progress
      showNotification(`Processing file ${i + 1} of ${pdfFilesForMerge.length}...`, 'success');

      // Read the file as ArrayBuffer
      const arrayBuffer = await readFileAsArrayBuffer(file);

      // Load the PDF document
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      // Get the page count
      const pageCount = pdfDoc.getPageCount();

      // Copy all pages from this PDF to the merged PDF
      const copiedPages = await mergedPdf.copyPages(pdfDoc, Array.from({length: pageCount}, (_, i) => i));

      // Add each copied page to the merged PDF
      copiedPages.forEach(page => {
        mergedPdf.addPage(page);
      });
    }

    // Serialize the merged PDF
    const mergedPdfBytes = await mergedPdf.save();

    // Create a blob from the PDF data
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });

    // Create a download URL
    const url = URL.createObjectURL(blob);

    // Generate filename based on current date/time
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const fileName = `merged_pdf_${timestamp}.pdf`;

    // Use Chrome API to download
    chrome.downloads.download({
      url: url,
      filename: fileName,
      saveAs: true
    }, function(downloadId) {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        showNotification('Error saving merged PDF: ' + chrome.runtime.lastError.message, 'error');
      } else {
        console.log('Merged PDF saved successfully with ID:', downloadId);
        showNotification('PDF files merged successfully!', 'success');
      }

      // Re-enable merge button
      if (elements.mergePdfsButton) {
        elements.mergePdfsButton.disabled = false;
        elements.mergePdfsButton.textContent = 'Merge PDFs';
      }
    });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    showNotification('Error merging PDFs: ' + error.message, 'error');

    // Re-enable merge button
    if (elements.mergePdfsButton) {
      elements.mergePdfsButton.disabled = false;
      elements.mergePdfsButton.textContent = 'Merge PDFs';
    }
  }
}

/**
 * Reset the PDF merge state
 */
export function resetPdfMerge() {
  pdfFilesForMerge = [];
  updatePdfList();

  if (elements.mergePdfsButton) {
    elements.mergePdfsButton.disabled = true;
  }
}
