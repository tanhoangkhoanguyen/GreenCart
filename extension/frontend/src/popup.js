// popup.js - Controls for the screenshot capture extension

document.addEventListener('DOMContentLoaded', function() {
    // Get UI elements
    const startButton = document.getElementById('startCapture');
    const statusText = document.getElementById('status');
    const progressBar = document.getElementById('progress');
    const screenshotCount = document.getElementById('screenshotCount');
    const messageElement = document.getElementById('message');
    
    // Start capture button click
    if (startButton) {
      startButton.addEventListener('click', function() {
        startCapture();
      });
    }
    
    // Start capturing screenshots
    function startCapture() {
      // Get the current tab
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length === 0) {
          showMessage('No active tab found', 'error');
          return;
        }
        
        const tabId = tabs[0].id;
        
        // Start the capture via the content script
        chrome.tabs.sendMessage(
          tabId, 
          { action: "SCAN_NOW" }, 
          function(response) {
            if (chrome.runtime.lastError) {
              showMessage('Error communicating with page', 'error');
              console.error("Error:", chrome.runtime.lastError);
              return;
            }
            
            if (response && response.success) {
              showMessage('Starting page capture...', 'info');
              updateUI(true);
              
              // Start polling for status
              startStatusPolling(tabId);
            } else {
              showMessage('Failed to start capture', 'error');
            }
          }
        );
      });
    }
    
    // Status polling
    let statusPollInterval = null;
    
    function startStatusPolling(tabId) {
      // Clear any existing interval
      stopStatusPolling();
      
      // Start a new polling interval
      statusPollInterval = setInterval(() => {
        chrome.tabs.sendMessage(tabId, { action: "GET_STATUS" }, function(response) {
          if (chrome.runtime.lastError) {
            console.error(`Error getting status: ${chrome.runtime.lastError.message}`);
            return;
          }
          
          if (response && response.success) {
            updateStatus(response.data);
            
            // If capture has stopped, stop polling
            if (!response.data.isCapturing) {
              stopStatusPolling();
              updateUI(false);
              showMessage(`Capture complete: ${response.data.captureCount} screenshots`, 'success');
            }
          }
        });
      }, 500);
    }
    
    function stopStatusPolling() {
      if (statusPollInterval) {
        clearInterval(statusPollInterval);
        statusPollInterval = null;
      }
    }
    
    // Update status display
    function updateStatus(status) {
      if (!status) return;
      
      if (statusText) {
        if (status.isCapturing) {
          statusText.textContent = `Capturing page (${status.progress}% complete)`;
        } else {
          statusText.textContent = 'Ready to capture screenshots';
        }
      }
      
      if (progressBar) {
        progressBar.value = status.progress;
      }
      
      if (screenshotCount) {
        screenshotCount.textContent = status.captureCount || 0;
      }
    }
    
    // Update UI based on capture state
    function updateUI(isCapturing) {
      if (startButton) startButton.disabled = isCapturing;
      
      if (progressBar) {
        progressBar.style.display = isCapturing ? 'block' : 'none';
      }
    }
    
    // Show a message to the user
    function showMessage(message, type = 'info') {
      if (!messageElement) return;
      
      messageElement.textContent = message;
      messageElement.className = `message ${type}`;
      messageElement.style.display = 'block';
      
      // Hide after a delay
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 3000);
    }
    
    // Check initial status
    function checkInitialStatus() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length === 0) return;
        
        const tabId = tabs[0].id;
        
        chrome.tabs.sendMessage(tabId, { action: "GET_STATUS" }, function(response) {
          // Ignore errors, since the content script might not be loaded yet
          if (chrome.runtime.lastError) return;
          
          if (response && response.success) {
            updateStatus(response.data);
            
            // If already capturing, start polling
            if (response.data.isCapturing) {
              startStatusPolling(tabId);
              updateUI(true);
            }
          }
        });
      });
    }
    
    // Run initial check
    checkInitialStatus();
  });