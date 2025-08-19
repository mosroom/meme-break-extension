// popup.js - Extension popup functionality
document.addEventListener('DOMContentLoaded', async () => {
  const intervalSelect = document.getElementById('interval');
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  const settings = await chrome.storage.sync.get({
    interval: 30,
    enabled: false
  });

  // Apply loaded settings to UI
  intervalSelect.value = settings.interval;
  updateToggleState(settings.enabled);

  // Handle interval change
  intervalSelect.addEventListener('change', async () => {
    const newInterval = parseInt(intervalSelect.value);
    await chrome.storage.sync.set({ interval: newInterval });
    
    // If extension is enabled, restart with new interval
    const { enabled } = await chrome.storage.sync.get('enabled');
    if (enabled) {
      chrome.runtime.sendMessage({
        action: 'updateInterval',
        interval: newInterval
      });
    }
  });

  // Handle toggle switch
  toggleSwitch.addEventListener('click', async () => {
    const currentState = toggleSwitch.classList.contains('active');
    const newState = !currentState;
    
    updateToggleState(newState);
    await chrome.storage.sync.set({ enabled: newState });
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: newState ? 'start' : 'stop'
    });
  });

  function updateToggleState(enabled) {
    if (enabled) {
      toggleSwitch.classList.add('active');
      statusDiv.textContent = 'MEME BREAKS ENABLED!';
      statusDiv.className = 'status active';
    } else {
      toggleSwitch.classList.remove('active');
      statusDiv.textContent = 'MEME BREAKS DISABLED';
      statusDiv.className = 'status inactive';
    }
  }
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'statusUpdate') {
    // Update status if popup is still open
    console.log('Status update received:', message.status);
  }
});