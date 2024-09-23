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

// Define global variable for shortcuts
let shortcuts = {};

// Initialize keyboard shortcuts from storage
function initKeyboardShortcuts() {
  getStorageData('keyboardShortcuts', function(result, error) {
    if (error) {
      console.error('Error getting keyboard shortcuts:', error);
    } else {
      shortcuts = result.keyboardShortcuts || {};
      console.log('Initialized keyboard shortcuts:', shortcuts);
      addKeyboardListeners(); // Add event listeners for shortcuts
    }
  });
}

// Add keyboard listeners for detecting key combinations
function addKeyboardListeners() {
  // Remove previous event listener to prevent duplication
  document.removeEventListener('keydown', handleKeyPress);
  
  // Add the keydown event listener
  document.addEventListener('keydown', handleKeyPress);
  console.log('Keyboard listeners added');
}

// Handle keypress events and match against the saved shortcuts
function handleKeyPress(event) {
  const pressedKeys = [];

  // Track modifier keys (Ctrl, Alt, Shift)
  if (event.ctrlKey) pressedKeys.push('Ctrl');
  if (event.altKey) pressedKeys.push('Alt');
  if (event.shiftKey) pressedKeys.push('Shift');

  // Add the main key (e.g., M, C, etc.)
  pressedKeys.push(event.key.toUpperCase());

  // Construct the key combination string
  const shortcutKey = pressedKeys.join('+');

  // Check if the pressed keys match any saved shortcut
  if (shortcuts[shortcutKey]) {
    event.preventDefault(); // Prevent default browser action
    console.log(`Shortcut triggered: ${shortcutKey} for action ${shortcuts[shortcutKey]}`);
    triggerAction(shortcuts[shortcutKey]); // Trigger the associated action
  }
}

// Trigger specific action based on the shortcut
function triggerAction(action) {
  switch (action) {
    case 'toggleMagnification':
      chrome.runtime.sendMessage({ action: "toggleMagnification" }, handleActionResponse);
      break;
    case 'toggleColorCorrection':
      chrome.runtime.sendMessage({ action: "toggleColorCorrection" }, handleActionResponse);
      break;
    case 'toggleLayoutSimplification':
      chrome.runtime.sendMessage({ action: "toggleLayoutSimplification" }, handleActionResponse);
      break;
    default:
      console.error(`Unknown action: ${action}`);
  }
}

// Handle the response from the background or content script
function handleActionResponse(response) {
  if (chrome.runtime.lastError) {
    console.error('Error triggering action:', chrome.runtime.lastError);
  } else {
    console.log('Action triggered successfully:', response);
  }
}

// Function to update or add a new keyboard shortcut
function updateShortcut(action, keys) {
  if (!action || !keys) {
    console.error('Invalid action or keys:', { action, keys });
    return;
  }

  // Remove old shortcut if it exists
  Object.keys(shortcuts).forEach(shortcut => {
    if (shortcuts[shortcut] === action) {
      delete shortcuts[shortcut];
    }
  });

  // Add the new shortcut
  shortcuts[keys] = action;

  // Save the updated shortcuts to storage
  setStorageData({ keyboardShortcuts: shortcuts }, function(error) {
    if (error) {
      console.error('Error saving keyboard shortcuts:', error);
    } else {
      console.log('Keyboard shortcuts updated:', shortcuts);
      addKeyboardListeners(); // Rebind listeners with updated shortcuts
    }
  });
}

// Initialize the keyboard shortcuts when the script is loaded
initKeyboardShortcuts();

// Export functions if needed for external usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initKeyboardShortcuts,
    updateShortcut
  };
}
