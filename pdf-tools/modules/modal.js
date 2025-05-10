/**
 * Modal module for PDF Tools
 * Handles onboarding modals for PDF Sign and PDF Merge tools
 */

import { showNotification } from './core.js';

// DOM Elements
const modalContainer = document.getElementById('modal-container');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalCloseBtn = document.getElementById('modal-close');
const modalPrimaryBtn = document.getElementById('modal-primary-btn');
const doNotShowAgainCheckbox = document.getElementById('do-not-show-again');

/**
 * Initialize the modal functionality
 */
export function initializeModals() {
  if (!modalContainer || !modalTitle || !modalContent) {
    console.error('Modal elements not found');
    return;
  }
  
  // Add event listeners for modal controls
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', function() {
      hideModal();
    });
  }
  
  // Close modal when clicking outside
  modalContainer.addEventListener('click', function(e) {
    if (e.target === modalContainer) {
      hideModal();
    }
  });
  
  // Add Escape key support for closing the modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modalContainer.classList.contains('hidden')) {
      hideModal();
    }
  });
  
  // Check URL parameters to see which tool to show
  const urlParams = new URLSearchParams(window.location.search);
  const toolType = urlParams.get('tool') || 'sign';
  
  // Show the appropriate onboarding modal based on tool type
  if (toolType === 'sign') {
    // Check if user has chosen not to see the sign modal
    chrome.storage.local.get(['hidePdfSignModal'], function(prefs) {
      if (!prefs.hidePdfSignModal) {
        showSignModal();
      }
    });
  } else if (toolType === 'merge') {
    // Check if user has chosen not to see the merge modal
    chrome.storage.local.get(['hidePdfMergeModal'], function(prefs) {
      if (!prefs.hidePdfMergeModal) {
        showMergeModal();
      }
    });
  }
}

/**
 * Show the PDF Sign tool onboarding modal
 */
export function showSignModal() {
  modalTitle.textContent = 'PDF Signing Guide';
  
  modalContent.innerHTML = `
    <p>This tool helps you add signatures to PDF documents in just a few simple steps.</p>
    
    <div class="step">
      <div class="step-number">1</div>
      <div class="step-content">
        <h3>Upload Your Document</h3>
        <p>Click "Select PDF" to choose the PDF file you want to sign.</p>
      </div>
    </div>
    
    <div class="step">
      <div class="step-number">2</div>
      <div class="step-content">
        <h3>Create or Select a Signature</h3>
        <p>Use the drawing tool to create a signature, type your name, or select a previously saved signature.</p>
      </div>
    </div>
    
    <div class="step">
      <div class="step-number">3</div>
      <div class="step-content">
        <h3>Place Your Signature</h3>
        <p>Drag your signature onto the document. You can resize, rotate, and position it as needed.</p>
      </div>
    </div>
    
    <div class="step">
      <div class="step-number">4</div>
      <div class="step-content">
        <h3>Save Your Document</h3>
        <p>When finished, click "Save Document" to download your signed PDF.</p>
      </div>
    </div>
    
    <div class="step">
      <div class="step-number">5</div>
      <div class="step-content">
        <h3>Additional Features</h3>
        <p>Browse multiple pages with the navigation buttons. Add multiple signatures if needed.</p>
      </div>
    </div>
  `;
  
  modalPrimaryBtn.textContent = 'Get Started';
  modalPrimaryBtn.onclick = function() {
    hideModal('sign');
  };
  
  showModal();
}

/**
 * Show the PDF Merge tool onboarding modal
 */
export function showMergeModal() {
  modalTitle.textContent = 'PDF Merging Guide';
  
  modalContent.innerHTML = `
    <p>This tool allows you to combine multiple PDF files into a single document.</p>
    
    <div class="step">
      <div class="step-number">1</div>
      <div class="step-content">
        <h3>Select PDF Files</h3>
        <p>Click "Select PDFs to merge" to choose multiple PDF files from your computer.</p>
      </div>
    </div>
    
    <div class="step">
      <div class="step-number">2</div>
      <div class="step-content">
        <h3>Arrange Your Files</h3>
        <p>Drag and drop files to change their order, or use the arrow buttons to move files up and down in the list.</p>
      </div>
    </div>
    
    <div class="step">
      <div class="step-number">3</div>
      <div class="step-content">
        <h3>Remove Unwanted Files</h3>
        <p>Click the "X" button to remove any files you don't want to include in the merged document.</p>
      </div>
    </div>
    
    <div class="step">
      <div class="step-number">4</div>
      <div class="step-content">
        <h3>Merge and Download</h3>
        <p>Click "Merge PDFs" to combine all files in the specified order and download the result.</p>
      </div>
    </div>
    
    <div class="step">
      <div class="step-number">5</div>
      <div class="step-content">
        <h3>Get Your Merged File</h3>
        <p>Save the combined PDF to your computer when prompted.</p>
      </div>
    </div>
  `;
  
  modalPrimaryBtn.textContent = 'Get Started';
  modalPrimaryBtn.onclick = function() {
    hideModal('merge');
  };
  
  showModal();
}

/**
 * Show the modal
 */
function showModal() {
  if (modalContainer) {
    modalContainer.classList.remove('hidden');
  }
}

/**
 * Hide the modal and store user preference
 * @param {string} modalType - Type of modal being closed ('sign' or 'merge')
 */
function hideModal(modalType) {
  if (modalContainer) {
    modalContainer.classList.add('hidden');
  }
  
  // Check if "do not show again" was selected
  if (doNotShowAgainCheckbox && doNotShowAgainCheckbox.checked) {
    if (modalType === 'sign') {
      chrome.storage.local.set({ 'hidePdfSignModal': true });
      console.log('User chose to hide PDF Sign modal in future');
    } else if (modalType === 'merge') {
      chrome.storage.local.set({ 'hidePdfMergeModal': true });
      console.log('User chose to hide PDF Merge modal in future');
    }
  }
  
  // Reset checkbox
  if (doNotShowAgainCheckbox) {
    doNotShowAgainCheckbox.checked = false;
  }
}
