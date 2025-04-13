import React from 'react'

const PriceComparision = () => {
    return (
        <div>
            {/* Price Comparison Header */}
            <h3 className="text-md font-medium text-green-600 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Price Comparison
            </h3>

            {/* Store Price List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-md">EcoStore</span>
                    <span className="text-gray-900 text-md">$24.99</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-md">GreenLife</span>
                    <span className="text-gray-900 text-md">$26.50</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-md">NaturalThreads</span>
                    <span className="text-green-600 font-semibold text-md">$22.99 (Best Price)</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-md">EarthWear</span>
                    <span className="text-gray-900 text-md">$27.99</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-center gap-4">
                <button className="px-3 py-2 bg-green-800 text-white rounded-md font-medium hover:bg-green-900 transition-colors duration-200">
                    Visit Best Price
                </button>
            </div>
        </div>
    )
}

export default PriceComparision