// Globals
let mediaRecorder = null;
let recordedChunks = [];
let recordingStream = null;
let startTime = null;
let timerInterval = null;

// DOM Elements
const recordingTimeElement = document.getElementById('recordingTime');
const stopRecordingButton = document.getElementById('stopRecording');

// Initialize recording
document.addEventListener('DOMContentLoaded', function() {
  console.log('Recorder page loaded');
  
  // Set up button listener
  stopRecordingButton.addEventListener('click', stopRecording);
  
  // Start recording on page load
  startRecording();
  
  // Set up timer
  startTimer();
  
  // Set maximum recording time (5 minutes)
  setTimeout(function() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Maximum recording time reached');
      stopRecording();
    }
  }, 300000); // 5 minutes
  
  // Handle tab close
  window.addEventListener('beforeunload', function(e) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      stopRecording();
      // Chrome requires returnValue to be set
      e.returnValue = 'Recording in progress. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
  
  // Handle messages from the popup
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'stopRecording') {
      console.log('Received stop recording message from popup');
      stopRecording();
      sendResponse({ success: true });
      return true;
    }
  });
});

// Start video recording
function startRecording() {
  console.log('Initializing recording');
  
  // Get current timestamp for later use
  startTime = Date.now();
  
  // Request screen sharing
  navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always',
      displaySurface: 'browser'
    },
    audio: true
  })
  .then(function(stream) {
    console.log('Screen capture stream obtained');
    
    // Store the stream
    recordingStream = stream;
    recordedChunks = [];
    
    // Listen for the stream being stopped by user (browser UI)
    stream.getVideoTracks()[0].onended = function() {
      console.log('User stopped sharing screen');
      stopRecording();
    };
    
    // Setup MediaRecorder
    try {
      const options = { mimeType: 'video/webm; codecs=vp9' };
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      try {
        // Fallback for unsupported codec
        const options = { mimeType: 'video/webm' };
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        try {
          // Last resort fallback
          mediaRecorder = new MediaRecorder(stream);
        } catch (e) {
          console.error('MediaRecorder error:', e);
          handleRecordingError('MediaRecorder not supported in this browser');
          return;
        }
      }
    }
    
    // Handle data available event
    mediaRecorder.ondataavailable = function(event) {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    // Handle recording stop
    mediaRecorder.onstop = function() {
      console.log('MediaRecorder stopped, processing chunks');
      processRecording();
    };
    
    // Handle recording error
    mediaRecorder.onerror = function(event) {
      console.error('MediaRecorder error:', event.error);
      handleRecordingError(event.error.message || 'Recording error occurred');
    };
    
    // Start recording - collect data every second
    mediaRecorder.start(1000);
    console.log('MediaRecorder started', mediaRecorder.state);
  })
  .catch(function(error) {
    console.error('Error getting screen capture stream:', error);
    handleRecordingError(error.message || 'Failed to start screen capture');
  });
}

// Stop recording
function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state !== 'recording') {
    console.log('No active recording to stop');
    return;
  }
  
  console.log('Stopping recording');
  stopRecordingButton.disabled = true;
  stopRecordingButton.textContent = 'Processing...';
  
  // Stop the timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Stop the media recorder
  mediaRecorder.stop();
}

// Process and save recording
function processRecording() {
  try {
    // Create a blob from the recorded chunks
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    
    // Generate filename based on current date/time
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const filename = 'recording_' + timestamp + '.webm';
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    
    // Use Chrome downloads API to save the file
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    }, function(downloadId) {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        handleRecordingError(chrome.runtime.lastError.message);
      } else {
        console.log('Recording downloaded successfully with ID:', downloadId);
        
        // Clean up
        if (recordingStream) {
          recordingStream.getTracks().forEach(track => track.stop());
        }
        
        // Notify the popup that recording is complete
        chrome.runtime.sendMessage({
          action: 'recordingComplete',
          downloadId: downloadId
        });
        
        // Update storage
        chrome.storage.local.set({
          'isRecording': false,
          'recordingTabId': null
        });
        
        // Close this tab after a short delay
        setTimeout(function() {
          window.close();
        }, 1000);
      }
    });
  } catch (e) {
    console.error('Error processing recording:', e);
    handleRecordingError(e.message);
  }
}

// Handle recording errors
function handleRecordingError(errorMessage) {
  console.error('Recording error:', errorMessage);
  
  // Clean up resources
  if (recordingStream) {
    recordingStream.getTracks().forEach(track => track.stop());
  }
  
  // Update storage
  chrome.storage.local.set({
    'isRecording': false,
    'recordingTabId': null
  });
  
  // Notify the popup of the error
  chrome.runtime.sendMessage({
    action: 'recordingError',
    error: errorMessage
  });
  
  // Show error on this page
  const statusElement = document.querySelector('.status');
  if (statusElement) {
    statusElement.innerHTML = '<span style="color: #ea4335;">❌ Recording Error: ' + errorMessage + '</span>';
  }
  
  // Update button
  if (stopRecordingButton) {
    stopRecordingButton.textContent = 'Close Tab';
    stopRecordingButton.disabled = false;
    stopRecordingButton.onclick = function() {
      window.close();
    };
  }
}

// Timer function
function startTimer() {
  let seconds = 0;
  let minutes = 0;
  
  timerInterval = setInterval(function() {
    seconds++;
    if (seconds >= 60) {
      minutes++;
      seconds = 0;
    }
    
    // Format time as MM:SS
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    recordingTimeElement.textContent = formattedMinutes + ':' + formattedSeconds;
    
    // Check for max recording time warning
    if (minutes === 4 && seconds === 45) {
      const statusElement = document.querySelector('.status');
      if (statusElement) {
        statusElement.innerHTML += '<br><span style="color: #f59e0b;">⚠️ Recording will automatically stop in 15 seconds</span>';
      }
    }
  }, 1000);
}