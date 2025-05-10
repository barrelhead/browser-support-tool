# Browser Support Tool

A Chrome extension designed to assist with troubleshooting and debugging web applications by providing a simple interface for common support tasks and PDF tools.

## Version 1.5

## Features

### 1. PDF Tools
- **Sign PDF**: Add signatures to PDF documents
  - Draw signatures with mouse/touch input
  - Type signatures with customizable fonts
  - Save and reuse signatures for future documents
  - Position, resize and rotate signatures on the document
  - Support for both standard and encrypted PDF documents
  - Step-by-step onboarding guide
- **Merge PDFs**: Combine multiple PDF files
  - Select multiple PDF files to merge
  - Reorder files before merging
  - Single-click merge operation
  - Support for both standard and encrypted PDF documents
  - Download the merged document with a timestamped name
  - Step-by-step onboarding guide

### 2. Support Tools (Collapsible Section)
- Expandable/collapsible interface for support-specific features
- State persistence (remembers if the section was expanded or collapsed)
- Organized interface that prioritizes frequently used tools

#### Clear Browser Data
- Clear cookies, cache, localStorage, and browsing history
- Select time range (last hour, day, week, month, or all time)
- Choose which types of data to clear
- Get instant feedback on success/failure

#### Support Bundle Capture
- Record system activity in the current tab
- Save as industry-standard diagnostic files
- Includes all requests, responses, headers, and timing information
- Timestamped filenames for easy organization
- Step-by-step guide for capturing effective support bundles

#### Screen Capture
- **Screenshots**: Instantly capture the visible area of the current tab
- **Video Recording**: Record up to 5 minutes of screen activity
  - Includes audio capture
  - Saves in WebM format for high quality with reasonable file size
  - Timestamped filenames
  - Guided workflow for effective recordings

### 3. Theme Options
- **Light Theme**: Standard light interface for bright environments
- **Dark Theme**: Eye-friendly dark interface for low-light environments
- **System Theme**: Automatically follows your operating system's theme preference
- Smooth transitions when switching between themes
- Theme preference is saved between sessions

## How to Use

### PDF Tools

#### Sign PDF
1. Click "Sign PDF" to open the PDF signing tool
2. Upload a PDF document by clicking "Select PDF"
3. Navigate through the document using the page controls
4. Add a signature using one of three methods:
   - Draw a signature using your mouse
   - Type a signature and select a font
   - Use a previously saved signature
5. Place, resize, and rotate signatures as needed
6. Click "Save Document" to download the signed PDF

#### Merge PDFs
1. Click "Merge PDFs" to open the PDF merging tool
2. Select multiple PDF files by clicking "Select PDFs to merge"
3. Reorder files by dragging or using the arrow buttons
4. Click "Merge PDFs" to combine the files
5. Save the merged PDF when prompted

### Support Tools

- Click on the "Support Tools" header to expand or collapse the support tools section

### Clear Browser Data
1. Select which data types to clear (cookies, cache, localStorage, history)
2. Choose a time range from the dropdown
3. Click "Clear Data"

### Support Bundle Capture
1. Click "Start" to begin the guided capture process
2. Follow the step-by-step instructions in the guide
3. Perform the actions you want to capture
4. Return to the extension tab when finished
5. Click "Stop & Download" to save the support bundle
6. Send the support bundle to your support technician

### Screen Capture
- **For Screenshots**:
  1. Navigate to the tab you want to capture
  2. Click "Take Screenshot"
  3. Save the PNG file when prompted
  4. Send the screenshot to your support technician when needed

- **For Video Recording**:
  1. Click "Record Video" to begin the guided recording process
  2. Follow the step-by-step instructions in the guide
  3. Select which screen/window/tab to share when prompted
  4. Record your workflow
  5. Click "Stop Recording" when finished (recording automatically stops after 5 minutes)
  6. Save the WebM file when prompted
  7. Send the video to your support technician

### Theme Options
- Click on one of the theme icons in the top-right corner:
  - ☀️ Light Theme
  - 🌙 Dark Theme
  - ⚙️ System Theme (matches your OS/browser settings)
- Your theme choice will be remembered across sessions
- The theme will also apply to the recording page when capturing videos

## Technical Considerations

- You can only have 1 Support Bundle capture happening at a time
- Support Bundle Capture is tab-specific (if you start it in tab A, and go to tab B, you need to go back to A to stop and save)
- Video recordings are limited to 5 minutes to maintain reasonable file sizes
- The extension requires specific Chrome permissions:
  - cookies, browsingData, storage, debugger, tabs, activeTab, downloads
- The extension uses minimal permissions for better privacy and security
- When using System Theme, the tool will automatically update if your OS switches between light and dark mode

## Installation

### Developer Mode (for testing)
1. Download or clone the extension files
2. Open Chrome and navigate to chrome://extensions/
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The Browser Support Tool icon should appear in your toolbar

## Troubleshooting

- If Support Bundle capture fails, try refreshing the page and starting again
- If video recording doesn't start, check if you denied screen sharing permissions
- Clear browser data options require at least one checkbox to be selected
- If the extension seems unresponsive, try reloading the extension from chrome://extensions/
- If dark mode doesn't apply correctly, try toggling between themes or restarting the browser
- The extension now supports encrypted PDFs, but extremely complex encryption may still cause issues

## Changelog

### Version 1.5 (Current)
- Improved PDF handling with support for encrypted PDF documents
- Removed broad host permissions for better privacy and security
- Updated to follow Chrome Web Store's best practices for permissions
- Fixed bug where encrypted PDFs would fail to load with "Error: Input document to 'PDFDocumentLoad' is encrypted"
- General performance improvements and bug fixes

### Version 1.4
- Reduced permission requirements for enhanced privacy
- Improved error handling for PDF operations
- Various bug fixes and performance improvements

### Version 1.3 (Previous)
- Added PDF Tools functionality
  - PDF Signing with draw, type, and save signature capabilities
  - PDF Merging with reordering and multi-file support
  - Step-by-step onboarding guides for both tools
- Reorganized UI with improved focus on primary tools
- Added collapsible Support Tools section with persistence
- Added visual divider between primary and support tools
- Improved code organization with modular architecture
- Added guided step-by-step modals for Support Bundle capture and Video Recording
- Renamed "Network Capture" to "Support Bundle Capture" for better user experience
- Added "Do not show again" option for guided help modals
- Added explicit step for sending captures to support team in guides
- Fixed bug where "do not show again" preference would prevent capture/recording from starting
- Enhanced theme consistency across all screens including recording
- Improved accessibility of modal components
- General performance improvements and bug fixes

### Version 1.2
- Added Dark Mode/Theme Options
  - Added light theme (default)
  - Added dark theme for low-light environments
  - Added system theme that matches OS preference
  - Theme selection is saved between sessions
  - Theme applies to all extension pages including the recorder
- Enhanced notification appearance
- Smooth transitions between themes
- Better visibility of UI elements in dark mode
- Improved color contrast for better accessibility

### Version 1.1
- Initial public release
- Clear Browser Data functionality
- Network Capture (HAR files)
- Screenshot capture
- Video recording