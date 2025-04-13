import express from 'express';
import cors from 'cors';
import amazonService from './services/amazonService.js';
import ebayService from './services/ebayService.js';
import mockService from './services/mockService.js';

const app = express();
const port = process.env.PORT || 8888;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite's default development server
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// Search products across services
app.get('/api/products/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log(`Searching for products with query: ${query}`);
    
    // Search in parallel from both services
    const [amazonResults, ebayResults] = await Promise.allSettled([
      amazonService.searchProducts(query),
      ebayService.searchProducts(query)
    ]);

    // Combine results, filtering out any rejected promises
    const products = [
      ...(amazonResults.status === 'fulfilled' ? amazonResults.value : []),
      ...(ebayResults.status === 'fulfilled' ? ebayResults.value : [])
    ];

    // If no results from real services, use mock service
    if (products.length === 0) {
      console.log('No results from real services, using mock service');
      const mockResults = await mockService.searchProducts(query);
      products.push(...mockResults);
    }

    res.json({ products });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get product details
app.get('/api/products/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.query;

    if (!id || !source) {
      return res.status(400).json({ error: 'Product ID and source are required' });
    }

    let product;
    try {
      switch (source.toLowerCase()) {
        case 'amazon':
          product = await amazonService.getProductDetails(id);
          break;
        case 'ebay':
          product = await ebayService.getProductDetails(id);
          break;
        default:
          // Try mock service as fallback
          product = await mockService.getProductDetails(id);
      }
    } catch (serviceError) {
      console.error(`Error fetching from ${source}:`, serviceError);
      // Try mock service as fallback
      product = await mockService.getProductDetails(id);
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({ error: 'Failed to get product details' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 