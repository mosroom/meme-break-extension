// background.js - Service worker for meme scheduling
const ALARM_NAME = 'memeBreakAlarm';
const BASE_MEME_API_URL = 'https://meme-api.com/gimme';

// All available subreddits (default + your additions)
const SUBREDDITS = [
  // Default subreddits from the API
  'memes',
  'dankmemes', 
  'me_irl',
  
  // Your additional subreddits
  'meme',
  'Memes_Of_The_Dank',
  'funny',
  'Funnymemes',
  'MemeEconomy',
  'wholesomememes'
];

// Initialize extension on startup AND install
chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension startup');
  await initializeExtension();
});

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed/enabled');
  await initializeExtension();
});

async function initializeExtension() {
  console.log('Meme Break extension initialized');
  
  // Load settings and start if enabled
  const settings = await chrome.storage.sync.get({
    interval: 30,
    enabled: false
  });
  
  console.log('Loaded settings:', settings);
  
  // CRITICAL FIX: Auto-start if enabled
  if (settings.enabled) {
    console.log('Auto-starting meme timer on initialization');
    await startMemeTimer(settings.interval);
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  try {
    switch (message.action) {
      case 'start':
        const settings = await chrome.storage.sync.get('interval');
        await startMemeTimer(settings.interval || 30);
        break;
        
      case 'stop':
        await stopMemeTimer();
        break;
        
      case 'updateInterval':
        // Clear existing alarm and start with new interval
        await chrome.alarms.clear(ALARM_NAME);
        await startMemeTimer(message.interval);
        break;
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
});

// Handle alarm triggers
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log('Meme alarm triggered!');
    
    // CRITICAL FIX: Check if still enabled before showing meme
    const { enabled } = await chrome.storage.sync.get('enabled');
    if (enabled) {
      await showMemeInBestTab();
    } else {
      console.log('Extension disabled, stopping alarm');
      await chrome.alarms.clear(ALARM_NAME);
    }
  }
});

async function startMemeTimer(intervalMinutes) {
  console.log(`Starting meme timer: ${intervalMinutes} minutes`);
  
  try {
    // Clear any existing alarm
    await chrome.alarms.clear(ALARM_NAME);
    
    // CRITICAL FIX: Ensure alarm creation is robust
    await chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: intervalMinutes,
      periodInMinutes: intervalMinutes
    });
    
    // Verify alarm was created
    const alarm = await chrome.alarms.get(ALARM_NAME);
    console.log('Alarm created successfully:', alarm);
    
  } catch (error) {
    console.error('Error creating alarm:', error);
  }
}

async function stopMemeTimer() {
  console.log('Stopping meme timer');
  try {
    await chrome.alarms.clear(ALARM_NAME);
    console.log('Alarm cleared successfully');
  } catch (error) {
    console.error('Error clearing alarm:', error);
  }
}

// IMPROVED: Better tab selection logic
async function showMemeInBestTab() {
  try {
    // Get all tabs in current window
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    if (!tabs || tabs.length === 0) {
      console.log('No tabs found');
      return;
    }
    
    // Find the best tab to show meme in
    let targetTab = null;
    
    // First preference: active tab (if suitable)
    const activeTab = tabs.find(tab => tab.active);
    if (activeTab && isValidTabForMeme(activeTab)) {
      targetTab = activeTab;
    }
    
    // Second preference: most recently accessed suitable tab
    if (!targetTab) {
      const suitableTabs = tabs
        .filter(isValidTabForMeme)
        .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
      
      targetTab = suitableTabs[0];
    }
    
    // Fallback: any suitable tab
    if (!targetTab) {
      targetTab = tabs.find(isValidTabForMeme);
    }
    
    if (!targetTab) {
      console.log('No suitable tabs found for meme display');
      return;
    }
    
    console.log('Selected tab for meme:', targetTab.url);
    
    // Fetch meme from API
    const meme = await fetchRandomMeme();
    
    if (meme) {
      // CRITICAL FIX: Ensure content script is injected
      await ensureContentScriptInjected(targetTab.id);
      
      // Send meme data to content script
      try {
        await chrome.tabs.sendMessage(targetTab.id, {
          action: 'showMeme',
          meme: meme
        });
        console.log('Meme sent to tab successfully');
      } catch (error) {
        console.log('Could not send message to content script, retrying injection:', error);
        
        // Retry with fresh injection
        await injectContentScript(targetTab.id);
        await chrome.tabs.sendMessage(targetTab.id, {
          action: 'showMeme',
          meme: meme
        });
      }
    }
    
  } catch (error) {
    console.error('Error showing meme in best tab:', error);
  }
}

function isValidTabForMeme(tab) {
  if (!tab || !tab.url) return false;
  
  // Skip chrome:// and extension pages
  if (tab.url.startsWith('chrome://') || 
      tab.url.startsWith('chrome-extension://') ||
      tab.url.startsWith('moz-extension://') ||
      tab.url.startsWith('about:')) {
    return false;
  }
  
  return true;
}

// CRITICAL FIX: Ensure content script is properly injected
async function ensureContentScriptInjected(tabId) {
  try {
    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    console.log('Content script already active');
  } catch (error) {
    // Content script not responding, inject it
    console.log('Content script not found, injecting...');
    await injectContentScript(tabId);
  }
}

async function injectContentScript(tabId) {
  try {
    // Inject CSS first
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['content.css']
    });
    
    // Then inject JavaScript
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    
    console.log('Content script injected successfully');
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
}

// NEW: Function to randomly select a subreddit and fetch meme
function getRandomSubreddit() {
  const randomIndex = Math.floor(Math.random() * SUBREDDITS.length);
  return SUBREDDITS[randomIndex];
}

async function fetchRandomMeme() {
  try {
    // Randomly select a subreddit
    const randomSubreddit = getRandomSubreddit();
    const MEME_API_URL = `${BASE_MEME_API_URL}/${randomSubreddit}`;
    
    console.log(`Fetching meme from r/${randomSubreddit}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(MEME_API_URL, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate meme data
    if (data && data.url && data.title) {
      console.log(`Meme fetched successfully from r/${randomSubreddit}:`, data.title);
      return {
        url: data.url,
        title: data.title,
        author: data.author || 'Unknown',
        subreddit: data.subreddit || randomSubreddit
      };
    } else {
      throw new Error('Invalid meme data received');
    }
    
  } catch (error) {
    console.error('Failed to fetch meme:', error);
    
    // Fallback: try with default endpoint (no specific subreddit)
    try {
      console.log('Trying fallback with default endpoint...');
      const response = await fetch(BASE_MEME_API_URL);
      if (response.ok) {
        const data = await response.json();
        if (data && data.url && data.title) {
          console.log('Fallback meme fetched successfully:', data.title);
          return {
            url: data.url,
            title: data.title,
            author: data.author || 'Unknown',
            subreddit: data.subreddit || 'memes'
          };
        }
      }
    } catch (fallbackError) {
      console.error('Fallback fetch also failed:', fallbackError);
    }
    
    // Return a final fallback meme
    return {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjEwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TWVtZSBub3QgYXZhaWxhYmxlIDpAPC90ZXh0Pjwvc3ZnPg==',
      title: 'Meme not available right now! 😅',
      author: 'Meme Break',
      subreddit: 'tech'
    };
  }
}