# API Extractor - Browser Extension

A powerful Chrome extension that automatically collects and displays all API requests made by websites you visit.

## Features

✨ **Automatic API Collection** - Intercepts all XHR and Fetch requests automatically
🔍 **Real-time Display** - See APIs as they're being requested
📊 **Filter & Search** - Filter by method (GET, POST, etc.) or search by URL
📋 **Detailed Information** - View headers, status codes, and request details
💾 **Export Data** - Export all collected APIs as JSON
🎨 **Beautiful UI** - Clean, modern interface with color-coded request methods

## Installation

### Method 1: Load Unpacked (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `Api extractor` folder from this project
5. The extension is now active! 🎉

### Method 2: Manual Installation

1. Clone or download this repository
2. Follow Method 1 steps

## Usage

1. **Open any website** you want to analyze
2. **Click the extension icon** in the Chrome toolbar (puzzle piece icon)
3. A popup will appear showing all API requests
4. **View details** by clicking on any API request to expand it
5. **Filter APIs** using:
   - Search box for URL filtering
   - Method dropdown for filtering by HTTP method (GET, POST, etc.)
6. **Copy URLs** using the "Copy URL" or "Copy All" buttons
7. **Export data** by clicking the 💾 button to download as JSON

## What It Captures

Each API request includes:
- **Method**: GET, POST, PUT, DELETE, PATCH, etc.
- **URL**: Complete request URL
- **Status**: HTTP status code (200, 404, 500, etc.)
- **Type**: Request type (fetch or XMLHttpRequest)
- **Headers**: Request and response headers
- **Timestamp**: When the request was made

## Examples

### Common Use Cases

1. **API Documentation** - Find all endpoints used by a website
2. **Network Analysis** - Understand what requests are being made
3. **Debugging** - Identify slow or failing API calls
4. **API Discovery** - Reverse-engineer third-party integrations
5. **Performance Monitoring** - Check response status codes

## File Structure

```
Api extractor/
├── manifest.json      # Extension configuration
├── background.js      # Network request interception
├── popup.html         # UI markup
├── popup.js           # Logic and event handlers
├── popup.css          # Styling
├── images/            # Icons (16x16, 48x48, 128x128)
└── README.md          # This file
```

## Troubleshooting

### Extension not showing any APIs?
- Make sure you're visiting a website that makes API requests
- Check the browser's Network tab to confirm APIs are being called
- Refresh the page and check again

### Some APIs not appearing?
- WebSocket connections are not captured (only XHR and Fetch)
- Some requests may be blocked by CORS policies
- The popup must be open to collect requests in real-time

### How to update the extension?
- Edit the files and save them
- Go to `chrome://extensions/`
- Click the refresh icon on the API Extractor card
- The changes will take effect immediately

## Permissions Explained

- **webRequest**: Monitor all network requests
- **tabs**: Access current tab information
- **storage**: Store extension data locally
- **<all_urls>**: Monitor requests on all websites

## Development

### To modify the extension:

1. Edit the JavaScript/HTML/CSS files
2. Go to `chrome://extensions/`
3. Click the refresh button on the API Extractor card
4. Revisit the website to test changes

### Adding Custom Icons

Replace the icon files in the `images/` folder with your own:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Limitations

- Only captures XHR and Fetch requests (not WebSockets or img tags)
- Requests are cleared when the extension is refreshed
- Data is stored per-tab and cleared when the tab is closed
- Cannot access response bodies for security reasons

## Future Enhancements

- [ ] Persist data across sessions
- [ ] Mock API server based on captured requests
- [ ] Export as Postman collection
- [ ] WebSocket support
- [ ] Response body inspection (with permission)
- [ ] Request replay functionality

## License

MIT - Feel free to use and modify as needed

## Contributing

Have suggestions or found a bug? Feel free to improve the extension!

---

**Made with ❤️ for developers and API enthusiasts**
