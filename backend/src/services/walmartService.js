import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper function to calculate sustainability score
const calculateSustainabilityScore = (productData) => {
  // This would be more complex in a real application
  let score = 2; // Default score - Walmart has some sustainability initiatives but generally scores lower
  
  // Example logic - check for keywords in the title or description
  const sustainabilityKeywords = ['eco', 'sustainable', 'organic', 'recycled', 'green'];
  for (const keyword of sustainabilityKeywords) {
    if (productData.title.toLowerCase().includes(keyword) || 
        (productData.description && productData.description.toLowerCase().includes(keyword))) {
      score += 1;
    }
  }
  
  return Math.min(5, score); // Cap at 5
};

const searchProducts = async (query) => {
  try {
    // Note: In a production environment, you would need to use official APIs instead of scraping
    const response = await axios.get(`https://www.walmart.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Lower max header size to prevent Header overflow errors
      maxHeadersLength: 8192,
      // Set timeout to prevent long waits
      timeout: 8000
    });
    
    // Check if response data exists before parsing
    if (!response || !response.data) {
      console.log("No data received from Walmart");
      return [];
    }
    
    const $ = cheerio.load(response.data);
    const products = [];
    
    // This selector would need to be updated based on Walmart's current HTML structure
    $('[data-item-id]').each((i, el) => {
      const id = $(el).attr('data-item-id');
      if (!id) return;
      
      const title = $(el).find('[data-automation-id="product-title"]').text().trim();
      const priceText = $(el).find('[data-automation-id="product-price"]').text().trim();
      const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
      const imageUrl = $(el).find('img').attr('src');
      const url = 'https://www.walmart.com/ip/' + id;
      
      if (title && price) {
        const productData = { id, title, price, imageUrl, url };
        products.push({
          ...productData,
          sustainabilityLevel: calculateSustainabilityScore(productData)
        });
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error searching Walmart products:', error);
    return [];
  }
};

const getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`https://www.walmart.com/ip/${productId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Lower max header size to prevent Header overflow errors
      maxHeadersLength: 8192,
      // Set timeout to prevent long waits
      timeout: 8000
    });
    
    // Check if response data exists before parsing
    if (!response || !response.data) {
      console.log("No data received from Walmart product details");
      throw new Error("Failed to load product data from Walmart");
    }
    
    const $ = cheerio.load(response.data);
    
    const title = $('[data-automation-id="product-title"]').text().trim();
    const priceText = $('[data-automation-id="product-price"]').text().trim();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
    
    // Get multiple images
    const images = [];
    $('[data-automation-id="image-gallery"] img').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        images.push(src);
      }
    });
    
    // Extract description
    const description = $('[data-automation-id="product-description"]').text().trim();
    
    // Extract specifications
    const specs = {};
    $('[data-automation-id="product-specifications"] tr').each((i, el) => {
      const key = $(el).find('th').text().trim();
      const value = $(el).find('td').text().trim();
      if (key && value) {
        specs[key] = value;
      }
    });
    
    const productData = {
      id: productId,
      title,
      price,
      images: images.length > 0 ? images : [$('[data-automation-id="image-gallery"] img').first().attr('src')],
      description,
      specs,
      url: `https://www.walmart.com/ip/${productId}`
    };
    
    return {
      ...productData,
      sustainabilityLevel: calculateSustainabilityScore(productData)
    };
  } catch (error) {
    console.error('Error getting Walmart product details:', error);
    throw error;
  }
};

export default {
  searchProducts,
  getProductDetails
};