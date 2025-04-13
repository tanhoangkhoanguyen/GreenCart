const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to calculate sustainability score (simplified example)
const calculateSustainabilityScore = (productData) => {
  // This would be more complex in a real application
  // Could check for eco-friendly labels, materials, brand reputation, etc.
  let score = 3; // Default middle score
  
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
    console.log(`Amazon service searching for: ${query}`);
    
    // Add more request headers to look more like a browser
    const response = await axios.get(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.amazon.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    });
    
    console.log('Amazon response status:', response.status);
    
    // Check if response data exists before parsing
    if (!response || !response.data) {
      console.log("No data received from Amazon");
      return [];
    }
    
    const $ = cheerio.load(response.data);
    const products = [];
    
    // Try multiple selectors that Amazon might be using
    const productSelectors = [
      '.s-result-item[data-asin]',
      '[data-component-type="s-search-result"]',
      '.sg-col-4-of-12.s-result-item',
      '.s-asin'
    ];
    
    let selectorUsed = '';
    let productsFound = 0;
    
    for (const selector of productSelectors) {
      // Try each selector
      const elements = $(selector);
      console.log(`Amazon selector "${selector}" matched ${elements.length} elements`);
      
      if (elements.length > 0) {
        selectorUsed = selector;
        productsFound = elements.length;
        
        elements.each((i, el) => {
          // Extract ASIN (Amazon product ID)
          const asin = $(el).attr('data-asin');
          if (!asin) return;
          
          // Try different title selectors
          let title = '';
          const titleSelectors = ['h2 span', 'h2 a span', '.a-text-normal', '.a-size-base-plus'];
          for (const titleSelector of titleSelectors) {
            const titleText = $(el).find(titleSelector).first().text().trim();
            if (titleText) {
              title = titleText;
              break;
            }
          }
          
          // Try different price selectors
          let price = null;
          const priceSelectors = ['.a-price .a-offscreen', '.a-price', '.a-color-price'];
          for (const priceSelector of priceSelectors) {
            const priceElement = $(el).find(priceSelector).first();
            const priceText = priceElement.text().trim();
            if (priceText) {
              // Extract numbers from the price text
              const priceMatch = priceText.match(/\d+\.\d+|\d+/);
              if (priceMatch) {
                price = parseFloat(priceMatch[0]);
                break;
              }
            }
          }
          
          // Try different image selectors
          let imageUrl = '';
          const imageSelectors = ['img.s-image', '.a-section img', 'img'];
          for (const imageSelector of imageSelectors) {
            const imgElement = $(el).find(imageSelector).first();
            const imgSrc = imgElement.attr('src');
            if (imgSrc && imgSrc.startsWith('http')) {
              imageUrl = imgSrc;
              break;
            }
          }
          
          const url = 'https://www.amazon.com/dp/' + asin;
          
          if (title && price) {
            const productData = { id: asin, title, price, imageUrl, url, source: 'Amazon' };
            products.push({
              ...productData,
              sustainabilityLevel: calculateSustainabilityScore(productData)
            });
          }
        });
        
        // Break if we found products with this selector
        if (products.length > 0) {
          break;
        }
      }
    }
    
    console.log(`Amazon search results: ${products.length} products found using selector: ${selectorUsed} (${productsFound} matches)`);
    
    return products;
  } catch (error) {
    console.error('Error searching Amazon products:', error.message);
    if (error.response) {
      console.error('Amazon response status:', error.response.status);
      console.error('Amazon response headers:', JSON.stringify(error.response.headers));
    }
    return [];
  }
};

const getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`https://www.amazon.com/dp/${productId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.amazon.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    });
    
    // Check if response data exists before parsing
    if (!response || !response.data) {
      console.log("No data received from Amazon product details");
      throw new Error("Failed to load product data from Amazon");
    }
    
    const $ = cheerio.load(response.data);
    
    const title = $('#productTitle').text().trim();
    const priceText = $('.a-price .a-offscreen').first().text().trim();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
    
    // Get multiple images
    const images = [];
    $('#altImages img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && !src.includes('sprite')) {
        // Convert thumbnail URL to full-size image URL
        const fullSizeUrl = src.replace(/_[S]C_\.\w+$/, '');
        images.push(fullSizeUrl);
      }
    });
    
    // Extract description
    const description = $('#productDescription p').text().trim();
    
    // Extract specifications
    const specs = {};
    $('#productDetails_techSpec_section_1 tr').each((i, el) => {
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
      images: images.length > 0 ? images : [$('#landingImage').attr('src')],
      description,
      specs,
      source: 'Amazon',
      url: `https://www.amazon.com/dp/${productId}`
    };
    
    return {
      ...productData,
      sustainabilityLevel: calculateSustainabilityScore(productData)
    };
  } catch (error) {
    console.error('Error getting Amazon product details:', error.message);
    throw error;
  }
};

module.exports = {
  searchProducts,
  getProductDetails
}; 