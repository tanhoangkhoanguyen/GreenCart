import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper function to calculate sustainability score
const calculateSustainabilityScore = (productData) => {
  // This would be more complex in a real application
  let score = 2; // Default score for eBay - has secondhand items which can be more sustainable
  
  // Boost score for potentially used/secondhand goods
  if (productData.title.toLowerCase().includes('used') || 
      productData.title.toLowerCase().includes('pre-owned') ||
      productData.title.toLowerCase().includes('refurbished') ||
      productData.title.toLowerCase().includes('vintage')) {
    score += 2;
  }
  
  // Example logic - check for additional sustainability keywords
  const sustainabilityKeywords = ['eco', 'sustainable', 'organic', 'recycled', 'green'];
  for (const keyword of sustainabilityKeywords) {
    if (productData.title.toLowerCase().includes(keyword) || 
        (productData.description && productData.description.toLowerCase().includes(keyword))) {
      score += 1;
      break; // Only add 1 point max for keywords
    }
  }
  
  return Math.min(5, score); // Cap at 5
};

const searchProducts = async (query) => {
  try {
    // Note: In a production environment, you would need to use official APIs instead of scraping
    const response = await axios.get(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Check if response data exists before parsing
    if (!response || !response.data) {
      console.log("No data received from eBay");
      return [];
    }
    
    const $ = cheerio.load(response.data);
    const products = [];
    
    // This selector would need to be updated based on eBay's current HTML structure
    $('.s-item__wrapper').each((i, el) => {
      const linkElement = $(el).find('.s-item__link');
      if (!linkElement.length) return;
      
      const url = linkElement.attr('href');
      if (!url) return;
      
      // Extract ID from URL
      const idMatch = url.match(/\/(\d+)\?/);
      const id = idMatch ? idMatch[1] : null;
      if (!id) return;
      
      const title = $(el).find('.s-item__title').text().trim();
      const priceText = $(el).find('.s-item__price').text().trim();
      const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
      const imageUrl = $(el).find('.s-item__image-img').attr('src');
      
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
    console.error('Error searching eBay products:', error);
    return [];
  }
};

const getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`https://www.ebay.com/itm/${productId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Check if response data exists before parsing
    if (!response || !response.data) {
      console.log("No data received from eBay product details");
      throw new Error("Failed to load product data from eBay");
    }
    
    const $ = cheerio.load(response.data);
    
    const title = $('#itemTitle').clone().children().remove().end().text().trim();
    const priceText = $('#prcIsum').text().trim();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
    
    // Get images
    const images = [];
    $('#icImg').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        // Convert to fullsize image URL
        const fullSizeUrl = src.replace(/\/s-l\d+\./, '/s-l1600.');
        images.push(fullSizeUrl);
      }
    });
    
    // Extract description
    let description = '';
    try {
      // eBay often loads descriptions in iframes
      const descriptionIframeSrc = $('#desc_ifr').attr('src');
      if (descriptionIframeSrc) {
        const descResponse = await axios.get(descriptionIframeSrc, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const $desc = cheerio.load(descResponse.data);
        description = $desc('body').text().trim();
      } else {
        description = $('.item-description').text().trim();
      }
    } catch (e) {
      description = '';
    }
    
    // Extract specifications/item specifics
    const specs = {};
    $('.item-details .ux-labels-values__labels').each((i, el) => {
      const key = $(el).text().trim();
      const value = $(el).next('.ux-labels-values__values').text().trim();
      if (key && value) {
        specs[key] = value;
      }
    });
    
    const condition = $('.x-item-condition-text').text().trim();
    
    const productData = {
      id: productId,
      title,
      price,
      images: images.length > 0 ? images : [],
      description,
      specs,
      condition,
      url: `https://www.ebay.com/itm/${productId}`
    };
    
    return {
      ...productData,
      sustainabilityLevel: calculateSustainabilityScore(productData)
    };
  } catch (error) {
    console.error('Error getting eBay product details:', error);
    throw error;
  }
};

export default {
  searchProducts,
  getProductDetails
};