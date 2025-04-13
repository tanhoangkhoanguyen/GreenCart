import amazonService from '../../../../src/services/amazonService';
import walmartService from '../../../../src/services/walmartService';
import ebayService from '../../../../src/services/ebayService';
import mockService from '../../../../src/services/mockService';

// CORS middleware
const allowCors = fn => async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Call the original handler
  return await fn(req, res);
};

// Map the source names from frontend to backend services
const reverseSourceNameMap = {
  'GreenEarth': 'amazon',
  'EcoLiving': 'walmart',
  'EcoTech': 'ebay'
};

// Map the source names from services to the frontend's expected source names
const sourceNameMap = {
  'amazon': 'GreenEarth',
  'walmart': 'EcoLiving',
  'ebay': 'EcoTech',
  'mock': 'GreenEarth'  // Default mock products to GreenEarth
};

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.query;
    const { source } = req.query;

    console.log(`Product details request - ID: ${productId}, Source: ${source}`);

    if (!productId || !source) {
      return res.status(400).json({ error: 'Product ID and source are required' });
    }

    // Map frontend source name to backend service name
    const serviceSource = reverseSourceNameMap[source] || 'mock';
    console.log(`Mapped source ${source} to service ${serviceSource}`);

    let productDetails;
    
    try {
      // Get details from the appropriate service
      switch (serviceSource) {
        case 'amazon':
          productDetails = await amazonService.getProductDetails(productId);
          break;
        case 'walmart':
          productDetails = await walmartService.getProductDetails(productId);
          break;
        case 'ebay':
          productDetails = await ebayService.getProductDetails(productId);
          break;
        default:
          // Try mock service as a fallback
          productDetails = await mockService.getProductDetails(productId);
      }

      // Map the source name back to frontend expected format
      if (productDetails) {
        productDetails.source = source;
      }
    } catch (serviceError) {
      console.error(`Error from ${serviceSource} service:`, serviceError.message);
      // Try mock service as a fallback
      try {
        productDetails = await mockService.getProductDetails(productId);
        productDetails.source = source;
      } catch (mockError) {
        return res.status(404).json({ error: 'Product not found' });
      }
    }

    res.status(200).json({ product: productDetails });
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({ error: 'Failed to get product details' });
  }
}

export default allowCors(handler); 