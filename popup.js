document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup initialized - debug version');
  
  // DOM Elements
  const clearDataBtn = document.getElementById('clearData');
  const startCaptureBtn = document.getElementById('startCapture');
  const stopCaptureBtn = document.getElementById('stopCapture');
  const captureStatus = document.getElementById('captureStatus');
  const takeScreenshotBtn = document.getElementById('takeScreenshot');
  const notification = document.getElementById('notification');
  
  // Make screenshot button accessible in the console for debugging
  window.debugBtn = takeScreenshotBtn;
  console.log('Screenshot button added to window.debugBtn for console inspection');
  
  // Try attaching the handler in a different way
  if (takeScreenshotBtn) {
    console.log('Adding inline onclick attribute');
    takeScreenshotBtn.setAttribute('onclick', "console.log('Inline onclick triggered'); this.style.backgroundColor='red';");
  }
  
  // Define the screenshot function first
  function takeScreenshot() {
    console.log('Taking screenshot function called');
    
    // Show loading state
    takeScreenshotBtn.disabled = true;
    showNotification('Preparing screenshot...', 'success');
    
    // Send message to background script
    chrome.runtime.sendMessage({ action: 'captureScreenshot' }, function(response) {
      // Enable button again
      takeScreenshotBtn.disabled = false;
      
      console.log('Screenshot response:', response);
      
      if (response && response.success) {
        showNotification('Screenshot saved successfully!', 'success');
      } else {
        const errorMsg = response ? response.error : 'Unknown error';
        console.error('Screenshot error:', errorMsg);
        showNotification('Error: ' + errorMsg, 'error');
      }
    });
  }
  
  // Add click handlers with direct event functions instead of references
  console.log('Adding click handlers');
  
  clearDataBtn.onclick = function() {
    console.log('Clear data button clicked');
    clearBrowserData();
  };
  
  startCaptureBtn.onclick = function() {
    console.log('Start capture button clicked');
    startHarCapture();
  };
  
  stopCaptureBtn.onclick = function() {
    console.log('Stop capture button clicked');
    stopHarCapture();
  };
  
  takeScreenshotBtn.onclick = function() {
    console.log('Screenshot button clicked');
    takeScreenshot();
  };
  
  // Active tab ID
  let activeTabId = null;
  
  // Get the current active tab ID and check capture status
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    console.log('Active tabs:', tabs);
    
    if (tabs && tabs.length > 0) {
      activeTabId = tabs[0].id;
      console.log('Set active tab ID:', activeTabId);
      
      // Check if there's an ongoing capture
      chrome.runtime.sendMessage({ action: 'checkCaptureStatus' }, function(response) {
        console.log('Capture status response:', response);
        
        if (response && response.isCapturing) {
          // If capture is active for this tab, update UI
          if (response.tabId === activeTabId) {
            console.log('Capture active for current tab, updating UI');
            startCaptureBtn.disabled = true;
            stopCaptureBtn.disabled = false;
            captureStatus.classList.remove('hidden');
          } else {
            console.log('Capture active for different tab:', response.tabId);
          }
        }
      });
  
  // Screenshot functionality
  let screenshotDataUrl = null;
  
  // Take a screenshot of the current tab
  function takeScreenshot() {
    console.log('Attempting to take screenshot');
    
    // Show loading state
    takeScreenshotBtn.disabled = true;
    showNotification('Preparing screenshot...', 'success');
    
    // Send message to background script
    chrome.runtime.sendMessage({ action: 'captureScreenshot' }, function(response) {
      // Enable button again
      takeScreenshotBtn.disabled = false;
      
      console.log('Screenshot response:', response);
      
      if (response && response.success) {
        showNotification('Screenshot saved successfully!', 'success');
      } else {
        const errorMsg = response ? response.error : 'Unknown error';
        console.error('Screenshot error:', errorMsg);
        showNotification('Error: ' + errorMsg, 'error');
      }
    });
  }
  
  // Download the screenshot
  function downloadScreenshot() {
    console.log('Downloading screenshot');
    
    if (!screenshotDataUrl) {
      console.error('No screenshot data available');
      showNotification('Error: No screenshot data available.', 'error');
      return;
    }
    
    // Generate filename based on current date/time
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const filename = 'screenshot_' + timestamp + '.png';
    
    // Download the screenshot
    chrome.downloads.download({
      url: screenshotDataUrl,
      filename: filename,
      saveAs: true
    }, function(downloadId) {
      console.log('Screenshot download started, ID:', downloadId);
      
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        showNotification('Error downloading screenshot: ' + chrome.runtime.lastError.message, 'error');
      } else {
        console.log('Screenshot downloaded successfully');
        showNotification('Screenshot downloaded successfully!', 'success');
        resetScreenshotUI();
      }
    });
  }
  
  // Cancel the screenshot
  function cancelScreenshot() {
    console.log('Screenshot cancelled');
    resetScreenshotUI();
  }
  
  // Reset screenshot UI
  function resetScreenshotUI() {
    screenshotPreview.classList.add('hidden');
    screenshotDataUrl = null;
    screenshotImage.src = '';
  }
    } else {
      console.error('No active tab found');
    }
  });
  
  // Clear browser data
  function clearBrowserData() {
    console.log('Clearing browser data');
    
    // Get selected options
    const options = {
      cookies: document.getElementById('cookies').checked,
      cache: document.getElementById('cache').checked,
      localStorage: document.getElementById('localStorage').checked,
      history: document.getElementById('history').checked
    };
    
    console.log('Selected options:', options);
    
    // Get time range
    const timeRange = document.getElementById('timeRange').value;
    let since = 0;
    
    switch(timeRange) {
      case 'hour':
        since = Date.now() - (1000 * 60 * 60);
        break;
      case 'day':
        since = Date.now() - (1000 * 60 * 60 * 24);
        break;
      case 'week':
        since = Date.now() - (1000 * 60 * 60 * 24 * 7);
        break;
      case 'month':
        since = Date.now() - (1000 * 60 * 60 * 24 * 30);
        break;
      case 'all':
      default:
        since = 0;
        break;
    }
    
    console.log('Time range:', timeRange, 'Since:', new Date(since));
    
    // Create removal settings object
    const removalOptions = {
      "since": since
    };
    
    // Create data types object
    const dataTypes = {};
    
    if (options.cookies) dataTypes.cookies = true;
    if (options.cache) dataTypes.cache = true;
    if (options.localStorage) dataTypes.localStorage = true;
    if (options.history) dataTypes.history = true;
    
    // Check if any option is selected
    if (Object.keys(dataTypes).length === 0) {
      console.warn('No data types selected for clearing');
      showNotification('Please select at least one data type to clear', 'error');
      return;
    }
    
    console.log('Data types to clear:', dataTypes);
    
    // Clear data
    clearDataBtn.disabled = true;
    
    console.log('Calling chrome.browsingData.remove');
    chrome.browsingData.remove(removalOptions, dataTypes, function() {
      if (chrome.runtime.lastError) {
        console.error('Error clearing data:', chrome.runtime.lastError);
        showNotification('Error: ' + chrome.runtime.lastError.message, 'error');
      } else {
        console.log('Data cleared successfully');
        showNotification('Data cleared successfully!', 'success');
      }
      clearDataBtn.disabled = false;
    });
  }
  
  // Start HAR capture
  function startHarCapture() {
    console.log('Starting HAR capture, active tab ID:', activeTabId);
    
    if (!activeTabId) {
      console.error('No active tab found');
      showNotification('Error: No active tab found.', 'error');
      return;
    }
    
    startCaptureBtn.disabled = true;
    stopCaptureBtn.disabled = false;
    captureStatus.classList.remove('hidden');
    
    // Send message to background script to start capture
    console.log('Sending startCapture message to background');
    chrome.runtime.sendMessage({
      action: 'startCapture',
      tabId: activeTabId
    }, function(response) {
      console.log('Received startCapture response:', response);
      
      if (!response) {
        console.error('No response received from background script');
        showNotification('Error: No response from background script', 'error');
        resetCaptureUI();
        return;
      }
      
      if (!response.success) {
        console.error('Error starting capture:', response.error);
        showNotification('Error starting capture: ' + (response.error || 'Unknown error'), 'error');
        resetCaptureUI();
      } else {
        console.log('Capture started successfully');
      }
    });
  }
  
  // Stop HAR capture
  function stopHarCapture() {
    console.log('Stopping HAR capture, active tab ID:', activeTabId);
    
    if (!activeTabId) {
      console.error('No active tab found');
      showNotification('Error: No active tab found.', 'error');
      return;
    }
    
    // Send message to background script to stop capture
    console.log('Sending stopCapture message to background');
    chrome.runtime.sendMessage({
      action: 'stopCapture',
      tabId: activeTabId
    }, function(response) {
      console.log('Received stopCapture response:', response);
      resetCaptureUI();
      
      if (!response) {
        console.error('No response received from background script');
        showNotification('Error: No response from background script', 'error');
        return;
      }
      
      if (response.success) {
        console.log('HAR file downloaded successfully');
        showNotification('HAR file downloaded successfully!', 'success');
      } else {
        console.error('Error generating HAR file:', response.error);
        showNotification('Error: ' + (response.error || 'Failed to generate HAR file'), 'error');
      }
    });
  }
  
  // Reset capture UI elements
  function resetCaptureUI() {
    startCaptureBtn.disabled = false;
    stopCaptureBtn.disabled = true;
    captureStatus.classList.add('hidden');
  }
  
  // Show notification
  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = 'notification ' + type;
    
    // Auto-hide after 3 seconds
    setTimeout(function() {
      notification.classList.add('hidden');
    }, 3000);
  }
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.action === 'captureError') {
      showNotification('Error: ' + message.error, 'error');
      resetCaptureUI();
    }
  });
});