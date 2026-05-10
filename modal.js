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
  modalTitle.textContent = 'How to Sign a PDF';

  modalContent.innerHTML = `
    <p>Add your signature to any PDF in four quick steps — no printing or scanning needed.</p>

    <div class="step">
      <div class="step-number" style="background:var(--purple);color:var(--purple-fg)">1</div>
      <div class="step-content">
        <h3>Open your document</h3>
        <p>Click <strong>Select PDF</strong> and pick the file you need to sign from your computer.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number" style="background:var(--purple);color:var(--purple-fg)">2</div>
      <div class="step-content">
        <h3>Create your signature</h3>
        <p>Draw it with your mouse, type your name, or pick one you've saved before — whichever is easiest for you.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number" style="background:var(--purple);color:var(--purple-fg)">3</div>
      <div class="step-content">
        <h3>Place it on the page</h3>
        <p>Drag your signature to where it needs to go. You can move it, make it bigger or smaller, or rotate it to fit.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number" style="background:var(--purple);color:var(--purple-fg)">4</div>
      <div class="step-content">
        <h3>Save and you're done</h3>
        <p>Click <strong>Save Document</strong> to download your signed PDF, ready to send.</p>
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
  modalTitle.textContent = 'How to Merge PDFs';

  modalContent.innerHTML = `
    <p>Combine multiple PDFs into one file — great for sending everything in a single attachment.</p>

    <div class="step">
      <div class="step-number" style="background:var(--magenta);color:var(--magenta-fg)">1</div>
      <div class="step-content">
        <h3>Add your files</h3>
        <p>Click <strong>Select PDFs to merge</strong> and choose all the files you want to combine. You can pick several at once.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number" style="background:var(--magenta);color:var(--magenta-fg)">2</div>
      <div class="step-content">
        <h3>Put them in order</h3>
        <p>Drag files up or down to set the order they'll appear in the final document. The top file becomes page 1.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number" style="background:var(--magenta);color:var(--magenta-fg)">3</div>
      <div class="step-content">
        <h3>Remove anything you don't need</h3>
        <p>Changed your mind about a file? Click the <strong>×</strong> next to it to take it out of the list.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number" style="background:var(--magenta);color:var(--magenta-fg)">4</div>
      <div class="step-content">
        <h3>Merge and download</h3>
        <p>Click <strong>Merge PDFs</strong> and your combined file will download automatically — ready to use.</p>
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
