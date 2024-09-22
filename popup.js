document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('toggle');
  
    // Get the current state from storage
    chrome.storage.sync.get(['wasdEnabled'], function (data) {
      toggle.checked = !!data.wasdEnabled;
    });
  
    toggle.addEventListener('change', function () {
      const isEnabled = toggle.checked;
      // Save the state
      chrome.storage.sync.set({ wasdEnabled: isEnabled });
  
      // Send a message to the content script
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: isEnabled ? 'enable' : 'disable' });
      });
    });
  });
  