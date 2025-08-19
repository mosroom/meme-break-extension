// content.js - Handles meme popup display in web pages
(function() {
  'use strict';
  
  // Prevent multiple injections
  if (window.memeBreakInjected) {
    console.log('Meme Break content script already injected');
    return;
  }
  window.memeBreakInjected = true;
  
  let currentPopup = null;
  let progressInterval = null;
  let autoCloseTimeout = null;
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);
    
    switch (message.action) {
      case 'showMeme':
        console.log('Content script received meme:', message.meme);
        showMemePopup(message.meme);
        sendResponse({ success: true });
        break;
        
      case 'ping':
        // Respond to ping to confirm content script is active
        sendResponse({ success: true, status: 'active' });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep message channel open for async response
  });
  
  function showMemePopup(memeData) {
    // Remove any existing popup first
    hideCurrentPopup();
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'meme-break-popup';
    popup.innerHTML = createPopupHTML(memeData);
    
    // Add to page
    document.body.appendChild(popup);
    currentPopup = popup;
    
    // Set up event handlers
    setupPopupHandlers(popup);
    
    // Animate in with slight delay to ensure DOM is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        popup.classList.add('show');
      });
    });
    
    // Auto-close after 30 seconds
    startAutoCloseTimer();
    
    // Start progress bar animation
    startProgressBar();
  }
  
  function createPopupHTML(meme) {
    return `
      <div class="meme-popup-header">
        <div class="meme-popup-title">
          🎭 Meme Break
        </div>
        <button class="meme-popup-close" type="button" aria-label="Close">×</button>
      </div>
      <div class="meme-popup-content">
        <img class="meme-popup-image" src="${meme.url}" alt="Meme" loading="lazy">
        <div class="meme-popup-info">
          <div class="meme-popup-meme-title">${escapeHtml(meme.title)}</div>
          <div class="meme-popup-meta">
            r/${escapeHtml(meme.subreddit)} • by ${escapeHtml(meme.author)}
          </div>
        </div>
      </div>
      <div class="meme-popup-progress"></div>
    `;
  }
  
  function setupPopupHandlers(popup) {
    // Close button handler
    const closeButton = popup.querySelector('.meme-popup-close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideCurrentPopup();
      });
    }
    
    // Image error handler
    const img = popup.querySelector('.meme-popup-image');
    if (img) {
      img.addEventListener('error', () => {
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjEwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2Ugbm90IGF2YWlsYWJsZSA6QDwvdGV4dD48L3N2Zz4=';
      });
      
      // Image load handler for smooth display
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
    }
    
    // Prevent popup from interfering with page clicks
    popup.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Add keyboard support
    document.addEventListener('keydown', handleKeyDown);
  }
  
  function handleKeyDown(e) {
    if (e.key === 'Escape' && currentPopup) {
      hideCurrentPopup();
    }
  }
  
  function startAutoCloseTimer() {
    // Clear any existing timer
    if (autoCloseTimeout) {
      clearTimeout(autoCloseTimeout);
    }
    
    autoCloseTimeout = setTimeout(() => {
      hideCurrentPopup();
    }, 30000); // 30 seconds
  }
  
  function startProgressBar() {
    const progressBar = currentPopup?.querySelector('.meme-popup-progress');
    if (!progressBar) return;
    
    // Clear any existing interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    let progress = 0;
    const duration = 30000; // 30 seconds
    const interval = 100; // Update every 100ms for smoother animation
    const increment = (interval / duration) * 100;
    
    progressBar.style.width = '0%';
    
    progressInterval = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        progressInterval = null;
      }
      progressBar.style.width = `${progress}%`;
    }, interval);
  }
  
  function hideCurrentPopup() {
    if (!currentPopup) return;
    
    console.log('Hiding current popup');
    
    // Clear timers
    if (autoCloseTimeout) {
      clearTimeout(autoCloseTimeout);
      autoCloseTimeout = null;
    }
    
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    
    // Remove keyboard listener
    document.removeEventListener('keydown', handleKeyDown);
    
    // Animate out
    currentPopup.classList.add('hide');
    currentPopup.classList.remove('show');
    
    const popupToRemove = currentPopup;
    currentPopup = null;
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (popupToRemove && popupToRemove.parentNode) {
        popupToRemove.parentNode.removeChild(popupToRemove);
      }
    }, 300);
  }
  
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    hideCurrentPopup();
  });
  
  // Clean up if extension is disabled/reloaded
  window.addEventListener('unload', () => {
    hideCurrentPopup();
  });
  
  console.log('Meme Break content script loaded and ready');
})();