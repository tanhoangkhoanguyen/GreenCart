// This mock service provides fallback results when scraping real e-commerce sites fails
// It's useful for testing and development

const mockProducts = [
  {
    id: '714277',
    title: 'Gundam Model Kit - RX-78-2',
    price: 45.99,
    imageUrl: 'https://m.media-amazon.com/images/I/71C8dzSZBZL._AC_UL320_.jpg',
    description: 'Classic Gundam model kit with eco-friendly packaging',
    sustainabilityLevel: 4,
    url: 'https://example.com/product/mock1',
    rating: 4.5
  },
  {
    id: '839044',
    title: 'Gundam Unicorn Destroy Mode',
    price: 68.50,
    imageUrl: 'https://m.media-amazon.com/images/I/71lLr9mYS6L._AC_UL320_.jpg',
    description: 'Advanced model kit with detailed parts',
    sustainabilityLevel: 3,
    url: 'https://example.com/product/mock2',
    rating: 4.3
  },
  {
    id: '951382',
    title: 'Gundam Wing Zero Custom',
    price: 52.75,
    imageUrl: 'https://m.media-amazon.com/images/I/81nj6IlZbWL._AC_UL320_.jpg',
    description: 'Popular Wing Gundam model with wings and weapons',
    sustainabilityLevel: 3,
    url: 'https://example.com/product/mock3',
    rating: 4.7
  },
  {
    id: '247653',
    title: 'Gundam Barbatos Lupus Rex',
    price: 64.99,
    imageUrl: 'https://m.media-amazon.com/images/I/61P1xYA4arL._AC_UL320_.jpg',
    description: 'Iron-Blooded Orphans series, with recycled materials',
    sustainabilityLevel: 5,
    url: 'https://example.com/product/mock4',
    rating: 4.8
  },
  {
    id: '365819',
    title: 'Gundam Exia Repair',
    price: 39.99,
    imageUrl: 'https://m.media-amazon.com/images/I/71ghC5pvGjL._AC_UL320_.jpg',
    description: 'Popular 00 Gundam model with GN sword',
    sustainabilityLevel: 2,
    url: 'https://example.com/product/mock5',
    rating: 4.2
  },
  // Bicycle products
  {
    id: 'b1001',
    title: 'Bamboo Frame Bicycle',
    price: 699.99,
    imageUrl: 'https://m.media-amazon.com/images/I/71RDCpYR8EL._AC_SL1500_.jpg',
    description: 'Eco-friendly bicycle with bamboo frame, handcrafted using sustainable materials',
    sustainabilityLevel: 5,
    url: 'https://example.com/bamboo-bicycle',
    rating: 4.7
  },
  {
    id: 'b1002',
    title: 'Electric Commuter Bicycle',
    price: 1299.99,
    imageUrl: 'https://m.media-amazon.com/images/I/81CrFQZN-IL._AC_SL1500_.jpg',
    description: 'Energy-efficient e-bike with recycled aluminum frame and solar charging capability',
    sustainabilityLevel: 4,
    url: 'https://example.com/electric-bicycle',
    rating: 4.9
  },
  {
    id: 'b1003',
    title: 'Recycled Tire Urban Bike',
    price: 549.50,
    imageUrl: 'https://m.media-amazon.com/images/I/71HqQHb-CIL._AC_SL1500_.jpg',
    description: 'City bike featuring tires made from recycled rubber and eco-friendly components',
    sustainabilityLevel: 5,
    url: 'https://example.com/recycled-bicycle',
    rating: 4.5
  }
];

// Filter mock products based on search query
const searchProducts = async (query) => {
  console.log(`Mock service searching for: ${query}`);

  // If search query is empty, return all mock products
  if (!query) return mockProducts;

  // Filter products based on query
  const lowerCaseQuery = query.toLowerCase();
  const filteredProducts = mockProducts.filter(product => 
    product.title.toLowerCase().includes(lowerCaseQuery) || 
    product.description.toLowerCase().includes(lowerCaseQuery)
  );

  console.log(`Mock service found ${filteredProducts.length} products for query "${query}"`);
  return filteredProducts;
};

const getProductDetails = async (productId) => {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

export default {
  searchProducts,
  getProductDetails
}; 