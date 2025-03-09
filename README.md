# browser-support-tool
Simple Chrome extension with a recognizable UI to assist end users with clearing cookies and cache, save screenshots and capture HAR files for troubleshooting
# Browser Support Tool

A Chrome extension that provides essential troubleshooting tools for web applications. This tool helps users and support teams diagnose browser-related issues quickly and efficiently.

## Features

### 1. Clear Browser Data
Easily clear various types of browser data with customizable time ranges:
- Cookies
- Cache
- Local Storage
- History

### 2. Network Capture
Capture and download network activity in HAR (HTTP Archive) format:
- Start and stop network recording
- Compatible with standard HAR analyzers
- Helps diagnose API calls, requests, and responses

### 3. Screenshot Capture
Take screenshots of the current page:
- One-click screenshot capture
- Automatic download with timestamp
- Perfect for documenting errors or issues

## Installation

### From Source (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your toolbar

### From Chrome Web Store
*Coming Soon*

## How to Use

### Clearing Browser Data
1. Select the types of data you want to clear (Cookies, Cache, etc.)
2. Choose a time range (Last hour, Last day, Last month, etc.)
3. Click "Clear Data"
4. You'll see a confirmation message when the data is cleared

### Capturing Network Activity
1. Navigate to the page you want to analyze
2. Click the extension icon to open the popup
3. Click "Start" to begin recording network activity
4. Perform the actions you want to analyze
5. Click "Stop & Download" to save the HAR file
6. The HAR file can be analyzed with tools like:
   - [Google's HAR Analyzer](https://toolbox.googleapps.com/apps/har_analyzer/)
   - [HAR Viewer](https://www.softwareishard.com/har/viewer/)

### Taking Screenshots
1. Navigate to the page you want to capture
2. Click the extension icon
3. Click "Take Screenshot"
4. The screenshot will automatically download with a timestamp in the filename

## Use Cases

- **For Support Teams**: Quickly gather diagnostic information from users
- **For Developers**: Debug network issues and reproduce errors
- **For QA Testing**: Document bugs with screenshots and network data
- **For End Users**: Clear browser data without navigating through complex settings

## Browser Compatibility

- Chrome 88+
- Edge (Chromium-based) 88+

## Privacy

This extension does not collect or transmit any user data. All operations are performed locally within the browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
