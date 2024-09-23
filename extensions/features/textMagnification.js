// Utility functions for storage (since imports are not allowed in content scripts)
function getStorageData(key, callback) {
  chrome.storage.sync.get(key, function(result) {
    if (chrome.runtime.lastError) {
      console.error('Error accessing storage:', chrome.runtime.lastError);
      callback(null, chrome.runtime.lastError);
    } else {
      callback(result, null);
    }
  });
}

// Define global variables
let magnificationEnabled = false;
let magnificationLevel = 1.5;
let focusZoomEnabled = false;
let focusZoomLevel = 2;
let overlayDiv = null;

// Initialize text magnification
function initTextMagnification(level) {
  console.log('Initializing text magnification with level:', level);
  magnificationLevel = level;
  getStorageData(['magnificationEnabled', 'focusZoomEnabled', 'focusZoomLevel'], function(result, error) {
    if (error) {
      console.error('Error getting magnification settings:', error);
    } else {
      magnificationEnabled = result.magnificationEnabled || false;
      focusZoomEnabled = result.focusZoomEnabled || false;
      focusZoomLevel = result.focusZoomLevel || 2;
      console.log('Magnification enabled:', magnificationEnabled);
      console.log('Focus Zoom enabled:', focusZoomEnabled);
      if (magnificationEnabled || focusZoomEnabled) {
        addMagnificationListeners();
      } else {
        removeMagnificationListeners();
      }
    }
  });
}

function addMagnificationListeners() {
  document.body.addEventListener('mouseover', magnifyText);
  document.body.addEventListener('mouseout', resetText);
}

function removeMagnificationListeners() {
  document.body.removeEventListener('mouseover', magnifyText);
  document.body.removeEventListener('mouseout', resetText);
}

function magnifyText(event) {
  if (event.target.tagName === 'P') {
    // Magnify text
    if (magnificationEnabled) {
      const originalSize = parseFloat(window.getComputedStyle(event.target).fontSize);
      event.target.style.transition = 'font-size 0.1s ease-in-out';
      event.target.style.fontSize = `${originalSize * magnificationLevel}px`;
      event.target.dataset.originalSize = originalSize;
    }

    // Apply focus zoom
    if (focusZoomEnabled) {
      applyFocusZoom(event.target);
    }
  }
}

function resetText(event) {
  if (event.target.tagName === 'P') {
    // Reset text magnification
    if (magnificationEnabled) {
      event.target.style.fontSize = `${event.target.dataset.originalSize}px`;
      delete event.target.dataset.originalSize;
    }

    // Remove focus zoom
    if (focusZoomEnabled) {
      removeFocusZoom();
    }
  }
}

function applyFocusZoom(targetElement) {
  // Create and show overlay
  if (!overlayDiv) {
    overlayDiv = document.createElement('div');
    overlayDiv.id = 'focusZoomOverlay';
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlayDiv.style.zIndex = '9998';
    overlayDiv.style.pointerEvents = 'none';
    document.body.appendChild(overlayDiv);
  }

  // Apply blur to background elements
  document.documentElement.style.filter = 'blur(5px)';
  document.documentElement.style.transition = 'filter 0.2s ease-in-out';

  // Bring the target paragraph above the overlay and remove blur
  targetElement.style.position = 'relative';
  targetElement.style.zIndex = '9999';
  targetElement.style.filter = 'none';
}

function removeFocusZoom() {
  // Remove overlay
  if (overlayDiv) {
    overlayDiv.remove();
    overlayDiv = null;
  }

  // Remove blur from background elements
  document.documentElement.style.filter = '';
  document.documentElement.style.transition = '';

  // Reset z-index and position of paragraphs
  document.querySelectorAll('p').forEach(p => {
    p.style.position = '';
    p.style.zIndex = '';
    p.style.filter = '';
  });
}

// Listen for changes in magnification settings
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.magnificationEnabled) {
    magnificationEnabled = changes.magnificationEnabled.newValue;
    console.log('Magnification enabled changed to:', magnificationEnabled);
    if (magnificationEnabled || focusZoomEnabled) {
      addMagnificationListeners();
    } else {
      removeMagnificationListeners();
    }
  }
  if (changes.magnificationLevel) {
    magnificationLevel = changes.magnificationLevel.newValue;
    console.log('Magnification level changed to:', magnificationLevel);
  }
  if (changes.focusZoomEnabled) {
    focusZoomEnabled = changes.focusZoomEnabled.newValue;
    console.log('Focus Zoom enabled changed to:', focusZoomEnabled);
    if (magnificationEnabled || focusZoomEnabled) {
      addMagnificationListeners();
    } else {
      removeMagnificationListeners();
    }
  }
  if (changes.focusZoomLevel) {
    focusZoomLevel = changes.focusZoomLevel.newValue;
    console.log('Focus Zoom level changed to:', focusZoomLevel);
  }
});

// Initialize the feature
initTextMagnification(magnificationLevel);

// Export functions for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initTextMagnification,
    addMagnificationListeners,
    removeMagnificationListeners,
    magnifyText,
    resetText,
    applyFocusZoom,
    removeFocusZoom
  };
}
