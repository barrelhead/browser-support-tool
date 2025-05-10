/**
 * PDF Export module for PDF Tools
 * Handles creating and saving modified PDFs
 */

import { elements, showNotification } from './core.js';
import { getPdfState } from './pdf-viewer.js';
import { getSignaturePositions } from './signature-placement.js';

/**
 * Initialize the PDF export functionality
 */
export function initializePdfExport() {
  if (elements.savePdfButton) {
    elements.savePdfButton.addEventListener('click', saveModifiedPdf);
  }
}

/**
 * Save the modified PDF with signatures
 */
async function saveModifiedPdf() {
  const { pdfDoc, currentPdfArrayBuffer } = getPdfState();

  if (!pdfDoc || !currentPdfArrayBuffer) {
    showNotification('No PDF to save', 'error');
    return;
  }

  try {
    // Disable the save button to prevent multiple clicks
    if (elements.savePdfButton) {
      elements.savePdfButton.disabled = true;
    }

    showNotification('Processing PDF...', 'success');

    // Get signature positions
    const signaturePositions = getSignaturePositions();

    // Check if we have any signatures placed
    let hasSignatures = false;
    for (const page in signaturePositions) {
      if (signaturePositions[page] && signaturePositions[page].length > 0) {
        hasSignatures = true;
        break;
      }
    }

    if (!hasSignatures) {
      showNotification('No signatures added to document', 'error');
      if (elements.savePdfButton) {
        elements.savePdfButton.disabled = false;
      }
      return;
    }

    // Load the PDF in pdf-lib
    const PDFLib = window.PDFLib;
    if (!PDFLib) {
      throw new Error('PDF-lib library not loaded');
    }

    const pdfLibDoc = await PDFLib.PDFDocument.load(currentPdfArrayBuffer, { ignoreEncryption: true });

    // Process each page that has signatures
    for (const pageIndex in signaturePositions) {
      if (signaturePositions[pageIndex] && signaturePositions[pageIndex].length > 0) {
        // Get the current page (subtract 1 because pdf-lib is 0-indexed)
        const pageIdx = parseInt(pageIndex) - 1;
        const page = pdfLibDoc.getPage(pageIdx);

        // Get page dimensions
        const { width, height } = page.getSize();

        // Process each signature on this page
        for (const pos of signaturePositions[pageIndex]) {
          // Skip if signature is missing
          if (!pos || !pos.signature) continue;

          // Embed the signature image
          const signatureImg = pos.signature.image;

          // Extract base64 data from data URL
          const base64Data = signatureImg.split(';base64,').pop();

          // Determine if PNG or JPEG based on data URL
          let embeddedImage;
          if (signatureImg.includes('image/png')) {
            embeddedImage = await pdfLibDoc.embedPng(base64Data);
          } else {
            embeddedImage = await pdfLibDoc.embedJpg(base64Data);
          }

          // Calculate the proper position
          // We need to transform from screen coordinates to PDF coordinates
          const pdfViewer = elements.pdfViewer;
          const canvas = pdfViewer.querySelector('canvas');

          if (!canvas) {
            throw new Error('Canvas not found in PDF viewer');
          }

          // Calculate scaling factor between screen and PDF
          const scaleX = width / canvas.width;
          const scaleY = height / canvas.height;

          // Get image dimensions (use stored width/height if available)
          const imgDim = {
            width: (pos.width || embeddedImage.width * 0.5) * scaleX,
            height: (pos.height || embeddedImage.height * 0.5) * scaleY
          };

          // Convert to PDF coordinates (PDF origin is bottom-left)
          const pdfX = pos.x * scaleX;
          const pdfY = height - ((pos.y * scaleY) + imgDim.height); // Flip Y-axis

          // Create timestamp for this signature
          const signDate = new Date(pos.timestamp || Date.now());
          const timestampText = 'Signed: ' + signDate.toLocaleString();

          // Draw the image on the page
          page.drawImage(embeddedImage, {
            x: pdfX,
            y: pdfY,
            width: imgDim.width,
            height: imgDim.height,
            rotate: PDFLib.degrees(pos.rotation || 0),
            xSkew: PDFLib.degrees(0),
            ySkew: PDFLib.degrees(0),
          });

          // Draw timestamp below signature
          page.drawText(timestampText, {
            x: pdfX,
            y: pdfY - 12, // Position just below the signature
            size: 8,
            color: PDFLib.rgb(0.4, 0.4, 0.4), // Gray color
          });
        }
      }
    }

    // Serialize the PDF
    const pdfBytes = await pdfLibDoc.save();

    // Create a blob from the PDF data
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Create a download URL
    const url = URL.createObjectURL(blob);

    // Generate filename based on original or use a timestamp
    let fileName = 'signed_document_' + new Date().toISOString().replace(/[:.]/g, '-') + '.pdf';

    // Try to get the original filename from the upload
    if (elements.pdfUploadInput && elements.pdfUploadInput.files.length > 0) {
      const originalName = elements.pdfUploadInput.files[0].name;
      // Insert '_signed' before the extension
      fileName = originalName.replace(/\.pdf$/i, '_signed.pdf');
      if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName += '.pdf';
      }
    }

    // Use Chrome API to download
    chrome.downloads.download({
      url: url,
      filename: fileName,
      saveAs: true
    }, function(downloadId) {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        showNotification('Error saving PDF: ' + chrome.runtime.lastError.message, 'error');
      } else {
        console.log('PDF saved successfully with ID:', downloadId);
        showNotification('PDF saved successfully!', 'success');
      }

      // Re-enable save button
      if (elements.savePdfButton) {
        elements.savePdfButton.disabled = false;
      }
    });
  } catch (error) {
    console.error('Error saving PDF:', error);
    showNotification('Error saving PDF: ' + error.message, 'error');

    // Re-enable save button
    if (elements.savePdfButton) {
      elements.savePdfButton.disabled = false;
    }
  }
}
