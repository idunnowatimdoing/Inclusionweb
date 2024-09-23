// Helper function to send messages to the background script
function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const toggleMagnification = document.getElementById('toggleMagnification');
  const toggleColorCorrection = document.getElementById('toggleColorCorrection');
  const toggleSimplification = document.getElementById('toggleSimplification');
  const colorBlindnessType = document.getElementById('colorBlindnessType');

  // Load current states from chrome.storage.sync
  chrome.storage.sync.get(['magnificationEnabled', 'colorCorrectionEnabled', 'layoutSimplificationEnabled', 'colorBlindnessType'], function(options) {
    toggleMagnification.checked = options.magnificationEnabled || false;
    toggleColorCorrection.checked = options.colorCorrectionEnabled || false;
    toggleSimplification.checked = options.layoutSimplificationEnabled || false;
    colorBlindnessType.value = options.colorBlindnessType || 'normal';
  });

  // Update chrome.storage.sync on toggle changes
  toggleMagnification.addEventListener('change', function() {
    chrome.storage.sync.set({ magnificationEnabled: this.checked }, updateContentScript);
  });

  toggleColorCorrection.addEventListener('change', function() {
    chrome.storage.sync.set({ colorCorrectionEnabled: this.checked }, updateContentScript);
  });

  toggleSimplification.addEventListener('change', function() {
    chrome.storage.sync.set({ layoutSimplificationEnabled: this.checked }, updateContentScript);
  });

  colorBlindnessType.addEventListener('change', function() {
    chrome.storage.sync.set({ colorBlindnessType: this.value }, updateContentScript);
  });

  // Function to inform the content script about changes
  function updateContentScript() {
    sendMessageToBackground({ action: "updateFeatures" })
      .then(response => {
        console.log('Features updated:', response);
      })
      .catch(error => {
        console.error('Error updating features:', error);
      });
  }

  // Open options page when Advanced Options is clicked
  document.getElementById('advancedOptionsLink').addEventListener('click', function(e) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
