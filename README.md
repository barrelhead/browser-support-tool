# Browser Support Tool

A Chrome extension designed to assist with troubleshooting and debugging web applications by providing a simple interface for common support tasks.

## Version 1.0

## Features

### 1. Clear Browser Data
- Clear cookies, cache, localStorage, and browsing history
- Select time range (last hour, day, week, month, or all time)
- Choose which types of data to clear
- Get instant feedback on success/failure

### 2. Network Capture (HAR Files)
- Record all network activity in the current tab
- Save as industry-standard HAR (HTTP Archive) files
- Includes all requests, responses, headers, and timing information
- Timestamped filenames for easy organization

### 3. Screen Capture
- **Screenshots**: Instantly capture the visible area of the current tab
- **Video Recording** (NEW): Record up to 5 minutes of screen activity
  - Includes audio capture
  - Saves in WebM format for high quality with reasonable file size
  - Timestamped filenames

## How to Use

### Clear Browser Data
1. Select which data types to clear (cookies, cache, localStorage, history)
2. Choose a time range from the dropdown
3. Click "Clear Data"

### Network Capture
1. Navigate to the tab you want to capture
2. Click "Start" to begin recording network activity
3. Perform the actions you want to capture
4. Click "Stop & Download" to save the HAR file
   - Note: HAR Capture is tab-specific. If you navigate away, you need to return to the same tab to stop the capture.

### Screen Capture
- **For Screenshots**:
  1. Navigate to the tab you want to capture
  2. Click "Take Screenshot"
  3. Save the PNG file when prompted

- **For Video Recording**:
  1. Navigate to the tab where you want to begin recording
  2. Click "Record Video"
  3. Select which screen/window/tab to share when prompted
  4. Navigate freely during recording
  5. Click "Stop Recording" when finished (recording automatically stops after 5 minutes)
  6. Save the WebM file when prompted

## Technical Considerations

- You can only have 1 HAR capture happening at a time
- HAR Capture is tab-specific (if you start it in tab A, and go to tab B, you need to go back to A to stop and save)
- Video recordings are limited to 5 minutes to maintain reasonable file sizes
- The extension requires specific Chrome permissions:
  - cookies, browsingData, storage, debugger, tabs, activeTab, downloads

## Installation

### Developer Mode (for testing)
1. Download or clone the extension files
2. Open Chrome and navigate to chrome://extensions/
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The Browser Support Tool icon should appear in your toolbar

### From Chrome Web Store (for deployment)
_(coming soon) _

## Troubleshooting

- If HAR capture fails, try refreshing the page and starting again
- If video recording doesn't start, check if you denied screen sharing permissions
- Clear browser data options require at least one checkbox to be selected
- If the extension seems unresponsive, try reloading the extension from chrome://extensions/# browser-support-tool
Simple Chrome extension with modern UI to assist end users with clearing cookies and cache, save screenshots, take screen recordings and capture HAR files for troubleshooting.
