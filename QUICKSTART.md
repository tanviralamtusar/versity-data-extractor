# 🚀 Quick Start Guide - API Extractor

## ⚡ 5-Minute Setup

### Step 1: Generate Icons

Open a terminal in this folder and run ONE of these commands:

**Option A - Python (Most Common)**
```bash
python generate-icons.py
```

**Option B - Node.js**
```bash
npm install canvas
node generate-icons.js
```

✅ You should now see PNG files in the `images/` folder

### Step 2: Load in Chrome

1. Open Chrome and navigate to **`chrome://extensions/`**
2. Toggle **"Developer mode"** ON (top right corner)
3. Click **"Load unpacked"**
4. Select the **Api extractor** folder
5. ✨ Extension is now installed!

### Step 3: Start Using It

1. Visit any website (e.g., Twitter, Facebook, Amazon, etc.)
2. Click the **extension icon** in the top-right toolbar
3. Watch API requests appear in real-time
4. Click any API to see detailed information

## 📋 Features at a Glance

| Feature | What It Does |
|---------|-------------|
| 🔍 Search | Filter APIs by URL |
| 🎯 Method Filter | Show only GET, POST, PUT, DELETE, etc. |
| 📋 Details | Expand to see headers and full URL |
| 💾 Export | Save all APIs as JSON file |
| 🗑️ Clear | Remove all collected data |
| 🔄 Refresh | Manually refresh the list |

## 🎯 Example Websites to Test

These sites make lots of API calls:
- **Twitter.com** - Twitter API calls
- **GitHub.com** - GitHub API calls
- **YouTube.com** - Google APIs
- **Gmail.com** - Google services
- **Reddit.com** - Reddit API
- **Amazon.com** - Ecommerce APIs

## ❓ FAQ

**Q: Why aren't I seeing any APIs?**
A: Make sure you're on a website that makes API requests. Try clicking around, scrolling, or refreshing the page.

**Q: Can I see the API response data?**
A: The extension shows headers and metadata, but not response bodies (for security). You can use Chrome DevTools for that.

**Q: Where are my collected APIs saved?**
A: They're stored temporarily while you're on that website. Once you close the tab, they're cleared (by design).

**Q: Can I persist the data across sessions?**
A: Right now, data is cleared per-tab. Use the "Export" button to save as JSON for permanent records.

**Q: Is this safe to use?**
A: Yes! This extension:
- Only monitors your own browsing
- Doesn't send data anywhere
- Is entirely local to your browser
- Doesn't modify any website content

## 🔧 Customization

Want to modify the extension? Here's what each file does:

- **manifest.json** - Extension configuration & permissions
- **background.js** - Network request interceptor (the core)
- **popup.html** - User interface layout
- **popup.js** - Interface logic and event handlers
- **popup.css** - Styling and colors
- **generate-icons.py** - Create icons automatically

Edit any file, then:
1. Go to `chrome://extensions/`
2. Click the refresh button on API Extractor
3. Changes take effect immediately!

## 🐛 Troubleshooting

### Extension won't load?
- Make sure all files are in the folder
- Check that `manifest.json` exists
- Try refreshing the page

### Icons showing as question marks?
- Run the icon generator script
- Make sure images are in the `images/` folder
- Refresh the extension

### No APIs appearing?
- Check Chrome DevTools Network tab to verify APIs are being called
- Try a different website
- Click the refresh button on the popup

## 📚 Learn More

For detailed documentation, see: **README.md**

## 🎉 You're All Set!

Your API Extractor is ready to go. Start exploring the APIs behind your favorite websites!

---

**Made with ❤️ for developers**
