import React, { useState } from "react";
import bg from "../../assets/bg/bg-4.png";
import { SeedGreenIcon } from "../../assets/icon";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from './authService'; // Import the auth service

const Signup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Remove confirmPassword from the isFilled check
    const isFilled = username && email && password && agreeTerms;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Remove password matching validation
        setLoading(true);
        setError('');
        
        try {
            // Call registerUser from authService
            const userData = {
                username,
                email,
                password
            };
            
            await registerUser(userData);
            
            // Redirect to login page after successful registration
            navigate('/login', { 
                state: { message: 'Account created successfully! Please log in.' } 
            });
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-row items-center justify-center relative overflow-hidden"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* left side bg photo */}
            <div className="flex-1 h-screen">
            </div>

            {/* right side: Signup */}
            <div className="flex-1 bg-[#4d6b5a] h-screen flex flex-col justify-center items-center">
                <div className="h-full w-full p-10">
                    <div className="h-full w-full flex flex-col p-8">
                        <Link to="/" className="flex flex-row items-center mb-6">
                            <div className="flex flex-row px-4 py-2 rounded-xl bg-[#eae9e3]">
                                {SeedGreenIcon}
                                <h1 className="font-bold text-2xl text-[#4d6b5a] ml-2">GreenCart</h1>
                            </div>
                        </Link>

                        <h1 className="text-white font-bold text-3xl mb-6">
                            Sign Up
                        </h1>

                        {/* Show error messages */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col space-y-3 w-full max-w-md">
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="username" className="text-white font-medium">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="border-2 border-white/30 bg-white/10 text-white p-3 rounded-md focus:border-white focus:outline-none placeholder-white/60"
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label htmlFor="email" className="text-white font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border-2 border-white/30 bg-white/10 text-white p-3 rounded-md focus:border-white focus:outline-none placeholder-white/60"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label htmlFor="password" className="text-white font-medium">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-2 border-white/30 bg-white/10 text-white p-3 rounded-md focus:border-white focus:outline-none placeholder-white/60"
                                    placeholder="Create a password"
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="w-4 h-4 accent-white"
                                    required
                                />
                                <label htmlFor="agreeTerms" className="text-white text-sm">
                                    I agree to the <Link to="/terms" className="underline">Terms and Conditions</Link>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={!isFilled || loading}
                                className={`py-3 px-6 rounded-md font-medium mt-4 ${
                                    isFilled && !loading ? "bg-white text-[#4d6b5a] hover:bg-gray-100" : "bg-gray-400 text-gray-700 cursor-not-allowed"
                                }`}
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>

                            <div className="mt-6 text-center">
                                <span className="text-white/80">Already have an account?</span>{" "}
                                <Link to="/login" className="text-white font-medium hover:underline">
                                    Log in
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;