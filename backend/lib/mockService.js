const mockProducts = [
  {
    id: 'chair1',
    title: 'Eco-Friendly Office Chair',
    price: 199.99,
    imageUrl: 'https://placehold.co/400x400?text=Eco+Chair',
    description: 'Ergonomic office chair made with sustainable materials and recycled components.',
    sustainabilityLevel: 5,
    url: 'https://example.com/eco-chair',
    source: 'EcoStore',
    rating: 4.7
  },
  {
    id: 'chair2',
    title: 'Bamboo Dining Chair',
    price: 149.99,
    imageUrl: 'https://placehold.co/400x400?text=Bamboo+Chair',
    description: 'Stylish dining chair made from sustainable bamboo with organic cotton cushion.',
    sustainabilityLevel: 4,
    url: 'https://example.com/bamboo-chair',
    source: 'EcoHome',
    rating: 4.5
  },
  {
    id: 'chair3',
    title: 'Recycled Plastic Adirondack Chair',
    price: 129.50,
    imageUrl: 'https://placehold.co/400x400?text=Recycled+Chair',
    description: 'Weather-resistant outdoor chair made from 100% recycled plastic materials.',
    sustainabilityLevel: 5,
    url: 'https://example.com/adirondack-chair',
    source: 'GreenLiving',
    rating: 4.8
  },
  {
    id: 'chair4',
    title: 'Organic Cotton Bean Bag Chair',
    price: 89.99,
    imageUrl: 'https://placehold.co/400x400?text=Bean+Bag',
    description: 'Comfortable bean bag chair with organic cotton cover and recycled filling.',
    sustainabilityLevel: 4,
    url: 'https://example.com/bean-bag',
    source: 'EcoStore',
    rating: 4.3
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
  
  // Add additional mock images for detail view
  const productWithImages = {
    ...product,
    images: [
      product.imageUrl,
      'https://placehold.co/400x400?text=Additional+View',
      'https://placehold.co/400x400?text=Another+View'
    ],
    specs: {
      "Material": product.sustainabilityLevel >= 4 ? "Eco-friendly materials" : "Standard materials",
      "Weight": "12 lbs",
      "Dimensions": "24\" x 22\" x 34\"",
      "Color": "Natural",
      "Assembly": "Required",
      "Warranty": "5 years"
    }
  };
  
  return productWithImages;
};

module.exports = {
  searchProducts,
  getProductDetails
}; 