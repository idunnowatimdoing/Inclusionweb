{
  "manifest_version": 3,
  "name": "InclusiveWeb Solutions Accessibility Extension",
  "version": "1.0",
  "description": "An accessibility extension with text magnification, color correction, layout simplification, focus zoom, text-to-speech, and customizable keyboard shortcuts.",
  "permissions": [
    "activeTab",
    "storage",
    "commands"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "InclusiveWeb Solutions"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": [
        "styles.css"
      ],
      "matches": ["<all_urls>"]
    }
  ],
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  "icons": {
    "48": "icon48.png",
    "128": "icon128.png"
  },
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+F",
        "mac": "Command+Shift+F"
      },
      "description": "Open extension popup"
    }
  }
}
"background": {
  "service_worker": "background.js",
  "type": "module"
}
"commands": {
  "_execute_action": {
    "suggested_key": {
      "default": "Ctrl+Shift+F",
      "mac": "Command+Shift+F"
    },
    "description": "Open extension popup"
  },
  "toggleMagnification": {
    "suggested_key": {
      "default": "Ctrl+Shift+M",
      "mac": "Command+Shift+M"
    },
    "description": "Toggle Magnification"
  }
  // Add more commands as needed
}
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
