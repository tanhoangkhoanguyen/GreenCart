import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ProductImage from '../../components/ProductImage';

function ProductDetails() {
  const { source, id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        console.log(`Fetching product details for ${source}/${id}`);
        
        // First try to get it from the backend API
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/products/details/${id}?source=${source}`
          );
          
          if (response.data && response.data.product) {
            console.log('Product details from API:', response.data.product);
            setProduct(response.data.product);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('API fetch failed, falling back to demo data', apiError);
        }
        
        // For demo purposes, use the fallback demo data
        setTimeout(() => {
          // Demo product data
          const demoProducts = {
            "GreenEarth": {
              "1": {
                id: 1,
                title: "Eco-Friendly Water Bottle",
                price: 24.99,
                rating: 4.5,
                source: "GreenEarth",
                sustainabilityLevel: 5,
                description: "A reusable water bottle made from eco-friendly materials. Perfect for everyday use. Features double-wall insulation to keep your drinks cold for up to 24 hours or hot for up to 12 hours. The bottle is BPA-free and made from recycled materials.",
                specs: {
                  "Material": "BPA-free Recycled Plastic",
                  "Capacity": "750ml",
                  "Weight": "250g",
                  "Insulation": "Double-wall vacuum",
                  "Dimensions": "9\" x 3\"",
                  "Care": "Hand wash recommended"
                },
                url: "https://example.com/eco-bottle",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "3": {
                id: 3,
                title: "Reusable Produce Bags",
                price: 12.50,
                rating: 4.3,
                source: "GreenEarth",
                sustainabilityLevel: 5,
                description: "Set of mesh produce bags for grocery shopping. Eliminates the need for plastic bags. These lightweight bags are perfect for fruits, vegetables, and bulk items. Machine washable and durable.",
                specs: {
                  "Material": "Organic Cotton Mesh",
                  "Quantity": "5 bags",
                  "Sizes": "Various - S, M, L",
                  "Weight": "30g per bag",
                  "Care": "Machine washable"
                },
                url: "https://example.com/produce-bags",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "714277": {
                id: "714277",
                title: "Gundam Model Kit - RX-78-2",
                price: 45.99,
                rating: 4.5,
                source: "GreenEarth",
                sustainabilityLevel: 4,
                description: "Classic Gundam model kit with eco-friendly packaging. Features detailed parts and articulated joints.",
                specs: {
                  "Scale": "1/144 HG",
                  "Parts": "150+",
                  "Height": "13cm",
                  "Material": "Plastic with recycled components",
                  "Package": "Eco-friendly cardboard"
                },
                url: "https://example.com/product/gundam-rx78",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "839044": {
                id: "839044",
                title: "Gundam Unicorn Destroy Mode",
                price: 68.50,
                rating: 4.3,
                source: "GreenEarth",
                sustainabilityLevel: 3,
                description: "Advanced model kit with detailed parts. Transform between Unicorn and Destroy modes.",
                specs: {
                  "Scale": "1/100 MG",
                  "Parts": "300+",
                  "Height": "20cm",
                  "Material": "ABS Plastic",
                  "Features": "LED compatible (sold separately)"
                },
                url: "https://example.com/product/gundam-unicorn",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "p1001": {
                id: "p1001",
                title: "Organic Cotton Pillow",
                price: 39.99,
                rating: 4.6,
                source: "GreenEarth",
                sustainabilityLevel: 5,
                description: "100% organic cotton pillow with natural filling. This eco-friendly pillow is made with GOTS-certified organic cotton cover and filled with hypoallergenic organic cotton. Perfect for those with sensitivities to synthetic materials.",
                specs: {
                  "Material": "100% Organic Cotton",
                  "Fill": "Organic Cotton",
                  "Size": "Standard (20\" x 26\")",
                  "Weight": "2.5 lbs",
                  "Care": "Machine washable",
                  "Certifications": "GOTS, OEKO-TEX"
                },
                url: "https://example.com/organic-pillow",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "b1001": {
                id: "b1001",
                title: "Bamboo Frame Bicycle",
                price: 699.99,
                rating: 4.7,
                source: "GreenEarth",
                sustainabilityLevel: 5,
                description: "Eco-friendly bicycle with bamboo frame, handcrafted using sustainable materials. This innovative bicycle features a frame made from sustainably harvested bamboo, which offers natural shock absorption and durability while being environmentally friendly. Each frame is carefully handcrafted by skilled artisans.",
                specs: {
                  "Frame Material": "Sustainable Bamboo",
                  "Weight": "11.3 kg (24.9 lbs)",
                  "Gears": "Shimano 8-speed",
                  "Brakes": "Hydraulic disc brakes",
                  "Wheels": "700c recycled aluminum",
                  "Tires": "Eco-friendly natural rubber",
                  "Carbon Footprint": "80% lower than standard aluminum frames"
                },
                url: "https://example.com/bamboo-bicycle",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              }
            },
            "EcoLiving": {
              "2": {
                id: 2,
                title: "Bamboo Cutlery Set",
                price: 15.99,
                rating: 4.8,
                source: "EcoLiving",
                sustainabilityLevel: 4,
                description: "Portable bamboo cutlery set with knife, fork, spoon and chopsticks. Perfect for travel, work, or picnics. Comes with a cotton carrying pouch.",
                specs: {
                  "Material": "100% Bamboo",
                  "Items": "4 pieces",
                  "Case": "Cotton pouch",
                  "Length": "7 inches",
                  "Care": "Hand wash, oil occasionally"
                },
                url: "https://example.com/bamboo-cutlery",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "951382": {
                id: "951382",
                title: "Gundam Wing Zero Custom",
                price: 52.75,
                rating: 4.7,
                source: "EcoLiving",
                sustainabilityLevel: 3,
                description: "Popular Wing Gundam model with wings and weapons. Features highly detailed parts.",
                specs: {
                  "Scale": "1/144 RG",
                  "Parts": "250+",
                  "Height": "16cm",
                  "Material": "ABS Plastic",
                  "Features": "Fully articulated wings"
                },
                url: "https://example.com/product/wing-zero",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "p1002": {
                id: "p1002",
                title: "Bamboo Memory Foam Pillow",
                price: 45.50,
                rating: 4.3,
                source: "EcoLiving",
                sustainabilityLevel: 4,
                description: "Memory foam pillow with bamboo cover for cooling comfort. Features shredded memory foam that can be adjusted for personalized comfort. The bamboo cover naturally wicks away moisture and regulates temperature.",
                specs: {
                  "Cover Material": "Bamboo Viscose (40%) and Polyester (60%)",
                  "Fill": "CertiPUR-US Certified Shredded Memory Foam",
                  "Size": "Queen (20\" x 30\")",
                  "Weight": "3.2 lbs",
                  "Care": "Cover is removable and machine washable",
                  "Features": "Adjustable fill, cooling design"
                },
                url: "https://example.com/bamboo-pillow",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "b1003": {
                id: "b1003",
                title: "Recycled Tire Urban Bike",
                price: 549.50,
                rating: 4.5,
                source: "EcoLiving",
                sustainabilityLevel: 5,
                description: "City bike featuring tires made from recycled rubber and eco-friendly components. This stylish urban commuter bike combines environmental responsibility with practical design. The frame is made from recyclable steel, and components are selected for durability and sustainability.",
                specs: {
                  "Frame": "Recyclable steel frame",
                  "Tires": "Recycled rubber compound",
                  "Gears": "7-speed Shimano",
                  "Weight": "12.5 kg (27.5 lbs)",
                  "Saddle": "Cork and organic cotton",
                  "Handlebars": "Reclaimed wood accents",
                  "Environmental Impact": "Uses 85% recycled or sustainable materials"
                },
                url: "https://example.com/recycled-bicycle",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              }
            },
            "EcoTech": {
              "4": {
                id: 4,
                title: "Solar Power Bank",
                price: 45.99,
                rating: 4.7,
                source: "EcoTech",
                sustainabilityLevel: 3,
                description: "Charge your devices using solar energy. Perfect for outdoor activities. This power bank features a high-efficiency solar panel and a large capacity battery. Includes two USB output ports and one USB-C port.",
                specs: {
                  "Capacity": "10000mAh",
                  "Charging": "Solar + USB",
                  "Output Ports": "2x USB, 1x USB-C",
                  "Solar Panel": "5W",
                  "Weight": "280g",
                  "Dimensions": "5.5\" x 2.8\" x 0.8\""
                },
                url: "https://example.com/solar-powerbank",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "247653": {
                id: "247653",
                title: "Gundam Barbatos Lupus Rex",
                price: 64.99,
                rating: 4.8,
                source: "EcoTech",
                sustainabilityLevel: 5,
                description: "Iron-Blooded Orphans series, with recycled materials. Features the iconic mace weapon.",
                specs: {
                  "Scale": "1/100 Full Mechanics",
                  "Parts": "200+",
                  "Height": "18cm",
                  "Material": "Partly recycled plastic",
                  "Features": "Poseable inner frame"
                },
                url: "https://example.com/product/barbatos-lupus-rex",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "365819": {
                id: "365819",
                title: "Gundam Exia Repair",
                price: 39.99,
                rating: 4.2,
                source: "EcoTech",
                sustainabilityLevel: 2,
                description: "Popular 00 Gundam model with GN sword. Represents the repaired version from the anime.",
                specs: {
                  "Scale": "1/144 HG",
                  "Parts": "120+",
                  "Height": "13cm",
                  "Material": "ABS Plastic",
                  "Features": "Multiple weapons included"
                },
                url: "https://example.com/product/exia-repair",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "p1003": {
                id: "p1003",
                title: "Recycled Down Alternative Pillow",
                price: 32.99,
                rating: 4.7,
                source: "EcoTech",
                sustainabilityLevel: 4,
                description: "Down alternative pillow made from recycled materials. This eco-friendly pillow is filled with 100% recycled polyester fibers from plastic bottles. Offers the soft feel of down without animal products.",
                specs: {
                  "Cover Material": "100% Organic Cotton",
                  "Fill": "Recycled Polyester (from approximately 16 plastic bottles)",
                  "Size": "Standard (20\" x 26\")",
                  "Weight": "1.8 lbs",
                  "Care": "Machine washable",
                  "Environmental Impact": "Diverts plastic from landfills"
                },
                url: "https://example.com/recycled-pillow",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              },
              "b1002": {
                id: "b1002",
                title: "Electric Commuter Bicycle",
                price: 1299.99,
                rating: 4.9,
                source: "EcoTech",
                sustainabilityLevel: 4,
                description: "Energy-efficient e-bike with recycled aluminum frame and solar charging capability. Features a powerful yet efficient electric motor that provides pedal assistance up to 20 mph. The removable battery can be charged via standard outlet or optional solar panel.",
                specs: {
                  "Frame": "Recycled Aluminum",
                  "Motor": "350W Hub Motor",
                  "Battery": "48V 10.4Ah Lithium-ion, removable",
                  "Range": "40-60 miles per charge",
                  "Charging Time": "4 hours (standard), 8 hours (solar)",
                  "Weight": "18 kg (39.6 lbs)",
                  "Max Speed": "20 mph (32 km/h)",
                  "Features": "LCD display, integrated lights, fenders"
                },
                url: "https://example.com/electric-bicycle",
                images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
              }
            }
          };
          
          console.log(`Looking for product with id=${id} in source=${source}`);
          
          // Get product from our demo data
          if (demoProducts[source] && demoProducts[source][id]) {
            setProduct(demoProducts[source][id]);
          } else {
            console.log(`Product not found in demo data: ${source}/${id}. Creating generic product.`);
            
            // Parse the product name from the ID if it contains the format mock-{term}-{number}
            let searchTerm = "";
            if (id.startsWith('mock-')) {
              const parts = id.split('-');
              if (parts.length >= 3) {
                searchTerm = parts[1];
              }
            }
            
            const capitalizedTerm = searchTerm 
              ? searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1) 
              : "Product";
            
            const genericProduct = {
              id: id,
              title: id.includes('1') 
                ? `Eco-Friendly ${capitalizedTerm}` 
                : id.includes('2')
                  ? `Organic ${capitalizedTerm}`
                  : `Recycled ${capitalizedTerm}`,
              price: id.includes('1') ? 49.99 : id.includes('2') ? 39.99 : 29.99,
              rating: id.includes('1') ? 4.5 : id.includes('2') ? 4.3 : 4.7,
              source: source,
              sustainabilityLevel: id.includes('1') ? 5 : 4,
              description: id.includes('1')
                ? `Sustainable and eco-friendly ${searchTerm} made with recycled materials. This product was designed with sustainability in mind, using eco-conscious manufacturing processes and materials that minimize environmental impact.`
                : id.includes('2')
                  ? `Organic ${searchTerm} sourced from sustainable suppliers. Made with natural ingredients and materials that are free from harmful chemicals and pesticides, ensuring a healthy option for you and the planet.`
                  : `Innovative ${searchTerm} made from 100% recycled materials. Giving new life to materials that would otherwise end up in landfills, this product represents a commitment to reducing waste and environmental footprint.`,
              specs: {
                "Material": id.includes('1') 
                  ? "Recycled and sustainable materials" 
                  : id.includes('2')
                    ? "100% organic materials"
                    : "Recycled materials",
                "Certification": id.includes('1')
                  ? "Green Seal, ENERGY STAR"
                  : id.includes('2')
                    ? "USDA Organic, GOTS"
                    : "Cradle to Cradle, FSC",
                "Origin": "Ethically produced",
                "Carbon Footprint": id.includes('1')
                  ? "60% reduction"
                  : id.includes('2')
                    ? "Carbon neutral"
                    : "75% reduction"
              },
              url: `https://example.com/${searchTerm || 'product'}`,
              images: ["https://placehold.co/400x400?text=Product+Image", "https://placehold.co/400x400?text=Product+Image"]
            };
            
            setProduct(genericProduct);
            setLoading(false);
            return;
          }
          
          console.error(`Product not found: ${source}/${id}`);
          setError('Product not found');
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again.');
        setLoading(false);
      }
    };

    if (source && id) {
      fetchProductDetails();
    } else {
      setError('Invalid product information');
      setLoading(false);
    }
  }, [id, source]);

  const renderSustainabilityLevel = (level) => {
    const levels = [];
    for (let i = 1; i <= 5; i++) {
      levels.push(
        <span 
          key={i} 
          className={`inline-block w-4 h-4 rounded-full mr-1 ${i <= level ? 'bg-green-500' : 'bg-gray-200'}`}
        />
      );
    }
    return (
      <div className="flex items-center mb-6">
        {levels}
        <span className="text-sm text-gray-600 ml-2">Sustainability Score: {level}/5</span>
      </div>
    );
  };

  const handleBackToSearch = () => {
    navigate('/product');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#eae9e3] p-6">
      <div className="text-center my-10 text-lg text-gray-600">
        <svg className="animate-spin h-10 w-10 mx-auto text-[#688268]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Loading product details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#eae9e3] p-6">
      <div className="text-center my-10 text-lg text-red-600 bg-red-100 py-4 px-3 rounded">
        {error}
        <button 
          onClick={handleBackToSearch}
          className="mt-4 px-6 py-2 bg-[#688268] text-white rounded hover:bg-[#425442]"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen bg-[#eae9e3] p-6">
      <div className="text-center my-10 text-lg text-red-600 bg-red-100 py-4 px-3 rounded">
        Product not found
        <button 
          onClick={handleBackToSearch}
          className="mt-4 px-6 py-2 bg-[#688268] text-white rounded hover:bg-[#425442]"
        >
          Back to Search
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eae9e3] p-6">
      {/* Back button */}
      <div className="max-w-6xl mx-auto mb-6">
        <button 
          onClick={handleBackToSearch}
          className="flex items-center text-[#4d6b5a] hover:text-[#688268] font-semibold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Search
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6">
          <div className="flex flex-col">
            <div className="bg-white rounded-lg overflow-hidden shadow h-96 flex items-center justify-center mb-5">
              <ProductImage 
                src={product.images[selectedImage]} 
                alt={product.title} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`w-16 h-16 rounded overflow-hidden cursor-pointer bg-white shadow flex items-center justify-center ${
                      selectedImage === index ? 'opacity-100 shadow-md' : 'opacity-70'
                    } hover:opacity-100 transition-opacity`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <ProductImage 
                      src={image} 
                      alt={`${product.title} - Thumbnail ${index + 1}`} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="bg-[#f8f8f6] px-4 py-2 inline-block rounded-full text-sm font-medium text-[#4d6b5a] mb-4">
              {product.source}
            </div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">{product.title}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="ml-1 text-gray-600">{product.rating}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#4d6b5a] mb-6">${product.price}</p>
            {renderSustainabilityLevel(product.sustainabilityLevel)}
            
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-200">Description</h3>
                <p className="text-base leading-relaxed text-gray-600">{product.description}</p>
              </div>
            )}
            
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-200">Specifications</h3>
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-200">
                        <td className="py-2 font-medium text-gray-600 w-2/5 text-sm">{key}</td>
                        <td className="py-2 text-sm">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-8 flex flex-wrap gap-3">
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block px-6 py-3 bg-[#688268] text-white rounded-lg font-medium hover:bg-[#425442] transition-colors"
              >
                View on {product.source}
              </a>
              <button
                onClick={handleBackToSearch}
                className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;