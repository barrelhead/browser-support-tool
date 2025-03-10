// Global variables
let capturingTabId = null;
let harLog = null;
let networkEntries = [];

// Debug logging
console.log('Background script loaded and running');

// Log when extension starts
chrome.runtime.onStartup.addListener(function() {
  console.log('Extension started');
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Background received message:', message, 'from', sender);
  
  if (message.action === 'startCapture') {
    console.log('Starting capture for tab:', message.tabId);
    startHarCapture(message.tabId, sendResponse);
    return true; // Required for async sendResponse
  } 
  else if (message.action === 'stopCapture') {
    console.log('Stopping capture for tab:', message.tabId);
    stopHarCapture(message.tabId, sendResponse);
    return true; // Required for async sendResponse
  }
  else if (message.action === 'checkCaptureStatus') {
    // Add a way to check if capture is active
    sendResponse({ 
      isCapturing: capturingTabId !== null,
      tabId: capturingTabId
    });
    return false; // Synchronous response
  }
  else if (message.action === 'captureScreenshot') {
    console.log('Background received screenshot request');
    captureScreenshot(sendResponse);
    return true; // Required for async sendResponse
  }
});

// Direct capture screenshot function
function captureScreenshot(sendResponse) {
  try {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const tab = tabs[0];
      if (!tab) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      
      chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
        if (chrome.runtime.lastError) {
          console.error('Screenshot error:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        
        // Generate filename based on current date/time
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
        const filename = 'screenshot_' + timestamp + '.png';
        
        chrome.downloads.download({
          url: dataUrl,
          filename: filename,
          saveAs: true
        }, function(downloadId) {
          if (chrome.runtime.lastError) {
            console.error('Download error:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            console.log('Screenshot downloaded successfully with ID:', downloadId);
            sendResponse({ success: true });
          }
        });
      });
    });
  } catch (e) {
    console.error('Exception in captureScreenshot:', e);
    sendResponse({ success: false, error: e.message });
  }
}

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension installed or updated');
  // Reset any existing capture state
  if (capturingTabId !== null) {
    try {
      chrome.debugger.detach({ tabId: capturingTabId });
    } catch (e) {
      console.error('Error detaching debugger on install:', e);
    }
    capturingTabId = null;
    harLog = null;
    networkEntries = [];
  }
  
  // Reset any existing recording state
  chrome.storage.local.set({
    'isRecording': false,
    'recordingTabId': null
  });
});

// Start HAR capture
function startHarCapture(tabId, sendResponse) {
  if (capturingTabId !== null) {
    sendResponse({ success: false, error: 'Capture already in progress' });
    return;
  }
  
  capturingTabId = tabId;
  networkEntries = [];
  
  // Initialize HAR log
  harLog = {
    log: {
      version: '1.2',
      creator: {
        name: 'Browser Support Tool',
        version: '1.0'
      },
      pages: [{
        startedDateTime: new Date().toISOString(),
        id: 'page_' + tabId,
        title: 'Network Capture',
        pageTimings: {
          onContentLoad: -1,
          onLoad: -1
        }
      }],
      entries: []
    }
  };
  
  // Attach debugger to the tab
  chrome.debugger.attach({ tabId: tabId }, '1.2', function() {
    if (chrome.runtime.lastError) {
      const error = chrome.runtime.lastError.message;
      capturingTabId = null;
      sendResponse({ success: false, error: error });
      return;
    }
    
    // Enable network tracking
    chrome.debugger.sendCommand({ tabId: tabId }, 'Network.enable', {}, function() {
      if (chrome.runtime.lastError) {
        const error = chrome.runtime.lastError.message;
        chrome.debugger.detach({ tabId: tabId });
        capturingTabId = null;
        sendResponse({ success: false, error: error });
        return;
      }
      
      // Set up event listeners for network events
      setupDebuggerListeners();
      sendResponse({ success: true });
    });
  });
}

// Stop HAR capture and generate file
function stopHarCapture(tabId, sendResponse) {
  console.log('Stopping HAR capture for tab:', tabId);
  
  if (capturingTabId === null || capturingTabId !== tabId) {
    console.error('No active capture for this tab. Active tab:', capturingTabId);
    sendResponse({ success: false, error: 'No active capture for this tab' });
    return;
  }
  
  console.log('Disabling Network tracking');
  // Disable network tracking
  chrome.debugger.sendCommand({ tabId: tabId }, 'Network.disable', {}, function() {
    if (chrome.runtime.lastError) {
      console.error('Error disabling network:', chrome.runtime.lastError);
    }
    
    console.log('Detaching debugger');
    // Detach debugger
    chrome.debugger.detach({ tabId: tabId }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error detaching debugger:', chrome.runtime.lastError);
      }
      
      console.log('Processing network entries, count:', networkEntries.length);
      // Process collected data and create HAR file
      harLog.log.entries = networkEntries;
      
      // Generate filename based on current date/time
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
      const filename = 'network_capture_' + timestamp + '.har';
      
      try {
        console.log('Creating HAR data');
        // Convert HAR to JSON string
        const harString = JSON.stringify(harLog, null, 2);
        
        // Use data URI instead of Blob URL
        const dataUrl = 'data:application/har+json;charset=utf-8,' + encodeURIComponent(harString);
        
        console.log('Starting download');
        chrome.downloads.download({
          url: dataUrl,
          filename: filename,
          saveAs: true
        }, function(downloadId) {
          console.log('Download started, ID:', downloadId);
          
          // Reset state
          capturingTabId = null;
          harLog = null;
          networkEntries = [];
          
          if (chrome.runtime.lastError) {
            console.error('Download error:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            console.log('Download successful');
            sendResponse({ success: true, downloadId: downloadId });
          }
        });
      } catch (error) {
        console.error('Error creating or downloading HAR:', error);
        sendResponse({ success: false, error: error.message });
      }
    });
  });
}

