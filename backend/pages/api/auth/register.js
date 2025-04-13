// REGISTER HANDLER - /api/auth/register.js
import { connectToDB } from '../../../lib/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const frontendOrigin = 'http://localhost:5173';
  
  // Set consistent CORS headers
  res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(400).json({ message: 'Method Not Allowed' });
  }

  // Ensure we get the data correctly from the request body
  let { email, password, username } = req.body;
  
  // Trim whitespace from string fields
  if (typeof email === 'string') email = email.trim();
  if (typeof username === 'string') username = username.trim();

  // Improved validation - check for null, undefined, empty strings
  if (!email || email === '') {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  if (!username || username === '') {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    await connectToDB();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      // More specific error message
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'Email already registered' });
      } else {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    // Save user to database
    await newUser.save();

    return res.status(201).json({ message: 'User successfully registered' });
  } catch (error) {
    console.error('Error in registration:', error);
    
    // Handle MongoDB duplicate key errors specifically
    if (error.code === 11000) {
      const dupField = Object.keys(error.keyValue)[0];
      return res.status(409).json({ 
        message: `${dupField === 'email' ? 'Email' : 'Username'} already exists` 
      });
    }
    
    return res.status(500).json({ message: 'Server error during registration' });
  }
}