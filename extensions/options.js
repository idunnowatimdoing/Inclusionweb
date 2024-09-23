// Helper function to check for valid keyboard shortcuts
function isValidShortcut(shortcut) {
  const validKeys = ['Ctrl', 'Alt', 'Shift'];
  const parts = shortcut.split('+');

  return (
    parts.length >= 2 && 
    parts.slice(0, -1).every(part => validKeys.includes(part)) && 
    /^[A-Z]$/.test(parts[parts.length - 1])
  );
}

// Function to validate all keyboard shortcuts
function validateShortcuts(shortcuts) {
  let hasError = false;
  
  Object.entries(shortcuts).forEach(([action, shortcut]) => {
    const inputField = document.getElementById(action + 'Shortcut');
    
    if (shortcut && !isValidShortcut(shortcut)) {
      inputField.classList.add('error');
      hasError = true;
    } else {
      inputField.classList.remove('error');
    }
  });

  if (hasError) {
    const status = document.getElementById('status');
    status.textContent = 'Invalid shortcuts. Use Ctrl/Alt/Shift + Letter.';
    status.style.color = 'red';
    return false;
  }

  return true;
}

// Display current shortcuts
function displayCurrentShortcuts() {
  chrome.storage.sync.get('keyboardShortcuts', function(result) {
    const shortcuts = result.keyboardShortcuts || {};
    document.getElementById('toggleMagnificationShortcut').value = shortcuts.toggleMagnification || '';
    document.getElementById('toggleColorCorrectionShortcut').value = shortcuts.toggleColorCorrection || '';
    document.getElementById('toggleLayoutSimplificationShortcut').value = shortcuts.toggleLayoutSimplification || '';
    document.getElementById('toggleFocusZoomShortcut').value = shortcuts.toggleFocusZoom || '';
    document.getElementById('toggleTTSShortcut').value = shortcuts.toggleTTS || '';
  });
}

// Populate TTS voices
function populateTTSVoices() {
  const voiceSelect = document.getElementById('ttsVoice');
  voiceSelect.innerHTML = '';  // Clear existing options

  const voices = speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    speechSynthesis.onvoiceschanged = populateTTSVoices;
    return;
  }

  voices.forEach(voice => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  });
}

// Save options to chrome.storage
function saveOptions() {
  const magnificationLevel = document.getElementById('magnificationLevel').value;
  const colorBlindnessType = document.getElementById('colorBlindnessType').value;
  const layoutSimplificationEnabled = document.getElementById('layoutSimplificationEnabled').checked;
  
  const advancedLayoutOptions = {
    hideImages: document.getElementById('hideImages').checked,
    simplifyFonts: document.getElementById('simplifyFonts').checked,
    increaseParagraphSpacing: document.getElementById('increaseParagraphSpacing').checked,
    removeBackgroundImages: document.getElementById('removeBackgroundImages').checked,
    highlightLinks: document.getElementById('highlightLinks').checked
  };

  const focusZoomEnabled = document.getElementById('focusZoomEnabled').checked;
  const focusZoomLevel = document.getElementById('focusZoomLevel').value;

  const ttsSettings = {
    enabled: document.getElementById('ttsEnabled').checked,
    voice: document.getElementById('ttsVoice').value,
    rate: parseFloat(document.getElementById('ttsRate').value),
    pitch: parseFloat(document.getElementById('ttsPitch').value)
  };

  const keyboardShortcuts = {
    toggleMagnification: document.getElementById('toggleMagnificationShortcut').value,
    toggleColorCorrection: document.getElementById('toggleColorCorrectionShortcut').value,
    toggleLayoutSimplification: document.getElementById('toggleLayoutSimplificationShortcut').value,
    toggleFocusZoom: document.getElementById('toggleFocusZoomShortcut').value,
    toggleTTS: document.getElementById('toggleTTSShortcut').value
  };

  // Validate shortcuts
  if (!validateShortcuts(keyboardShortcuts)) return;

  chrome.storage.sync.set({
    magnificationLevel: parseFloat(magnificationLevel),
    colorBlindnessType: colorBlindnessType,
    layoutSimplificationEnabled: layoutSimplificationEnabled,
    layoutSimplificationAdvancedOptions: advancedLayoutOptions,
    focusZoomEnabled: focusZoomEnabled,
    focusZoomLevel: parseFloat(focusZoomLevel),
    ttsSettings: ttsSettings,
    keyboardShortcuts: keyboardShortcuts
  }, function() {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    status.style.color = 'green';
    setTimeout(() => { status.textContent = ''; }, 3000);

    // Update keyboard shortcuts (you may need to implement updateShortcut in your features/keyboardShortcuts.js)
    Object.entries(keyboardShortcuts).forEach(([action, keys]) => {
      if (keys) {
        console.log(`Updating shortcut for ${action}: ${keys}`);
        updateShortcut(action, keys);  // Function to update shortcuts
      }
    });

    // Notify content script to update features
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "updateFeatures"}, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error updating features:', chrome.runtime.lastError);
        } else {
          console.log('Features updated successfully:', response);
        }
      });
    });
  });
}

