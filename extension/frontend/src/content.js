// content.js - Handles screen capturing on demand

// Configuration

const config = {
  captureDelay: 500,      // Delay between captures in ms
  scrollStep: 800,        // How many pixels to scroll each time
  maxScrolls: 1,         // Maximum number of screenshots to take
  minScrollHeight: 1600   // Only auto-capture if page is at least this tall
};

// State
let state = {
  isCapturing: false,
  captureCount: 0,
  currentScroll: 0,
  pageHeight: 0,
  viewportHeight: 0
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SCAN_NOW") {
    console.log("Received SCAN_NOW command");
    startCapture();
    sendResponse({ success: true, message: "Started capture" });
    return true; // Keep the message channel open
  }
  
  if (message.action === "STOP_CAPTURE") {
    console.log("Received STOP_CAPTURE command");
    stopCapture();
    sendResponse({ 
      success: true, 
      message: "Stopped capture", 
      data: { captureCount: state.captureCount }
    });
    return true;
  }
  
  if (message.action === "GET_STATUS") {
    console.log("Received GET_STATUS command");
    sendResponse({ 
      success: true, 
      data: {
        isCapturing: state.isCapturing,
        captureCount: state.captureCount,
        currentScroll: state.currentScroll,
        pageHeight: state.pageHeight,
        progress: state.pageHeight ? Math.min(100, Math.round((state.currentScroll / state.pageHeight) * 100)) : 0
      }
    });
    return true;
  }
});

// Initialize when the script loads
function initialize() {
  console.log("Screenshot capture script loaded");
  updateDimensions();
  
  // Listen for window resize
  window.addEventListener('resize', updateDimensions);
}

// Update page dimensions
function updateDimensions() {
  state.pageHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  
  state.viewportHeight = window.innerHeight;
  
  console.log(`Page dimensions: ${state.pageHeight}px high, viewport: ${state.viewportHeight}px`);
}

// Start capturing screenshots
function startCapture() {
  if (state.isCapturing) {
    console.log("Already capturing, ignoring start request");
    return;
  }
  
  // Reset state
  state.isCapturing = true;
  state.captureCount = 0;
  state.currentScroll = window.scrollY;
  
  // Update dimensions
  updateDimensions();
  
  // Scroll to top first
  console.log("Scrolling to top of page first");
  window.scrollTo({ top: 0, behavior: 'instant' });
  state.currentScroll = 0;
  
  // Start the capture process
  console.log("Starting capture process");
  setTimeout(captureAndScroll, 500);
}

// Stop the capturing process
function stopCapture() {
  state.isCapturing = false;
  console.log(`Capture stopped. Took ${state.captureCount} screenshots.`);
  
  // Send message to background script with results
  chrome.runtime.sendMessage({
    action: "SCAN_COMPLETE",
    data: {
      url: window.location.href,
      title: document.title,
      captureCount: state.captureCount,
      timestamp: new Date().toISOString()
    }
  });
}

// Capture the current screen and scroll to the next position
function captureAndScroll() {
  if (!state.isCapturing) return;
  
  // Check if we've reached the limit
  if (state.captureCount >= config.maxScrolls) {
    console.log(`Reached maximum number of screenshots (${config.maxScrolls})`);
    stopCapture();
    return;
  }
  
  // Take a screenshot of the current viewport
  captureCurrentScreen();
  
  // Check if we've reached the end of the page
  if (state.currentScroll + state.viewportHeight >= state.pageHeight) {
    console.log("Reached end of page, stopping capture");
    stopCapture();
    return;
  }
  
  // Scroll to next position
  const nextScroll = Math.min(
    state.currentScroll + config.scrollStep,
    state.pageHeight - state.viewportHeight
  );
  
  console.log(`Scrolling to ${nextScroll}px`);
  window.scrollTo({ top: nextScroll, behavior: 'instant' });
  state.currentScroll = nextScroll;
  
  // Wait a bit for any lazy-loaded content to appear, then continue
  setTimeout(captureAndScroll, config.captureDelay);
}


// Show visual feedback that a screenshot was taken
function showScreenshotFeedback() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  overlay.style.transition = 'opacity 0.5s';
  
  document.body.appendChild(overlay);
  
  // Animate and remove
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 500);
  }, 100);
}

// In content.js, update the captureCurrentScreen function:
function captureCurrentScreen() {
  // Log the capture
  state.captureCount++;
  console.log(`CAPTURED: Screenshot #${state.captureCount} at scroll position ${state.currentScroll}px`);
  
  // Send message to background script to actually take the screenshot
  chrome.runtime.sendMessage({
    action: "TAKE_SCREENSHOT",
    data: {
      scrollPosition: state.currentScroll,
      viewportHeight: state.viewportHeight,
      captureNumber: state.captureCount,
      timestamp: new Date().toISOString()
    }
  });
  
  // Show visual feedback that screenshot was taken
  showScreenshotFeedback();
}

// Run initialization when the script loads
initialize();