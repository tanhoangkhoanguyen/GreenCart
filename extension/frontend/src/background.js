// background.js - Handles messaging between content script and popup/JSX components

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "TAKE_SCREENSHOT" && sender.tab) {
    console.log("Taking screenshot for tab:", sender.tab.id, "position:", message.data.scrollPosition);

    // Take the actual screenshot
    chrome.tabs.captureVisibleTab(
      null, // current window
      { format: "jpeg", quality: 85 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error(`Error capturing screenshot: ${chrome.runtime.lastError.message}`);
          return;
        }

        // Create screenshot object with the data URL
        const screenshot = {
          dataUrl: dataUrl,
          captureNumber: message.data.captureNumber,
          scrollPosition: message.data.scrollPosition,
          timestamp: message.data.timestamp
        };

        // Download the screenshot
        downloadScreenshot(screenshot);
        
        // Send the screenshot to the Flask backend
        sendScreenshotToBackend(screenshot, sender.tab.url);
      }
    );
    return true;
  }

  // Handle carbon footprint data requests from content script
  if (message.action === "GET_CARBON_FOOTPRINT") {
    console.log("Getting carbon footprint data for:", message.data.productId);

    // This will communicate with your JSX components/popup
    getCarbonFootprintFromJSX(message.data, (footprintData) => {
      sendResponse({
        success: true,
        data: footprintData
      });
    });

    return true; // Keep the message channel open for the async response
  }
  
  // Handle scan complete message
  if (message.action === "SCAN_COMPLETE") {
    console.log("Scan complete, notifying popup:", message.data);
    // Forward to any open popups
    chrome.runtime.sendMessage(message);
    return true;
  }
});

// Function to download a screenshot
function downloadScreenshot(screenshot) {
  const filename = `screenshot_${screenshot.captureNumber}_${new Date().getTime()}.jpg`;

  // Create a download
  chrome.downloads.download({
    url: screenshot.dataUrl,
    filename: filename,
    saveAs: false
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error(`Error saving screenshot: ${chrome.runtime.lastError.message}`);
    } else {
      console.log(`Screenshot ${screenshot.captureNumber} downloaded successfully with ID: ${downloadId}`);
    }
  });
}

// Function to send screenshot to Flask backend
function sendScreenshotToBackend(screenshot, pageUrl) {
  // Flask backend URL (adjust as needed)
  const backendUrl = 'http://localhost:5000/upload_image';
  
  // Convert data URL to Blob
  const byteString = atob(screenshot.dataUrl.split(',')[1]);
  const mimeString = screenshot.dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: mimeString });
  
  // Create form data
  const formData = new FormData();
  formData.append('image', blob, `screenshot_${screenshot.captureNumber}.jpg`);
  // Add metadata that might be useful for the backend
  formData.append('captureNumber', screenshot.captureNumber);
  formData.append('timestamp', screenshot.timestamp);
  formData.append('pageUrl', pageUrl);
  
  // Send to backend
  fetch(backendUrl, {
    method: 'POST',
    body: formData,
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Screenshot analysis from backend:', data);
    
    // Based on the app.py code, the API response has an 'analysis' property
    // that contains the actual analysis data
    const analysisData = data.analysis;
    
    if (!analysisData || "error" in analysisData) {
      throw new Error(analysisData?.error || "Unknown error in analysis");
    }
    
    // Store analysis data in chrome.storage.local with a simple, consistent key
    chrome.storage.local.set({ analysisData: analysisData }, () => {
      console.log('Analysis data saved to chrome.storage.local with key: analysisData');
      
      // Log the data to verify what's being stored
      chrome.storage.local.get(['analysisData'], (result) => {
        console.log('Stored analysis data:', result.analysisData);
      });
    });
    
    // Notify any open popups about the analysis results
    chrome.runtime.sendMessage({
      action: 'IMAGE_ANALYSIS_COMPLETE',
      data: {
        captureNumber: screenshot.captureNumber,
        analysis: analysisData
      }
    });
  })
  .catch(error => {
    console.error('Error processing screenshot analysis:', error);
    
    // Store the error in storage
    chrome.storage.local.set({ 
      analysisError: error.message 
    }, () => {
      console.error('Error saved to chrome.storage.local');
    });
    
    // Notify any open popups about the error
    chrome.runtime.sendMessage({
      action: 'IMAGE_ANALYSIS_ERROR',
      error: error.message
    });
  });
}

// Function to get carbon footprint data from JSX components
function getCarbonFootprintFromJSX(productData, callback) {
  // In a real extension, this might involve communicating with a popup or background page
  // that contains your React/JSX components

  // For this example, we'll simulate the JSX response
  console.log("Requesting carbon footprint data from JSX components");

  // Simulate async communication with JSX components
  setTimeout(() => {
    // This simulates the response from your JSX component
    // In a real extension, this data would come from your React components
    const mockJSXResponse = {
      level: 'high', // This would come from your JSX component
      confidence: 0.95,
      source: 'carbon-api'
    };

    // Pass the data back to the content script
    callback(mockJSXResponse);

    // Also notify any open popups about this data
    chrome.runtime.sendMessage({
      action: "CARBON_DATA_UPDATED",
      data: {
        productId: productData.productId,
        footprint: mockJSXResponse
      }
    });
  }, 300);
}