# Browser Support Tool

A Chrome extension designed to assist with troubleshooting and debugging web applications by providing a simple interface for common support tasks and PDF tools.

## Version 1.7.3 (Current)

## Features

### 1. PDF Tools
- **Sign PDF**: Add signatures to PDF documents
  - Draw signatures with mouse/touch input
  - Type signatures with customizable fonts
  - Save and reuse signatures for future documents
  - Position, resize, and rotate signatures on the document
  - Delete placed signatures with the X control button
  - Step-by-step onboarding guide
- **Merge PDFs**: Combine multiple PDF files
  - Select multiple PDF files to merge
  - Reorder files before merging by dragging or using arrow buttons
  - Single-click merge operation
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
- Record network activity in the current tab
- Save as industry-standard HAR diagnostic files
- Includes all requests, responses, headers, and timing information
- Timestamped filenames for easy organization
- Step-by-step guide for capturing effective support bundles

#### Screen Capture
- **Screenshots**: Instantly capture the visible area of the current tab
- **Video Recording**: Record up to 5 minutes of screen activity
  - Saves in WebM format for high quality with reasonable file size
  - Timestamped filenames
  - Guided workflow for effective recordings

### 3. Theming
- Automatically follows your operating system's light/dark preference
- Smooth transitions between modes
- No configuration needed

## How to Use

### PDF Tools

#### Sign PDF
1. Click "Sign PDF" to open the PDF signing tool
2. Upload a PDF document by clicking "Select PDF"
3. Navigate through the document using the Previous / Next page controls
4. Add a signature using one of three methods:
   - **Draw** — draw a signature using your mouse
   - **Type** — type a signature and select a font
   - **Saved** — use a previously saved signature
5. Drag the signature onto the document to place it
6. Hover over a placed signature to reveal resize handles, a rotate handle, and the X delete button
7. Click "Save Document" to download the signed PDF

#### Merge PDFs
1. Click "Merge PDFs" to open the PDF merging tool
2. Select multiple PDF files by clicking "Select PDFs to merge"
3. Reorder files by dragging or using the arrow buttons
4. Click "Merge PDFs" to combine the files
5. Save the merged PDF when prompted

### Support Tools

Click the "Support Tools" header to expand or collapse the support tools section.

### Clear Browser Data
1. Select which data types to clear (cookies, cache, localStorage, history)
2. Choose a time range from the dropdown
3. Click "Clear"

### Support Bundle Capture
1. Click "Start" to begin the guided capture process
2. Follow the step-by-step instructions in the guide
3. Perform the actions you want to capture
4. Return to the extension tab when finished
5. Click "Stop & Save" to download the support bundle
6. Send the support bundle to your support technician

### Screen Capture
**For Screenshots:**
1. Navigate to the tab you want to capture
2. Click "Screenshot"
3. Save the PNG file when prompted

**For Video Recording:**
1. Click "Record" to begin
2. Select which screen/window/tab to share when prompted
3. Record your workflow
4. Click "■ Stop" when finished (recording automatically stops after 5 minutes)
5. Save the WebM file when prompted

## Technical Considerations

- You can only have one Support Bundle capture running at a time
- Support Bundle Capture is tab-specific — if you start it in Tab A, you must return to Tab A to stop and save
- Video recordings are limited to 5 minutes to maintain reasonable file sizes
- The extension requires these Chrome permissions: `cookies`, `browsingData`, `storage`, `debugger`, `tabs`, `activeTab`, `downloads`
- Theming follows the OS preference automatically via `prefers-color-scheme`

## Installation

### Developer Mode (for testing)
1. Download or clone the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The Browser Support Tool icon will appear in your toolbar

## Troubleshooting

- If Support Bundle capture fails, refresh the page and try again
- If video recording doesn't start, check that you haven't denied screen sharing permissions
- Clear browser data requires at least one checkbox to be selected
- If the extension seems unresponsive, reload it from `chrome://extensions/`

## Changelog

### Version 1.7.3 (Current)
- Fixed signature duplication bug when dragging saved signatures onto a PDF document
- Root cause: `setupDropZone()` was called inside `loadSavedSignatures()`, causing a new `drop` event listener to stack on the PDF viewer every time a signature was saved or deleted — each listener independently fired `addSignatureToPdfPreview()` on the same drop, placing one copy per accumulated listener
- Fix: moved `setupDropZone()` to `initializeSignatureManager()` so it runs exactly once on page load
- Fix: `selectedSignature` is now cleared after each successful drop, preventing any stray replay on duplicate events

### Version 1.7.2
- Rewrote onboarding modal copy for both PDF Sign and PDF Merge tools with plain, end-user-friendly language
- Reduced modal step count in both guides (5 steps → 4) by removing redundant steps
- Added purple (`#562C82`) and magenta (`#BF1785`) as full design tokens with light and dark mode variants
- Applied color identity to PDF tool cards: Sign PDF uses purple, Merge PDFs uses magenta (icon chips, hover glow)
- Modal step-number badges now match their tool's color (purple for signing, magenta for merging)
- Removed all internal brand name references from CSS comment headers

### Version 1.7.1
- Fixed button contrast in the PDF signing tool — primary/secondary buttons now correctly use the ChenMed teal design tokens
- Fixed invisible X/delete icon buttons on placed signatures in the PDF viewer (undefined CSS variables now resolved)
- Updated PDF tools header to match the popup design, including the branded app icon
- Unified CSS design token usage across all sections (no more legacy undefined variables)
- Dark mode now applied correctly via `prefers-color-scheme` in the PDF tools page

### Version 1.7
- Introduced new design system across the entire extension
  - CSS custom properties for all colors, surfaces, radii, and shadows
  - Inter typeface with consistent weight and sizing scale
  - Teal (`#006B62` light / `#2db3a8` dark) as the primary accent
- Replaced manual theme toggle with automatic OS-based theming (`prefers-color-scheme`)
- Redesigned popup with card-based PDF tool launchers
- Improved collapsible Support Tools section styling
- Modular PDF tools architecture with dedicated `pdf-tools/modules/` directory
- Full dark mode support with proper color inversion for all surfaces and text

### Version 1.3
- Added PDF Tools functionality
  - PDF Signing with draw, type, and save signature capabilities
  - PDF Merging with reordering and multi-file support
  - Step-by-step onboarding guides for both tools
- Reorganized UI with improved focus on primary tools
- Added collapsible Support Tools section with state persistence
- Added visual divider between primary and support tools
- Improved code organization with modular architecture
- Added guided step-by-step modals for Support Bundle capture and Video Recording
- Renamed "Network Capture" to "Support Bundle Capture" for clarity
- Added "Do not show again" option for guided help modals
- Fixed bug where "do not show again" preference would prevent capture/recording from starting
- Enhanced theme consistency across all screens including the recording page
- Improved accessibility of modal components

### Version 1.2
- Added Dark Mode / Theme Options
  - Light theme (default)
  - Dark theme for low-light environments
  - System theme that matches OS preference
  - Theme selection saved between sessions
- Enhanced notification appearance
- Smooth transitions between themes
- Improved color contrast for accessibility

### Version 1.1
- Initial public release
- Clear Browser Data functionality
- Network Capture (HAR files)
- Screenshot capture
- Video recording
