import React from 'react'

const EcoRatingContent = () => {
    return (
        <div>
            {/* Sustainability Overview */}
            <h3 className="text-lg font-medium text-green-600 mb-4">Our Sustainability Assessment</h3>
            <ul className="space-y-4">
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    🌎
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Overall Rating</span> – 0-10 scale measuring product sustainability</p>
                </li>
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    🔍
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Materials Analysis</span> – Evaluation of material sustainability</p>
                </li>
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    📦
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Packaging Score</span> – Assessment of packaging sustainability</p>
                </li>
            </ul>

            <h3 className="text-lg font-medium text-green-600 mb-4 mt-6">What We Evaluate</h3>
            <ul className="space-y-4">
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    ♻️
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Recyclability</span> – Potential for recycling at end of life</p>
                </li>
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    🌱
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Sustainable Sourcing</span> – Origin and production methods</p>
                </li>
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    ⚠️
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Greenwashing Risk</span> – Evaluation of sustainability claims</p>
                </li>
            </ul>
        </div>
    );
}

export default EcoRatingContent