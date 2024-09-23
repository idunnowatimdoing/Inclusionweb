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

// Define global variables for color correction state
let colorCorrectionEnabled = false;
let currentColorBlindnessType = 'normal';

// Define color matrices for various types of color blindness
const colorMatrices = {
  normal: [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0
  ],
  protanopia: [
    0.567, 0.433, 0, 0, 0,
    0.558, 0.442, 0, 0, 0,
    0, 0.242, 0.758, 0, 0,
    0, 0, 0, 1, 0
  ],
  deuteranopia: [
    0.625, 0.375, 0, 0, 0,
    0.7, 0.3, 0, 0, 0,
    0, 0.3, 0.7, 0, 0,
    0, 0, 0, 1, 0
  ],
  tritanopia: [
    0.95, 0.05, 0, 0, 0,
    0, 0.433, 0.567, 0, 0,
    0, 0.475, 0.525, 0, 0,
    0, 0, 0, 1, 0
  ],
  achromatopsia: [
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0, 0, 0, 1, 0
  ],
  protanomaly: [
    0.817, 0.183, 0, 0, 0,
    0.333, 0.667, 0, 0, 0,
    0, 0.125, 0.875, 0, 0,
    0, 0, 0, 1, 0
  ],
  deuteranomaly: [
    0.8, 0.2, 0, 0, 0,
    0.258, 0.742, 0, 0, 0,
    0, 0.142, 0.858, 0, 0,
    0, 0, 0, 1, 0
  ],
  tritanomaly: [
    0.967, 0.033, 0, 0, 0,
    0, 0.733, 0.267, 0, 0,
    0, 0.183, 0.817, 0, 0,
    0, 0, 0, 1, 0
  ]
};

// Initialize the color correction feature
function initColorCorrection(type) {
  console.log('Initializing color correction with type:', type);
  currentColorBlindnessType = type;

  // Get the color correction enabled state from storage
  getStorageData('colorCorrectionEnabled', function(result, error) {
    if (error) {
      console.error('Error getting colorCorrectionEnabled:', error);
    } else {
      colorCorrectionEnabled = result.colorCorrectionEnabled || false;
      console.log('Color correction enabled:', colorCorrectionEnabled);
      applyColorCorrection();
    }
  });
}

// Apply the color correction filter
function applyColorCorrection() {
  console.log('Applying color correction. Enabled:', colorCorrectionEnabled, 'Type:', currentColorBlindnessType);
  if (colorCorrectionEnabled && currentColorBlindnessType !== 'normal') {
    const matrix = colorMatrices[currentColorBlindnessType];
    if (!matrix) {
      console.error('Invalid color blindness type:', currentColorBlindnessType);
      return;
    }

    // Create the SVG filter for color correction
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <filter id="colorBlindCorrection">
          <feColorMatrix type="matrix" values="${matrix.join(' ')}" />
        </filter>
      </svg>
    `;
    
    // Check if the filter is already added; otherwise, add it
    let div = document.getElementById('colorCorrectionSVG');
    if (!div) {
      div = document.createElement('div');
      div.id = 'colorCorrectionSVG';
      div.style.height = '0';
      div.style.width = '0';
      div.style.position = 'absolute';
      div.style.top = '-9999px';
      div.style.left = '-9999px';
      document.body.appendChild(div);
    }

    // Insert the SVG filter into the page and apply it
    div.innerHTML = svg;
    document.documentElement.style.filter = 'url(#colorBlindCorrection)';
    console.log('Color correction filter applied');
  } else {
    // Remove color correction if disabled or set to normal
    document.documentElement.style.filter = '';
    const existingSvg = document.getElementById('colorCorrectionSVG');
    if (existingSvg) {
      existingSvg.remove();
    }
    console.log('Color correction filter removed');
  }
}

// Listen for changes in the color correction settings
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.colorCorrectionEnabled) {
    colorCorrectionEnabled = changes.colorCorrectionEnabled.newValue;
    console.log('Color correction enabled changed to:', colorCorrectionEnabled);
    applyColorCorrection();
  }
  if (changes.colorBlindnessType) {
    currentColorBlindnessType = changes.colorBlindnessType.newValue;
    console.log('Color blindness type changed to:', currentColorBlindnessType);
    applyColorCorrection();
  }
});

// Initialize the feature when the script is loaded
initColorCorrection(currentColorBlindnessType);

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initColorCorrection,
    applyColorCorrection,
    colorMatrices
  };
}
