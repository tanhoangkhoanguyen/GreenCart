import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg4 from "../assets/bg/bg-4.png";
import { SeedIcon, BellIcon, MessageIcon, MenuIcon } from "../assets/icon";
import { isAuthenticated, logoutUser } from "./Auth/authService";

const Landing = () => {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const handleSearch = () => {
    console.log('Searching for:', { location, budget });
    navigate("/search")
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    // Optionally, you can redirect to login page
    // navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center transition-all duration-1000 ease-in-out relative"
      style={{
        backgroundImage: `url(${bg4})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="relative z-10 text-center w-full h-screen flex flex-col">
        {/* Nav Bar */}
        <div className="flex-1 flex flex-row justify-between px-10 items-center py-1 shadow-b-xl bg-[#4d6b5a]">
          {/* Icon */}
          <Link to="/" className="flex flex-row">
            {SeedIcon}
            <h1 className="font-bold text-2xl text-neutral-300">GreenCart</h1>
          </Link>
          <div className="flex flex-row gap-4 items-center">
            {isLoggedIn ? (
              <>
                {/* Display user email or name if available */}
                {user && (
                  <span className="text-neutral-300 mr-2 font-semibold">
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

        {/* Main Content */}
        <div className="flex-12 flex flex-col pb-13 items-center align-center justify-center">
          <h1 className="text-7xl font-medium mb-9 text-[rgba(93,64,55,0.9)]">
            Eco Smart <span className="font-bold text-[#5D4037]">Budget Wise.</span>
          </h1>
          
          <div className="flex rounded-full bg-white shadow-lg overflow-hidden">
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
      </div>
    </div>
  );
};

export default Landing;