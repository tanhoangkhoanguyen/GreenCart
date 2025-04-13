import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import banner from "../../assets/bg/banner.png"
import { SeedIcon, MenuIcon } from "../../assets/icon"
import { isAuthenticated, logoutUser } from "../Auth/authService";

const Searching = () => {
    const [location, setLocation] = useState('');
    const [budget, setBudget] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    // Check authentication status when component mounts
      useEffect(() => {
        const checkAuth = () => {
          const loggedIn = isAuthenticated();
          setIsLoggedIn(loggedIn);
          
          if (loggedIn) {
            // Get user data from localStorage
            try {
              const userData = JSON.parse(localStorage.getItem('userData'));
              setUser(userData);
            } catch (error) {
              console.error("Error parsing user data:", error);
            }
          }
        };
        checkAuth();
      }, []);

      const handleLogout = () => {
        logoutUser();
        setIsLoggedIn(false);
        setUser(null);
        // Optionally, you can redirect to login page
        // navigate('/login');
      };
    
    // Sample products data
    const [products, setProducts] = useState([
      {
        id: 1,
        name: "Eco-Friendly Water Bottle",
        price: 24.99,
        rating: 4.5,
        shop: "GreenEarth",
        image: "/api/placeholder/200/200"
      },
      {
        id: 2,
        name: "Bamboo Cutlery Set",
        price: 15.99,
        rating: 4.8,
        shop: "EcoLiving",
        image: "/api/placeholder/200/200"
      },
      {
        id: 3,
        name: "Reusable Produce Bags",
        price: 12.50,
        rating: 4.3,
        shop: "GreenEarth",
        image: "/api/placeholder/200/200"
      },
      {
        id: 4,
        name: "Solar Power Bank",
        price: 45.99,
        rating: 4.7,
        shop: "EcoTech",
        image: "/api/placeholder/200/200"
      }
    ]);
    
    // Filter states
    const [selectedShops, setSelectedShops] = useState([]);
    const [selectedRating, setSelectedRating] = useState(0);
    
    const handleSearch = () => {
      // This would handle the search functionality
      console.log('Searching for:', { location, budget });
    };
    
    const handleShopFilter = (shop) => {
      if (selectedShops.includes(shop)) {
        setSelectedShops(selectedShops.filter(s => s !== shop));
      } else {
        setSelectedShops([...selectedShops, shop]);
      }
    };
    
    return (
      <div className="flex items-center justify-center transition-all duration-1000 ease-in-out relative">
        <div className="relative z-10 text-center w-full flex flex-col min-h-screen">
          {/* Nav Bar */}
          <div className="flex flex-row justify-between px-10 items-center py-3 shadow-b-xl bg-[#4d6b5a]">
              {/* Icon */}
              <Link to="/" className="flex flex-row">
                  {SeedIcon} 
                  <h1 className="font-bold text-2xl text-neutral-300">GreenCart</h1>
              </Link>
              <div className="flex flex-row gap-4">
                  {isLoggedIn ? (
                               <>
                                 {/* Display user email or name if available */}
                                 {user && (
                                   <span className="text-neutral-300 mr-2 mt-1 font-semibold">
                                     Welcome, {user.email.split('@')[0]}
                                   </span>
                                 )}
                                 <button 
                                   onClick={handleLogout}
                                   className="font-semibold px-5 py-1 text-neutral-300 rounded-lg hover:scale-110"
                                 >
                                   Sign Out
                                 </button>
                               </>
                             ) : (
                               <Link to="/login" className="font-semibold px-5 py-1 text-neutral-300 rounded-lg hover:scale-110">
                                 Sign In
                               </Link>
                             )}
                  <div>
                      {MenuIcon}
                  </div>
              </div>
          </div>
  
          {/* Hero Section - Fixed height issue */}
          <div
            className="flex flex-col items-center justify-center text-center py-16"
            style={{
              backgroundImage: `url(${banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <h1 className="text-7xl font-medium mb-8 text-[rgba(93,64,55,0.9)]">
              <span className="font-bold text-[#5D4037]">Searching</span>
            </h1>
            
            <div className="flex rounded-full bg-white shadow-lg overflow-hidden max-w-4xl w-full mx-4">
              <div className="flex-grow flex items-center">
                <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                  type="text" 
                  className="flex-grow py-3 px-6 outline-none text-base"
                  placeholder="Search for an items..." 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div className="border-l border-gray-200">
                <select 
                  className="h-full py-3 px-6 outline-none text-gray-600 appearance-none bg-white cursor-pointer pr-8"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="">Budget Range</option>
                  <option value="500-1000">$5 - $10</option>
                  <option value="1000-1500">$10 - $50</option>
                  <option value="1500-2000">$50 - $100</option>
                  <option value="2000-2500">$100 - $250</option>
                  <option value="2500+">$250+</option>
                </select>
              </div>
              
              <button 
                className="bg-[#688268] hover:bg-[#425442] text-white px-6 py-3 font-medium text-sm uppercase tracking-wider"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>

          {/* Modified Filter and Items Display Section */}
          <div className="bg-[#eae9e3] flex flex-row flex-1">
            {/* Filter Section */}
            <div className="w-1/4 p-4">
              <div className="bg-white rounded-xl shadow-md p-6 h-full">
                <h2 className="text-2xl font-semibold text-[#4d6b5a] mb-6 text-left">
                  Filter
                </h2>
                
                {/* Shop Site Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-left text-[#5D4037]">
                    Shop Site
                  </h3>
                  <div className="space-y-2 text-left">
                    {['GreenEarth', 'EcoLiving', 'EcoTech'].map((shop) => (
                      <div key={shop} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={shop} 
                          className="h-4 w-4 text-[#688268] rounded"
                          checked={selectedShops.includes(shop)}
                          onChange={() => handleShopFilter(shop)}
                        />
                        <label htmlFor={shop} className="ml-2 text-gray-700">{shop}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rating Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-left text-[#5D4037]">
                    Rating
                  </h3>
                  <div className="space-y-2 text-left">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <input 
                          type="radio" 
                          id={`rating-${rating}`} 
                          name="rating"
                          className="h-4 w-4 text-[#688268]"
                          checked={selectedRating === rating}
                          onChange={() => setSelectedRating(rating)}
                        />
                        <label htmlFor={`rating-${rating}`} className="ml-2 text-gray-700">
                          {rating}+ Stars
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-left text-[#5D4037]">
                    Price Range
                  </h3>
                  <input 
                    type="range" 
                    min="0" 
                    max="250" 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">$0</span>
                    <span className="text-sm text-gray-600">$250+</span>
                  </div>
                </div>
                
                {/* Apply Filter Button */}
                <button className="w-full bg-[#688268] hover:bg-[#425442] text-white py-2 rounded-lg font-medium">
                  Apply Filters
                </button>
              </div>
            </div>
            
            {/* Products Display Section */}
            <div className="w-3/4 p-4">
              <div className="bg-white rounded-xl shadow-md p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-[#4d6b5a] text-left">
                    Products
                  </h2>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">Sort by:</span>
                    <select className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#688268]">
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Rating</option>
                      <option>Newest</option>
                    </select>
                  </div>
                </div>
                
                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div 
                      key={product.id} 
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{product.shop}</span>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            <span className="ml-1 text-sm text-gray-500">{product.rating}</span>
                          </div>
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-800 text-left">{product.name}</h3>
                        <p className="mt-1 text-xl font-semibold text-[#4d6b5a] text-left">${product.price}</p>
                        <button className="mt-4 w-full bg-[#688268] hover:bg-[#425442] text-white py-2 rounded font-medium">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                      &laquo; Prev
                    </button>
                    <button className="px-3 py-1 bg-[#688268] text-white rounded-md">1</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">2</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">3</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                      Next &raquo;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Searching;