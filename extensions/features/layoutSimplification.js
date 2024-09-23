// Utility function to get storage data
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

// Utility function to set storage data
function setStorageData(data, callback) {
  chrome.storage.sync.set(data, function() {
    if (chrome.runtime.lastError) {
      console.error('Error saving to storage:', chrome.runtime.lastError);
      if (callback) callback(chrome.runtime.lastError);
    } else {
      if (callback) callback(null);
    }
  });
}

// Global variables for layout simplification state
let layoutSimplificationEnabled = false;
let advancedOptions = {
  hideImages: false,
  simplifyFonts: false,
  increaseParagraphSpacing: false,
  removeBackgroundImages: false,
  highlightLinks: false
};

// Initialize layout simplification
function initLayoutSimplification(enabled, options = {}) {
  console.log('Initializing layout simplification:', enabled);
  layoutSimplificationEnabled = enabled;
  advancedOptions = { ...advancedOptions, ...options };
  applyLayoutSimplification();
}

// Apply layout simplification based on settings
function applyLayoutSimplification() {
  console.log('Applying layout simplification. Enabled:', layoutSimplificationEnabled);
  if (layoutSimplificationEnabled) {
    simplifyLayout();
  } else {
    restoreLayout();
  }
}

// Simplify layout by hiding and modifying elements
function simplifyLayout() {
  try {
    // Basic layout simplification
    const elementsToHide = document.querySelectorAll('aside, .sidebar, .ad, .advertisement, [class*="banner"], [id*="banner"], [class*="popup"], [id*="popup"]');
    elementsToHide.forEach(el => {
      el.dataset.originalDisplay = el.style.display;
      el.style.display = 'none';
    });

    const mainContent = document.querySelector('main, #main, .main-content, article, .article');
    if (mainContent) {
      mainContent.style.width = '100%';
      mainContent.style.maxWidth = '800px';
      mainContent.style.margin = '0 auto';
      mainContent.style.padding = '20px';
      mainContent.style.backgroundColor = '#ffffff';
      mainContent.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    }

    // Apply advanced options
    if (advancedOptions.hideImages) {
      document.querySelectorAll('img').forEach(img => {
        img.dataset.originalDisplay = img.style.display;
        img.style.display = 'none';
      });
    }

    if (advancedOptions.simplifyFonts) {
      document.body.style.fontFamily = 'Arial, sans-serif';
      document.querySelectorAll('*').forEach(el => {
        el.style.fontFamily = 'inherit';
      });
    }

    if (advancedOptions.increaseParagraphSpacing) {
      document.querySelectorAll('p').forEach(p => {
        p.style.marginBottom = '1.5em';
      });
    }

    if (advancedOptions.removeBackgroundImages) {
      document.querySelectorAll('*').forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.backgroundImage !== 'none') {
          el.dataset.originalBackgroundImage = el.style.backgroundImage;
          el.style.backgroundImage = 'none';
        }
      });
    }

    if (advancedOptions.highlightLinks) {
      document.querySelectorAll('a').forEach(a => {
        a.style.textDecoration = 'underline';
        a.style.color = '#0000FF';
      });
    }

    console.log('Layout simplified with advanced options');
  } catch (error) {
    console.error('Error in simplifyLayout:', error);
  }
}

// Restore original layout when simplification is disabled
function restoreLayout() {
  try {
    // Restore basic layout elements
    const hiddenElements = document.querySelectorAll('[data-original-display]');
    hiddenElements.forEach(el => {
      el.style.display = el.dataset.originalDisplay;
      delete el.dataset.originalDisplay;
    });

    const mainContent = document.querySelector('main, #main, .main-content, article, .article');
    if (mainContent) {
      mainContent.style.width = '';
      mainContent.style.maxWidth = '';
      mainContent.style.margin = '';
      mainContent.style.padding = '';
      mainContent.style.backgroundColor = '';
      mainContent.style.boxShadow = '';
    }

    // Restore advanced options
    if (advancedOptions.hideImages) {
      document.querySelectorAll('img[data-original-display]').forEach(img => {
        img.style.display = img.dataset.originalDisplay;
        delete img.dataset.originalDisplay;
      });
    }

    if (advancedOptions.simplifyFonts) {
      document.body.style.fontFamily = '';
      document.querySelectorAll('*').forEach(el => {
        el.style.fontFamily = '';
      });
    }

    if (advancedOptions.increaseParagraphSpacing) {
      document.querySelectorAll('p').forEach(p => {
        p.style.marginBottom = '';
      });
    }

    if (advancedOptions.removeBackgroundImages) {
      document.querySelectorAll('[data-original-background-image]').forEach(el => {
        el.style.backgroundImage = el.dataset.originalBackgroundImage;
        delete el.dataset.originalBackgroundImage;
      });
    }

    if (advancedOptions.highlightLinks) {
      document.querySelectorAll('a').forEach(a => {
        a.style.textDecoration = '';
        a.style.color = '';
      });
    }

    console.log('Layout restored');
  } catch (error) {
    console.error('Error in restoreLayout:', error);
  }
}

// Listen for changes in layout simplification settings
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.layoutSimplificationEnabled) {
    layoutSimplificationEnabled = changes.layoutSimplificationEnabled.newValue;
    console.log('Layout simplification enabled changed to:', layoutSimplificationEnabled);
    applyLayoutSimplification();
  }
  if (changes.layoutSimplificationAdvancedOptions) {
    advancedOptions = { ...advancedOptions, ...changes.layoutSimplificationAdvancedOptions.newValue };
    console.log('Layout simplification advanced options updated:', advancedOptions);
    applyLayoutSimplification();
  }
});

// Initialize the feature when the script is loaded
initLayoutSimplification(layoutSimplificationEnabled, advancedOptions);

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initLayoutSimplification,
    applyLayoutSimplification,
    simplifyLayout,
    restoreLayout
  };
}