// Restore options on page load
function restoreOptions() {
  chrome.storage.sync.get(null, function(items) {
    document.getElementById('magnificationLevel').value = items.magnificationLevel || 1.5;
    document.getElementById('colorBlindnessType').value = items.colorBlindnessType || 'normal';
    document.getElementById('layoutSimplificationEnabled').checked = items.layoutSimplificationEnabled || false;
    
    if (items.layoutSimplificationAdvancedOptions) {
      document.getElementById('hideImages').checked = items.layoutSimplificationAdvancedOptions.hideImages || false;
      document.getElementById('simplifyFonts').checked = items.layoutSimplificationAdvancedOptions.simplifyFonts || false;
      document.getElementById('increaseParagraphSpacing').checked = items.layoutSimplificationAdvancedOptions.increaseParagraphSpacing || false;
      document.getElementById('removeBackgroundImages').checked = items.layoutSimplificationAdvancedOptions.removeBackgroundImages || false;
      document.getElementById('highlightLinks').checked = items.layoutSimplificationAdvancedOptions.highlightLinks || false;
    }

    document.getElementById('focusZoomEnabled').checked = items.focusZoomEnabled || false;
    document.getElementById('focusZoomLevel').value = items.focusZoomLevel || 2;
    
    if (items.ttsSettings) {
      document.getElementById('ttsEnabled').checked = items.ttsSettings.enabled || false;
      document.getElementById('ttsVoice').value = items.ttsSettings.voice || '';
      document.getElementById('ttsRate').value = items.ttsSettings.rate || 1;
      document.getElementById('ttsPitch').value = items.ttsSettings.pitch || 1;
    }

    displayCurrentShortcuts();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  restoreOptions();
  populateTTSVoices();

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateTTSVoices;
  }
});

// Save options when the "Save" button is clicked
document.getElementById('saveOptions').addEventListener('click', saveOptions);

// Magnification level input event
document.getElementById('magnificationLevel').addEventListener('input', function(event) {
  document.getElementById('magnificationValue').textContent = event.target.value + 'x';
});

// Focus zoom level input event
document.getElementById('focusZoomLevel').addEventListener('input', function(event) {
  document.getElementById('focusZoomValue').textContent = event.target.value + 'x';
});

// TTS rate input event
document.getElementById('ttsRate').addEventListener('input', function(event) {
  document.getElementById('ttsRateValue').textContent = event.target.value + 'x';
});

// TTS pitch input event
document.getElementById('ttsPitch').addEventListener('input', function(event) {
  document.getElementById('ttsPitchValue').textContent = event.target.value;
});

// Toggle visibility of advanced layout options
document.getElementById('layoutSimplificationEnabled').addEventListener('change', function(event) {
  document.getElementById('advancedLayoutOptions').style.display = event.target.checked ? 'block' : 'none';
});
