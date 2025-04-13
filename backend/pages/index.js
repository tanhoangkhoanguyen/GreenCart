import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchProducts = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      console.log(`Searching for: ${query}`);
      const response = await fetch(`/api/products/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      }
      
      console.log(`Received ${data.products?.length || 0} products`);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Failed to search for products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to render the source badge with appropriate color
  const renderSourceBadge = (source) => {
    let bgColor = 'bg-gray-500';
    switch (source) {
      case 'amazon': bgColor = 'bg-yellow-600'; break;
      case 'walmart': bgColor = 'bg-blue-600'; break;
      case 'ebay': bgColor = 'bg-red-500'; break;
      case 'mock': bgColor = 'bg-purple-600'; break;
    }
    
    return (
      <span className={`text-xs text-white px-2 py-1 rounded ${bgColor} capitalize`}>
        {source}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4">
      <Head>
        <title>Sustainable Shopping</title>
        <meta name="description" content="Find sustainable products across multiple platforms" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Sustainable Shopping Comparison</h1>
        
        <form onSubmit={searchProducts} className="max-w-md mx-auto mb-8">
          <div className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-grow p-2 border border-gray-300 rounded-l"
              required
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {error && (
            <p className="text-red-500 mt-2 text-sm">{error}</p>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Try searching for example products:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['gundam', 'bamboo pillow', 'eco friendly', 'organic cotton'].map(term => (
                <button
                  key={term}
                  type="button"
                  className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  onClick={() => {
                    setQuery(term);
                    searchProducts({ preventDefault: () => {} });
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </form>

        {loading ? (
          <p className="text-center">Loading results...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={`${product.source}-${product.id}`} className="border rounded p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold mr-2">{product.title}</h2>
                  {renderSourceBadge(product.source)}
                </div>
                
                {product.imageUrl && (
                  <div className="h-48 flex items-center justify-center mb-4">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                
                <p className="text-xl font-bold mb-3 text-blue-600">${product.price?.toFixed(2)}</p>
                
                <div className="flex items-center justify-between">
                  <a 
                    href={product.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Product
                  </a>
                  <div className="flex items-center">
                    <span className="mr-1 text-sm">Sustainability:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`h-3 w-3 rounded-full mx-0.5 ${
                            i < product.sustainabilityLevel 
                              ? 'bg-green-500' 
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No products found. Try searching for something!</p>
        )}
      </main>
    </div>
  );
} 