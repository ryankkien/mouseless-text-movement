(function () {
    let enabled = false;
    let fakeCursor = null;
  
    function moveSelection(dx, dy) {
      const selection = window.getSelection();
  
      if (selection.rangeCount === 0) {
        const body = document.body;
        const range = document.createRange();
        range.selectNodeContents(body);
        range.collapse(true);
        selection.addRange(range);
      }
  
      if (dx !== 0) {
        if (dx > 0) {
          selection.modify('move', 'forward', 'character');
        } else {
          selection.modify('move', 'backward', 'character');
        }
      }
  
      if (dy !== 0) {
        if (dy > 0) {
          selection.modify('move', 'forward', 'line');
        } else {
          selection.modify('move', 'backward', 'line');
        }
      }
  
      moveFakeCursorToSelection();
    }
  
    function moveFakeCursorToSelection() {
      if (!fakeCursor) {
        fakeCursor = document.createElement('div');
        fakeCursor.style.position = 'absolute';
        fakeCursor.style.width = '2px';
        fakeCursor.style.height = '1em';
        fakeCursor.style.backgroundColor = 'red';
        fakeCursor.style.zIndex = 9999;
        document.body.appendChild(fakeCursor);
      }
  
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        return;
      }
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();
  
      if (rects.length > 0) {
        const rect = rects[0];
        fakeCursor.style.left = `${rect.left + window.scrollX}px`;
        fakeCursor.style.top = `${rect.top + window.scrollY}px`;
      }
    }
  
    function onKeyDown(event) {
      if (!enabled) return;
  
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
        // Don't interfere with typing in input fields
        return;
      }
  
      let handled = false;
  
      switch (event.key.toLowerCase()) {
        case 'w':
          moveSelection(0, -1);
          handled = true;
          break;
        case 'a':
          moveSelection(-1, 0);
          handled = true;
          break;
        case 's':
          moveSelection(0, 1);
          handled = true;
          break;
        case 'd':
          moveSelection(1, 0);
          handled = true;
          break;
      }
  
      if (handled) {
        event.preventDefault();
      }
    }
  
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      if (message.action === 'enable') {
        enableWASDNavigation();
      } else if (message.action === 'disable') {
        disableWASDNavigation();
      }
    });
  
    function enableWASDNavigation() {
      if (!enabled) {
        enabled = true;
        document.addEventListener('keydown', onKeyDown, true);
      }
    }
  
    function disableWASDNavigation() {
      if (enabled) {
        enabled = false;
        document.removeEventListener('keydown', onKeyDown, true);
        if (fakeCursor) {
          fakeCursor.remove();
          fakeCursor = null;
        }
      }
    }
  
    // Check initial state
    chrome.storage.sync.get(['wasdEnabled'], function (data) {
      if (data.wasdEnabled) {
        enableWASDNavigation();
      }
    });
  })();
  