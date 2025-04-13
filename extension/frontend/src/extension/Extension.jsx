import React, { useState, useEffect } from 'react';
import EcoRatingContent from './component/Tag';
import PriceComparision from './component/PriceComparision';
import ProductAnalysis from './component/ProductAnalysis';

function ExtensionPopup() {
    const [product, setProduct] = useState(null);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [productTitle, setProductTitle] = useState("Product");
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);

    // Function to check for analysis data in storage
    const checkForAnalysisData = () => {
        chrome.storage.local.get(['analysisData'], (result) => {
            if (result.analysisData) {
                setAnalysisData(result.analysisData);
                setShowAnalysis(true);
                setLoading(false);
                console.log("Found analysis data in storage:", result.analysisData);
            }
        });
    };

    useEffect(() => {
        // Load stored data when popup opens
        chrome.storage.local.get(['currentProduct', 'productTags', 'error', 'analysisData'], (result) => {
            if (result.currentProduct) {
                setProduct(result.currentProduct);
                // Try to extract a title from the product data
                if (result.currentProduct.pageType === 'product' && result.currentProduct.products?.[0]?.title) {
                    setProductTitle(result.currentProduct.products[0].title);
                } else if (result.currentProduct.pageTitle) {
                    setProductTitle("Products on " + result.currentProduct.pageTitle);
                }
            }
            if (result.productTags) setTags(result.productTags);
            if (result.error) setError(result.error);
            
            // Check if we have analysis data and show the analysis view
            if (result.analysisData) {
                setAnalysisData(result.analysisData);
                setShowAnalysis(true);
                console.log("Found analysis data in storage:", result.analysisData);
            }
        });

        // Set up a listener for messages from content script and background
        const messageListener = (message, sender, sendResponse) => {
            console.log("Received message:", message.action);
            
            if (message.action === "SCAN_COMPLETE") {
                if (message.product) {
                    setProduct(message.product);
                    console.log("Scan complete:", message.product);

                    // Update product title based on scan results
                    if (message.product.pageType === 'product' && message.product.products?.[0]?.title) {
                        setProductTitle(message.product.products[0].title);
                    } else if (message.product.pageTitle) {
                        setProductTitle("Products on " + message.product.pageTitle);
                    }
                }
                if (message.tags) setTags(message.tags);
            } else if (message.action === "SCAN_ERROR") {
                setLoading(false);
                setError(message.error || "Unknown error occurred");
                console.error("Scan error:", message.error);
            } else if (message.action === "IMAGE_ANALYSIS_COMPLETE") {
                // Access the analysis data directly from the message
                if (message.data && message.data.analysis) {
                    setAnalysisData(message.data.analysis);
                    setShowAnalysis(true);
                    setLoading(false);
                    console.log("Received analysis data:", message.data.analysis);
                } else {
                    // If the message doesn't contain the data directly, check storage
                    checkForAnalysisData();
                }
            } else if (message.action === "IMAGE_ANALYSIS_ERROR") {
                setLoading(false);
                setError(message.error || "Analysis failed");
                console.error("Analysis error:", message.error);
            }
        };

        // Listen for storage changes
        const handleStorageChange = (changes, area) => {
            if (area === 'local') {
                if (changes.analysisData && changes.analysisData.newValue) {
                    console.log("Storage: analysis data updated", changes.analysisData.newValue);
                    setAnalysisData(changes.analysisData.newValue);
                    setShowAnalysis(true);
                    setLoading(false);
                }
                if (changes.analysisError && changes.analysisError.newValue) {
                    console.error("Storage: analysis error updated", changes.analysisError.newValue);
                    setError(changes.analysisError.newValue);
                    setLoading(false);
                }
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);
        chrome.storage.onChanged.addListener(handleStorageChange);

        // Clean up listeners when component unmounts
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    const handleScanClick = () => {
        setLoading(true);
        setError(null);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) {
                setLoading(false);
                setError("No active tab found");
                return;
            }

            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "SCAN_NOW" },
                (response) => {
                    if (chrome.runtime.lastError) {
                        setLoading(false);
                        setError("Error communicating with page. Make sure you're on a supported shopping site.");
                        console.error("Error sending message:", chrome.runtime.lastError);
                        return;
                    }

                    if (response && response.success) {
                        console.log("SCAN RESULTS:", response.data);
                        // Keep loading state true until analysis is complete
                    } else {
                        setLoading(false);
                    }
                }
            );
        });
    };

    const openWebsite = () => {
        // Replace with your actual website URL
        const websiteUrl = "http://localhost:5173/";
        chrome.tabs.create({ url: websiteUrl });
    };

    const [activeTab, setActiveTab] = useState('ecoRating');
    
    // Function to handle going back to the main view
    const handleBackToMain = () => {
        setShowAnalysis(false);
    };
    
    // Function to clear the analysis and start a new scan
    const handleScanAgain = () => {
        // Clear analysis data from storage
        chrome.storage.local.remove(['analysisData', 'analysisError'], () => {
            setAnalysisData(null);
            setShowAnalysis(false);
            // Start a new scan
            handleScanClick();
        });
    };

    // Show loading screen while waiting for analysis
    if (loading && !showAnalysis) {
        return (
            <div className="p-4 w-96 rounded-lg">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-[#3c5d55]">🌱 GreenCart</h1>
                </div>
                
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 border-4 border-t-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h2 className="text-lg font-medium text-gray-800 mb-2">Analyzing Product</h2>
                    <p className="text-gray-600 text-center max-w-xs">
                        Please wait while we scan the product and analyze its sustainability...
                    </p>
                </div>
                
                {error && (
                    <div className="mt-4 px-4 py-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // If we should show the analysis view
    if (showAnalysis && analysisData) {
        return <ProductAnalysis 
            analysisData={analysisData}
            onBackToMain={handleBackToMain}
            onScanAgain={handleScanAgain}
            loading={loading}
        />;
    }

    // Otherwise show the default extension popup
    return (
        <div className="p-4 w-96 rounded-lg">
            <div className="flex justify-between items-center">
                <button
                    onClick={openWebsite}
                    className="text-xl font-bold mb-2 text-[#3c5d55] bg-transparent border-none cursor-pointer"
                >
                    🌱GreenCart
                </button>
            </div>

            <div className="my-3">
                <button
                    onClick={handleScanClick}
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded font-medium transition-colors ${loading
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-green-800 text-white hover:bg-green-900'
                        }`}
                >
                    {loading ? 'Scanning...' : 'Scan Product'}
                </button>
            </div>

            {error && (
                <div className="px-4 py-2 mb-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    className={`flex-1 py-3 px-5 text-center font-medium ${activeTab === 'ecoRating' ? 'text-gray-900' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('ecoRating')}
                >
                    Eco Rating
                </button>
                <button
                    className={`flex-1 py-3 px-5 text-center font-medium ${activeTab === 'priceCompare' ? 'text-gray-900' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('priceCompare')}
                >
                    Price Compare
                </button>
            </div>

            <div className="flex">
                <div className={`h-1 flex-1 ${activeTab === 'ecoRating' ? 'bg-green-500' : 'bg-transparent'}`}></div>
                <div className={`h-1 flex-1 ${activeTab === 'priceCompare' ? 'bg-green-500' : 'bg-transparent'}`}></div>
            </div>

            <div className="p-5">
                {activeTab === 'ecoRating' ? <EcoRatingContent /> : <PriceComparision />}
            </div>
        </div>
    );
}

export default ExtensionPopup;