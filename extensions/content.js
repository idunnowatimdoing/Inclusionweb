// Function to initialize text magnification
function initTextMagnification(level) {
  console.log('Initializing text magnification with level:', level);
  // Add your magnification logic here
}

// Function to initialize color correction
function initColorCorrection(type) {
  console.log('Initializing color correction with type:', type);
  // Add your color correction logic here
}

// Function to initialize layout simplification
function initLayoutSimplification(enabled) {
  console.log('Initializing layout simplification:', enabled);
  // Add your layout simplification logic here
}

// Function to initialize keyboard shortcuts
function initKeyboardShortcuts() {
  console.log('Initializing keyboard shortcuts');
  // Add your keyboard shortcut logic here
}

// Function to initialize text-to-speech
function initTextToSpeech() {
  console.log('Initializing text-to-speech');
  // Add your text-to-speech logic here
}

// Function to initialize focus zoom
function initFocusZoom(enabled, level) {
  console.log('Initializing focus zoom:', enabled, level);
  // Add your focus zoom logic here
}

// Function to initialize all features
function initFeatures() {
  console.log('Initializing features');
  // Retrieve user settings from chrome.storage.sync
  chrome.storage.sync.get(null, function(result) {
    if (chrome.runtime.lastError) {
      console.error('Failed to get options:', chrome.runtime.lastError);
      return;
    }

    const options = result || {};
    console.log('Options received:', options);

    // Initialize each feature based on options
    initTextMagnification(options.magnificationLevel || 1.5);
    initColorCorrection(options.colorBlindnessType || 'normal');
    initLayoutSimplification(options.layoutSimplificationEnabled || false);
    initKeyboardShortcuts();
    initTextToSpeech();
    initFocusZoom(options.focusZoomEnabled || false, options.focusZoomLevel || 2);
  });
}

// Initialize features when content script loads
initFeatures();

// Listen for messages from popup or background scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received in content script:', request);
  
  if (request.action === "updateFeatures") {
    // Re-initialize features with updated options
    initFeatures();
    sendResponse({ status: 'Features updated in content script' });
  }

  return true;
});
"web_accessible_resources": [
  {
    "resources": [
      "features/textMagnification.js",
      "features/colorCorrection.js",
      "features/layoutSimplification.js",
      "features/keyboardShortcuts.js"
    ],
    "matches": ["<all_urls>"]
  }
]
