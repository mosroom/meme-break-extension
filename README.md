# 🎭 Meme Break - Chrome Extension

![Meme Break Banner](https://github.com/mosroom/meme-break-extension/blob/main/assets/MemeBreakBanner.png)

> Stay entertained while you work with periodic meme popups!

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285f4?style=for-the-badge&logo=googlechrome&logoColor=white)

## What is Meme Break?

**Meme Break** is a Chrome extension that shows you random memes at regular intervals to keep you entertained during work sessions. Because who doesn't need a good laugh while grinding through spreadsheets? 😄

## ✨ Features

- 🎯 **Scheduled Meme Delivery**: Get memes every 15 minutes, 30 minutes, 1 hour, or 2 hours
- 🎨 **Beautiful Popups**: Sleek design with smooth animations
- ⏱️ **Auto-Dismiss**: Popups close automatically after 30 seconds
- 🎮 **Easy Controls**: Close with X button or Escape key
- 💾 **Sync Settings**: Your preferences save across devices
- 📱 **Mobile Friendly**: Works on all screen sizes
- 🛡️ **Safe Content:** Only family-friendly memes, no NSFW material

## 🔧 How It Works

**Meme Break** operates through three main components working together:
### Background Script (``background.js``)

- Manages Chrome alarms to schedule meme delivery at your chosen intervals
- Fetches random memes from the [Meme API](https://meme-api.com/gimme)
- Finds the best active browser tab to display the meme
- Handles extension startup/shutdown and settings synchronization

### Content Script (``content.js & content.css``)

- Injected into web pages to display the retro-pixel styled meme popup
- Creates animated overlays that don't interfere with page functionality
- Handles user interactions (close button, escape key, auto-dismiss timer)
- Manages popup lifecycle and cleanup

### Popup Interface (``popup.html & popup.js``)

- Provides the extension's settings panel with retro gaming aesthetics
- Allows users to configure meme intervals and toggle the extension on/off
- Communicates with the background script to apply settings changes
- Uses Chrome's sync storage to persist settings across devices

The extension respects user privacy by storing all settings locally and only fetching memes from public APIs without collecting any personal data.

## 📱 Screenshots

### Extension Popup
![Extension Popup1](https://github.com/mosroom/meme-break-extension/blob/main/assets/Popup1.png)

![Extension Popup2](https://github.com/mosroom/meme-break-extension/blob/main/assets/Popup2.png)

*Configure your meme break settings with our sleek popup interface*

### Meme Display
![Meme Display](https://github.com/mosroom/meme-break-extension/blob/main/assets/MemePopup.png)

## 🚀 Installation

### Install from Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (link coming soon)
2. Click "Add to Chrome"
3. Click "Add Extension" when prompted
4. Pin the extension to your toolbar for easy access

**Note**: Please only install from the official Chrome Web Store to ensure you get the authentic, secure version of the extension.

### Local Installation (For Developers)

1. Download/clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked" and select the extension folder

## 🎮 How to Use

1. **Click the extension icon** in your Chrome toolbar
2. **Choose your meme interval** (15 min, 30 min, 1 hour, or 2 hours)  
3. **Toggle the switch** to enable meme breaks
4. **Enjoy your memes!** They'll pop up automatically while you browse

When a meme appears:
- It auto-closes after 30 seconds
- Click the X to close early
- Press Escape to dismiss
- Enjoy the laugh! 😂

## 🙏 Credits

- **[Meme API](https://github.com/D3vd/Meme_Api)** - Thanks to D3vd for the awesome meme API service that powers this extension

## 📄 License

[MIT License](https://github.com/mosroom/meme-break-extension/blob/main/LICENSE)

## 🔒 Privacy

This extension:
- ✅ Does NOT collect your personal data
- ✅ Only fetches memes from public APIs
- ✅ Stores settings locally in your browser
- ❌ No tracking, no ads, no nonsense

---

Made With ♥ By AI & My Questionable Brainpower :)
