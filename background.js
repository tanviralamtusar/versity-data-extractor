// Background service worker for Student Data Extractor
// Minimal setup - most work is done in content.js and popup.js

chrome.runtime.onInstalled.addListener(() => {
  console.log('Student Data Extractor installed');
});


// Clean up when tab is closed