// Set up debugger event listeners
function setupDebuggerListeners() {
  // Network request events
  chrome.debugger.onEvent.addListener(function(debuggeeId, message, params) {
    if (debuggeeId.tabId !== capturingTabId) return;
    
    try {
      switch (message) {
        case 'Network.requestWillBeSent':
          handleNetworkRequest(params);
          break;
        case 'Network.responseReceived':
          handleNetworkResponse(params);
          break;
        case 'Network.loadingFinished':
          handleLoadingFinished(params);
          break;
        case 'Network.loadingFailed':
          handleLoadingFailed(params);
          break;
      }
    } catch (error) {
      console.error('Error processing network event:', error);
    }
  });
  
  // Handle debugger detach (e.g., if tab is closed)
  chrome.debugger.onDetach.addListener(function(debuggeeId, reason) {
    if (debuggeeId.tabId === capturingTabId) {
      capturingTabId = null;
      chrome.runtime.sendMessage({
        action: 'captureError',
        error: 'Debugger detached: ' + reason
      });
    }
  });
}

// Handle network request
function handleNetworkRequest(params) {
  console.log('Network request:', params.requestId, params.request.url);
  
  try {
    const request = {
      request: {
        method: params.request.method,
        url: params.request.url,
        httpVersion: 'HTTP/1.1', // Default value
        cookies: [],
        headers: convertHeaders(params.request.headers || {}),
        queryString: extractQueryString(params.request.url),
        headersSize: -1,
        bodySize: params.request.postData ? params.request.postData.length : 0
      },
      cache: {},
      timings: {
        send: 0,
        wait: 0,
        receive: 0
      },
      startedDateTime: new Date(params.wallTime * 1000).toISOString(),
      time: 0,
      pageref: 'page_' + capturingTabId,
      _requestId: params.requestId
    };
    
    // Add request body if available
    if (params.request.postData) {
      request.request.postData = {
        mimeType: params.request.headers ? (params.request.headers['Content-Type'] || '') : '',
        text: params.request.postData
      };
    }
    
    // Check if this request already exists (might happen with redirects)
    const existingIndex = networkEntries.findIndex(entry => entry._requestId === params.requestId);
    
    if (existingIndex >= 0) {
      // Update existing entry
      networkEntries[existingIndex] = {
        ...networkEntries[existingIndex],
        ...request
      };
      console.log('Updated existing request:', params.requestId);
    } else {
      // Add new entry
      networkEntries.push(request);
      console.log('Added new request:', params.requestId, 'Total entries:', networkEntries.length);
    }
  } catch (error) {
    console.error('Error handling network request:', error, params);
  }
}

// Handle network response
function handleNetworkResponse(params) {
  const entry = findRequestEntry(params.requestId);
  if (!entry) return;
  
  entry.response = {
    status: params.response.status,
    statusText: params.response.statusText,
    httpVersion: params.response.protocol || 'HTTP/1.1',
    cookies: [],
    headers: convertHeaders(params.response.headers),
    content: {
      size: params.response.encodedDataLength || -1,
      mimeType: params.response.mimeType || 'application/octet-stream'
    },
    redirectURL: params.response.redirectURL || '',
    headersSize: -1,
    bodySize: params.response.encodedDataLength || -1
  };
}

// Handle loading finished
function handleLoadingFinished(params) {
  const entry = findRequestEntry(params.requestId);
  if (!entry) return;
  
  entry.time = params.timestamp * 1000 - new Date(entry.startedDateTime).getTime();
  entry.timings.receive = entry.time;
}

// Handle loading failed
function handleLoadingFailed(params) {
  const entry = findRequestEntry(params.requestId);
  if (!entry) return;
  
  entry.response = entry.response || {
    status: 0,
    statusText: 'Error',
    httpVersion: 'HTTP/1.1',
    cookies: [],
    headers: [],
    content: {
      size: 0,
      mimeType: ''
    },
    redirectURL: '',
    headersSize: -1,
    bodySize: -1
  };
  
  entry._error = params.errorText;
}

// Utility: Find request entry by ID
function findRequestEntry(requestId) {
  return networkEntries.find(entry => entry._requestId === requestId);
}

// Utility: Convert headers from object to HAR format
function convertHeaders(headersObj) {
  const result = [];
  for (const name in headersObj) {
    result.push({
      name: name,
      value: headersObj[name]
    });
  }
  return result;
}

// Utility: Extract query string from URL
function extractQueryString(url) {
  try {
    const urlObj = new URL(url);
    const result = [];
    
    for (const [name, value] of urlObj.searchParams.entries()) {
      result.push({ name, value });
    }
    
    return result;
  } catch (e) {
    return [];
  }
}