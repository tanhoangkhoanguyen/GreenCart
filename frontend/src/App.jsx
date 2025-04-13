import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import Searching from './pages/component/Search'
import Login from './pages/Auth/LogIn'
import Signup from './pages/Auth/SignUp'
import ProtectedRoute from './pages/Auth/ProtectedRoute' 
import Marketplace from './pages/Market'
import SearchPage from './pages/component/SearchPage'
import ProductDetails from './pages/component/ProductDetails'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Landing/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        

        {/* Product search and details routes */}
        <Route path="/product" element={<SearchPage />} />
        <Route path="/product/:source/:id" element={<ProductDetails />} />
        
        {/* Adding this fallback route for /product with no parameters */}
        <Route path="/product/*" element={<SearchPage />} />
        
        {/* Protected routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path='/search' element={<Searching/>}/>
          {/* Add other protected routes here */}
        </Route>

         {/* Protected routes - require authentication */}
         <Route element={<ProtectedRoute />}>
          <Route path='/market' element={<Marketplace/>}/>
          {/* Add other protected routes here */}
        </Route>
        
        {/* Fallback route for unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App