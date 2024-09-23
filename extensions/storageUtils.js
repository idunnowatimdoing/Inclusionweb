// Function to check if a storage type (e.g., localStorage) is available
function storageAvailable(type) {
  try {
    const storage = window[type],
          x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

// Get data from Chrome storage or fallback to localStorage if needed
function getStorageData(key, callback) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    try {
      chrome.storage.sync.get(key, function(result) {
        if (chrome.runtime.lastError) {
          console.error('Chrome storage error:', chrome.runtime.lastError);
          getFallbackData(key, callback);
        } else {
          callback(result[key]);
        }
      });
    } catch (error) {
      console.error('Error accessing Chrome storage:', error);
      getFallbackData(key, callback);
    }
  } else {
    getFallbackData(key, callback);
  }
}

// Set data in Chrome storage or fallback to localStorage if needed
function setStorageData(data, callback) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    try {
      chrome.storage.sync.set(data, function() {
        if (chrome.runtime.lastError) {
          console.error('Chrome storage error:', chrome.runtime.lastError);
          setFallbackData(data, callback);
        } else {
          if (callback) callback();
        }
      });
    } catch (error) {
      console.error('Error accessing Chrome storage:', error);
      setFallbackData(data, callback);
    }
  } else {
    setFallbackData(data, callback);
  }
}

// Get data from localStorage as a fallback
function getFallbackData(key, callback) {
  if (storageAvailable('localStorage')) {
    const data = localStorage.getItem(key);
    try {
      callback(data ? JSON.parse(data) : null);
    } catch (e) {
      console.error('Error parsing localStorage data:', e);
      callback(null);
    }
  } else {
    console.error('No storage mechanism available');
    callback(null);
  }
}

// Set data in localStorage as a fallback
function setFallbackData(data, callback) {
  if (storageAvailable('localStorage')) {
    try {
      Object.keys(data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(data[key]));
      });
      if (callback) callback();
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
      if (callback) callback(e);
    }
  } else {
    console.error('No storage mechanism available');
    if (callback) callback(new Error('No storage mechanism available'));
  }
}

// Export functions for use in other files (Node.js/CommonJS pattern)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getStorageData,
    setStorageData
  };
}
