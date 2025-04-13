import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import banner from "../../assets/bg/banner.png";
import { SeedIcon, MenuIcon } from "../../assets/icon";
import { isAuthenticated, logoutUser } from "../Auth/authService";
import ProductDetails from "./ProductDetails"; // Import ProductDetails component
import ProductImage from '../../components/ProductImage';

const SearchPage = () => {
  const navigate = useNavigate(); // Add navigate hook for programmatic navigation
  
  // User Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Search states
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedShops, setSelectedShops] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [priceRange, setPriceRange] = useState(250);

  // Sort state
  const [sortMethod, setSortMethod] = useState('price-low');

  // Selected product state for details view
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  // Original products state (unfiltered)
  const [allProducts, setAllProducts] = useState([
    {
      id: 1,
      title: "Eco-Friendly Water Bottle",
      price: 24.99,
      rating: 4.5,
      source: "GreenEarth",
      imageUrl: "/api/placeholder/200/200",
      sustainabilityLevel: 5,
      description: "A reusable water bottle made from eco-friendly materials. Perfect for everyday use.",
      specs: {
        "Material": "BPA-free Recycled Plastic",
        "Capacity": "750ml",
        "Weight": "250g"
      },
      url: "https://example.com/eco-bottle",
      images: ["/api/placeholder/400/400", "/api/placeholder/400/400"]
    },
    {
      id: 2,
      title: "Bamboo Cutlery Set",
      price: 15.99,
      rating: 4.8,
      source: "EcoLiving",
      imageUrl: "/api/placeholder/200/200",
      sustainabilityLevel: 4,
      description: "Portable bamboo cutlery set with knife, fork, spoon and chopsticks.",
      specs: {
        "Material": "100% Bamboo",
        "Items": "4 pieces",
        "Case": "Cotton pouch"
      },
      url: "https://example.com/bamboo-cutlery",
      images: ["/api/placeholder/400/400", "/api/placeholder/400/400"] 
    },
    {
      id: 3,
      title: "Reusable Produce Bags",
      price: 12.50,
      rating: 4.3,
      source: "GreenEarth",
      imageUrl: "/api/placeholder/200/200",
      sustainabilityLevel: 5,
      description: "Set of mesh produce bags for grocery shopping. Eliminates the need for plastic bags.",
      specs: {
        "Material": "Organic Cotton Mesh",
        "Quantity": "5 bags",
        "Sizes": "Various"
      },
      url: "https://example.com/produce-bags",
      images: ["/api/placeholder/400/400", "/api/placeholder/400/400"]
    },
    {
      id: 4,
      title: "Solar Power Bank",
      price: 45.99,
      rating: 4.7,
      source: "EcoTech",
      imageUrl: "/api/placeholder/200/200",
      sustainabilityLevel: 3,
      description: "Charge your devices using solar energy. Perfect for outdoor activities.",
      specs: {
        "Capacity": "10000mAh",
        "Charging": "Solar + USB",
        "Output Ports": "2x USB"
      },
      url: "https://example.com/solar-powerbank",
      images: ["/api/placeholder/400/400", "/api/placeholder/400/400"]
    }
  ]);

  // Filtered and sorted products
  const [products, setProducts] = useState([]);

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

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFiltersAndSort();
  }, [allProducts, selectedShops, selectedRating, priceRange, sortMethod]);

  const applyFiltersAndSort = () => {
    let filteredProducts = [...allProducts];
    
    // Apply shop filter
    if (selectedShops.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        selectedShops.includes(product.source)
      );
    }
    
    // Apply rating filter
    if (selectedRating > 0) {
      filteredProducts = filteredProducts.filter(product => 
        product.rating >= selectedRating
      );
    }
    
    // Apply price filter
    filteredProducts = filteredProducts.filter(product => 
      product.price <= priceRange
    );
    
    // Apply sorting
    switch (sortMethod) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // In a real app, you'd sort by date
        // For now, we'll just keep the current order
        break;
      default:
        break;
    }
    
    setProducts(filteredProducts);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    // Optionally, you can redirect to login page
    // navigate('/login');
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setError(null);
    setAllProducts([]);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false,
        timeout: 15000 // 15 second timeout
      });
      
      console.log('Search response:', response.data);
      
      if (response.data && Array.isArray(response.data.products) && response.data.products.length > 0) {
        setAllProducts(response.data.products);
      } else {
        // If no products from API, use mock data based on search term
        console.log('No products from API, using mock data');
        const mockProducts = generateMockProducts(query);
        setAllProducts(mockProducts);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Use mock data as fallback
      const mockProducts = generateMockProducts(query);
      setAllProducts(mockProducts);
      setError('Could not fetch from main services. Showing alternative products.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate mock products
  const generateMockProducts = (searchTerm) => {
    const capitalizedTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
    return [
      {
        id: `mock-${searchTerm}-1`,
        title: `Eco-Friendly ${capitalizedTerm}`,
        price: 49.99,
        rating: 4.5,
        source: "Amazon",
        imageUrl: `https://placehold.co/400x400?text=Eco+${capitalizedTerm}`,
        sustainabilityLevel: 5,
        description: `Sustainable and eco-friendly ${searchTerm} made with recycled materials.`,
        url: `https://amazon.com/s?k=${encodeURIComponent(searchTerm)}`
      },
      {
        id: `mock-${searchTerm}-2`,
        title: `Organic ${capitalizedTerm}`,
        price: 39.99,
        rating: 4.3,
        source: "eBay",
        imageUrl: `https://placehold.co/400x400?text=Organic+${capitalizedTerm}`,
        sustainabilityLevel: 4,
        description: `Organic ${searchTerm} sourced from sustainable suppliers.`,
        url: `https://ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchTerm)}`
      }
    ];
  };

  const handleShopFilter = (shop) => {
    if (selectedShops.includes(shop)) {
      setSelectedShops(selectedShops.filter(s => s !== shop));
    } else {
      setSelectedShops([...selectedShops, shop]);
    }
  };

  const handleViewProductDetails = (product) => {
    navigate(`/product/${product.source}/${product.id}`);
  };

  const renderSustainabilityLevel = (level) => {
    const levels = [];
    for (let i = 1; i <= 5; i++) {
      levels.push(
        <span 
          key={i} 
          className={`inline-block w-3 h-3 rounded-full mr-1 ${i <= level ? 'bg-green-500' : 'bg-gray-200'}`}
        />
      );
    }
    return (
      <div className="flex items-center mb-2 flex-wrap">
        {levels}
        <span className="text-sm text-gray-600 ml-1">Sustainability: {level}/5</span>
      </div>
    );
  };

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // If a product is selected for viewing details
  if (selectedProduct) {
    return <ProductDetails product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  // Update the product card rendering to handle image errors
  const renderProductCard = (product) => (
    <div 
      key={`${product.source}-${product.id}`} 
      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative">
        <ProductImage 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs capitalize">
          {product.source}
        </div>
      </div>
      <div className="p-4">
        <h3 className="mt-2 text-lg font-medium text-gray-800 text-left truncate" title={product.title}>
          {product.title}
        </h3>
        <div className="flex items-center mt-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-sm text-gray-500">{product.rating}</span>
          </div>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-sm text-gray-500">${product.price.toFixed(2)}</span>
        </div>
        {renderSustainabilityLevel(product.sustainabilityLevel)}
        <button 
          onClick={() => handleViewProductDetails(product)}
          className="mt-4 w-full bg-[#688268] hover:bg-[#425442] text-white py-2 rounded font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );

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

        {/* Hero Section */}
        <div
          className="flex flex-col items-center justify-center text-center py-16"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <h1 className="text-7xl font-medium mb-8 text-[rgba(93,64,55,0.9)]">
            <span className="font-bold text-[#5D4037]">Compare Products</span>
          </h1>
          
          <form onSubmit={handleSearch} className="flex rounded-full bg-white shadow-lg overflow-hidden max-w-4xl w-full mx-4">
            <div className="flex-grow flex items-center">
              <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                type="text" 
                className="flex-grow py-3 px-6 outline-none text-base"
                placeholder="Search for products..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className="border-l border-gray-200">
              <select 
                className="h-full py-3 px-6 outline-none text-gray-600 appearance-none bg-white cursor-pointer pr-8"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="">Budget Range</option>
                <option value="5-10">$5 - $10</option>
                <option value="10-50">$10 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-250">$100 - $250</option>
                <option value="250+">$250+</option>
              </select>
            </div>
            
            <button 
              type="submit"
              className="bg-[#688268] hover:bg-[#425442] text-white px-6 py-3 font-medium text-sm uppercase tracking-wider"
            >
              Search
            </button>
          </form>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 text-red-600 p-4 mx-auto my-4 max-w-4xl rounded text-center">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="text-center my-8 text-lg text-gray-600">
            <svg className="animate-spin h-10 w-10 mx-auto text-[#688268]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Searching for products...</p>
          </div>
        )}

        {/* Modified Filter and Items Display Section */}
        {!loading && (
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
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">$0</span>
                    <span className="text-sm text-gray-600">${priceRange}</span>
                  </div>
                </div>
                
                {/* Apply Filter Button */}
                <button 
                  onClick={applyFiltersAndSort}
                  className="w-full bg-[#688268] hover:bg-[#425442] text-white py-2 rounded-lg font-medium"
                >
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
                    <select 
                      className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#688268]"
                      value={sortMethod}
                      onChange={(e) => setSortMethod(e.target.value)}
                    >
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Rating</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>
                
                {/* Products Grid */}
                {currentProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProducts.map(renderProductCard)}
                  </div>
                ) : (
                  <div className="text-center my-10 text-lg text-gray-600">
                    {query ? "No products found. Try a different search term." : "Search for products to see results."}
                  </div>
                )}
                
                {/* Pagination */}
                {products.length > productsPerPage && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      <button 
                        className={`px-3 py-1 border border-gray-300 rounded-md ${currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'}`}
                        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        &laquo; Prev
                      </button>
                      
                      {[...Array(totalPages).keys()].map(number => (
                        <button 
                          key={number + 1}
                          onClick={() => paginate(number + 1)}
                          className={`px-3 py-1 ${
                            currentPage === number + 1 
                              ? 'bg-[#688268] text-white' 
                              : 'border border-gray-300 hover:bg-gray-100'
                          } rounded-md`}
                        >
                          {number + 1}
                        </button>
                      ))}
                      
                      <button 
                        className={`px-3 py-1 border border-gray-300 rounded-md ${currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'}`}
                        onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next &raquo;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;