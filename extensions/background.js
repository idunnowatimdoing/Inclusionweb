console.log('Background service worker loaded');

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

// Listen for installation or update
chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension installed');
  // Set default options
  setStorageData({
    magnificationLevel: 1.5,
    colorBlindnessType: 'normal',
    layoutSimplificationEnabled: false,
    colorCorrectionEnabled: false,
    magnificationEnabled: false
  }, function(error) {
    if (error) {
      console.error('Error setting default options:', error);
    } else {
      console.log('Default settings initialized');
    }
  });
});

// Listen for messages from content scripts or popup pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);

  if (request.action === "getOptions") {
    getStorageData(null, (result, error) => {
      if (error) {
        console.error('Error getting options:', error);
        sendResponse({error: 'Failed to get options'});
      } else {
        console.log('Sending options:', result);
        sendResponse({options: result});
      }
    });
    return true; // Indicates that the response will be sent asynchronously
  }

  if (request.action === "updateFeatures") {
    console.log('Updating features');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "updateFeatures"}, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error updating features:', chrome.runtime.lastError);
          sendResponse({error: 'Failed to update features'});
        } else {
          console.log('Features updated:', response);
          sendResponse({result: 'Features updated'});
        }
      });
    });
    return true; // Indicates that the response will be sent asynchronously
  }

  // If no matching action is found
  sendResponse({error: "Unknown action"});
  return true;
});

// Handle icon click (optional, can be customized based on action)
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked');
});
// background.js

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command received:', command);
  switch (command) {
    case 'toggleMagnification':
      // Handle toggling magnification
      break;
    case 'toggleColorCorrection':
      // Handle toggling color correction
      break;
    case 'toggleLayoutSimplification':
      // Handle toggling layout simplification
      break;
    // Add more cases as needed
  }
});

