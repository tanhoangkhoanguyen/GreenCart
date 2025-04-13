import React, { useState, useEffect } from 'react';

const ProductAnalysis = ({ analysisData, onBackToMain, onScanAgain, loading }) => {
    const [isLoading, setIsLoading] = useState(!analysisData);
    const [error, setError] = useState(null);
    const [localAnalysisData, setLocalAnalysisData] = useState(analysisData);

    useEffect(() => {
        // If analysis data is provided as prop, use it directly
        if (analysisData) {
            setLocalAnalysisData(analysisData);
            setIsLoading(false);
            return;
        }

        // Otherwise, try to load from storage as a fallback
        if (window.chrome && chrome.storage) {
            chrome.storage.local.get(['analysisData', 'analysisError'], (result) => {
                if (result.analysisError) {
                    setError(result.analysisError);
                }

                if (result.analysisData) {
                    setLocalAnalysisData(result.analysisData);
                    console.log("Retrieved analysis data from chrome.storage:", result.analysisData);
                }

                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [analysisData]);

    // Helper function to get score color
    const getScoreColor = (score) => {
        if (score >= 7.5) return 'text-green-600';
        if (score >= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Helper function to get badge color for greenwashing risk
    const getGreenwashingBadgeColor = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function to generate rating stars
    const generateRatingStars = (score) => {
        const totalStars = 10;
        const fullStars = Math.floor(score || 0);
        const hasHalfStar = (score || 0) - fullStars >= 0.5;

        return (
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                    <svg key={`full-${i}`} className="w-4 h-4 text-green-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                ))}
                {hasHalfStar && (
                    <svg className="w-4 h-4 text-green-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                            fillOpacity="0.5" />
                    </svg>
                )}
                {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                    <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                ))}
                <span className="ml-2 text-sm font-semibold">
                    {(score || 0).toFixed(1)}/10
                </span>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-t-2 border-green-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 text-sm">Loading analysis...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-4">
                <svg className="w-12 h-12 text-red-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p className="mt-4 text-red-600 text-center font-medium">Error analyzing image</p>
                <p className="mt-2 text-gray-600 text-center text-sm">{error}</p>
                <button
                    onClick={onBackToMain}
                    className="mt-4 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                    Back to Scanner
                </button>
            </div>
        );
    }

    if (!localAnalysisData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="mt-4 text-gray-600 text-center">No analysis data available. Please scan a product first.</p>
                <button
                    onClick={onBackToMain}
                    className="mt-4 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                    Back to Scanner
                </button>
            </div>
        );
    }

    const { image_analysis, sustainability_analysis } = localAnalysisData;

    const onViewSecondHandMarket = () => {
        const websiteUrl = "http://localhost:5173/market";
        chrome.tabs.create({ url: websiteUrl });
    }

    return (
        <div className="p-4 w-full rounded-lg">
            {/* Header with back button */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <button
                        onClick={onBackToMain}
                        className="p-1 mr-2 rounded-full hover:bg-green-100"
                    >
                        <svg className="w-5 h-5 text-green-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800">{image_analysis?.product_name || 'Product Analysis'}</h1>
                </div>
            </div>

            <div className="max-h-[450px] overflow-y-auto bg-white rounded-lg shadow-sm">
                {/* Description */}
                <div className="p-4 border-b border-gray-100">
                    <p className="text-sm text-gray-600">{image_analysis?.description}</p>
                </div>

                {/* Materials */}
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Materials</h2>
                    <div className="flex flex-wrap gap-2">
                        {image_analysis?.visible_materials?.map((material, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {material}
                            </span>
                        ))}
                        {(!image_analysis?.visible_materials || image_analysis.visible_materials.length === 0) && (
                            <span className="text-xs text-gray-500">No materials detected</span>
                        )}
                    </div>
                </div>

                {/* Sustainability Score */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-medium text-gray-700">Overall Sustainability</h2>
                        <div className="flex items-center space-x-1">
                            {generateRatingStars(sustainability_analysis?.overall_sustainability_score)}
                        </div>
                    </div>
                    <p className="text-xs text-gray-600">{sustainability_analysis?.sustainability_justification}</p>
                </div>

                {/* Detailed Scores */}
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-sm font-medium text-gray-700 mb-3">Detailed Scores</h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded">
                            <h3 className="text-xs font-medium text-gray-700 mb-1">Materials</h3>
                            <div className={`${getScoreColor(sustainability_analysis?.materials_sustainability)} text-sm font-semibold`}>
                                {(sustainability_analysis?.materials_sustainability || 0).toFixed(1)}/10
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded">
                            <h3 className="text-xs font-medium text-gray-700 mb-1">Packaging</h3>
                            <div className={`${getScoreColor(sustainability_analysis?.packaging_sustainability)} text-sm font-semibold`}>
                                {(sustainability_analysis?.packaging_sustainability || 0).toFixed(1)}/10
                            </div>
                        </div>
                    </div>

                    <div className="mt-3">
                        <h3 className="text-xs font-medium text-gray-700 mb-1">Greenwashing Risk</h3>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getGreenwashingBadgeColor(sustainability_analysis?.greenwashing_risk)}`}>
                            {sustainability_analysis?.greenwashing_risk || 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* Improvement Suggestions */}
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Improvement Suggestions</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        {sustainability_analysis?.improvement_suggestions?.map((suggestion, index) => (
                            <li key={index} className="text-xs text-gray-600">{suggestion}</li>
                        ))}
                        {(!sustainability_analysis?.improvement_suggestions || sustainability_analysis.improvement_suggestions.length === 0) && (
                            <span className="text-xs text-gray-500">No improvement suggestions available</span>
                        )}
                    </ul>
                </div>

                {/* Scan again button */}
                {/* Scan again button */}
                <div className="p-4">
                    <button
                        onClick={onScanAgain}
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded font-medium transition-colors ${loading
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                : 'bg-green-800 text-white hover:bg-green-900'
                            }`}
                    >
                        {loading ? 'Scanning...' : 'Scan Again'}
                    </button>

                    {/* View on second-hand market button */}
                    <button
                        onClick={onViewSecondHandMarket}
                        className="w-full mt-3 py-2 px-4 rounded font-medium bg-white border border-green-800 text-green-800 hover:bg-gray-200 transition-transform transform hover:scale-105"
                    >
                        View this product on our second-hand market
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProductAnalysis;