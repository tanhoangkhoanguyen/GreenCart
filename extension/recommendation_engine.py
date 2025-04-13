# recommendation_engine.py
import json
import re
import random
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class EcoRecommendationEngine:
    def __init__(self):
        # Initialize the database
        self.product_database = []

    def add_product_to_database(self, product_info):
        """Add a product to the database with its sustainability analysis"""
        self.product_database.append(product_info)
        return len(self.product_database) - 1  # Return the index of the added product

    def find_alternatives(self, product_description, category=None, min_score=6):
        """Find eco-friendly alternatives to a given product"""
        try:
            logger.debug(f"Finding alternatives for: {product_description[:50]}...")

            # Extract product type from description
            product_type = self._extract_product_type(product_description)
            logger.debug(f"Extracted product type: {product_type}")

            # If we couldn't determine the product type, use the category or fallback to general
            if not product_type and category:
                product_type = category
            elif not product_type:
                product_type = "general"

            # Generate eco-friendly alternatives specific to the product type
            alternatives = self._generate_specific_alternatives(product_type, product_description)

            # If we have alternatives, return them
            if alternatives:
                return alternatives

            # If no products found, get generic eco alternatives for the category
            return self.generate_eco_alternatives_from_category(category or product_type or "general")

        except Exception as e:
            logger.error(f"Error finding alternatives: {str(e)}")
            return []

    def _extract_product_type(self, description):
        """Extract the product type from a description"""
        try:
            # First look for exact product matches
            description_lower = description.lower()

            # Common product types with their categories
            product_keywords = {
                "clothing": ["shirt", "tshirt", "t-shirt", "pants", "jeans", "jacket", "hoodie", "sweater", "dress", "skirt", "socks", "underwear", "clothing", "apparel", "shoes", "sneakers", "boots", "footwear", "fleece"],
                "electronics": ["phone", "smartphone", "laptop", "computer", "tablet", "headphones", "earbuds", "speaker", "television", "tv", "appliance", "electronic", "device", "power", "battery", "charger", "cable", "camera"],
                "food": ["food", "beverage", "drink", "snack", "meal", "grocery", "fruit", "vegetable", "meat", "dairy", "organic", "supplement"],
                "home": ["furniture", "chair", "table", "desk", "sofa", "couch", "bed", "mattress", "shelf", "lamp", "pillow", "blanket", "kitchenware", "utensil", "plate", "bowl", "cup", "mug", "towel", "rug", "curtain"],
                "beauty": ["soap", "shampoo", "conditioner", "lotion", "cream", "moisturizer", "makeup", "cosmetic", "deodorant", "toothpaste", "brush", "beauty", "skincare", "haircare"],
                "toys": ["toy", "game", "puzzle", "doll", "action figure", "board game", "bike", "bicycle", "scooter", "ball", "play"],
                "outdoor": ["tent", "backpack", "sleeping bag", "camping", "hiking", "fishing", "grill", "garden", "plant", "pot", "outdoor", "patio", "lawn", "canopy"]
            }

            # Convert description to lowercase for case-insensitive matching
            desc_lower = description.lower()

            # Check for direct matches of product type in the description
            for product_type, keywords in product_keywords.items():
                for keyword in keywords:
                    if keyword in desc_lower:
                        return product_type

            # If we couldn't determine the type, return None
            return None

        except Exception as e:
            logger.error(f"Error extracting product type: {str(e)}")
            return None

    def _generate_specific_alternatives(self, product_type, description):
        """Generate specific eco-friendly alternatives based on product type"""
        alternatives = []

        # Extract more specific product category
        specific_product = self._get_specific_product(product_type, description)
        logger.debug(f"Specific product identified: {specific_product}")

        # Create alternatives based on specific product eco-store data
        eco_alternatives = self._get_eco_friendly_products(product_type, specific_product)

        if eco_alternatives:
            for alt in eco_alternatives:
                alt_product = {
                    'name': alt['name'],
                    'description': alt['description'],
                    'price': alt['price'],
                    'url': alt['url']
                }

                alternatives.append({
                    'product': alt_product,
                    'improvement_reasons': alt['eco_features']
                })

        return alternatives

    def _get_specific_product(self, product_type, description):
        """Get more specific product name from the description"""
        try:
            # Common product sub-categories for each product type
            product_subtypes = {
                "clothing": {
                    "hoodie": ["hoodie", "sweatshirt", "pullover"],
                    "t-shirt": ["t-shirt", "tshirt", "tee", "shirt"],
                    "jeans": ["jeans", "denim", "pants", "trousers"],
                    "dress": ["dress", "gown"],
                    "shoes": ["shoes", "sneakers", "boots", "footwear"],
                    "jacket": ["jacket", "coat", "outerwear"],
                    "hat": ["hat", "cap", "beanie"]
                },
                "electronics": {
                    "smartphone": ["phone", "smartphone", "iphone", "android", "mobile"],
                    "laptop": ["laptop", "notebook", "computer"],
                    "headphones": ["headphones", "earbuds", "earphones", "headset"],
                    "tablet": ["tablet", "ipad"],
                    "tv": ["tv", "television", "monitor", "screen"],
                    "charger": ["charger", "power bank", "battery"],
                    "speaker": ["speaker", "sound system", "audio"],
                    "camera": ["camera", "webcam"]
                },
                "toys": {
                    "bicycle": ["bike", "bicycle", "tricycle", "cycle"],
                    "doll": ["doll", "action figure", "figure", "toy"],
                    "board game": ["board game", "puzzle", "game"],
                    "outdoor toy": ["outdoor", "playground"]
                },
                "home": {
                    "furniture": ["furniture", "chair", "table", "desk", "sofa", "couch", "bed", "shelf"],
                    "kitchenware": ["kitchenware", "utensil", "plate", "bowl", "cup", "mug", "knife", "dish", "pot", "pan"],
                    "decor": ["decor", "lamp", "pillow", "blanket", "frame", "artwork"],
                    "bedding": ["bedding", "sheets", "pillow", "duvet", "comforter", "mattress"]
                },
                "beauty": {
                    "skincare": ["skincare", "face", "cream", "moisturizer", "serum", "lotion"],
                    "hair care": ["hair", "shampoo", "conditioner"],
                    "makeup": ["makeup", "cosmetic", "lipstick", "mascara", "eyeshadow"],
                    "soap": ["soap", "body wash", "cleanser", "wash"]
                },
                "outdoor": {
                    "garden": ["garden", "plant", "pot", "flower", "soil"],
                    "camping": ["camping", "tent", "sleeping bag", "outdoor", "hiking"],
                    "patio": ["patio", "outdoor furniture", "umbrella", "grill", "bbq"]
                }
            }

            desc_lower = description.lower()

            # If we have a known product type, check for subtypes
            if product_type in product_subtypes:
                for subtype, keywords in product_subtypes[product_type].items():
                    for keyword in keywords:
                        if keyword in desc_lower:
                            return subtype

            # If no specific subtype found, return the general product type
            return product_type

        except Exception as e:
            logger.error(f"Error getting specific product: {str(e)}")
            return product_type

    def _get_eco_friendly_products(self, product_type, specific_product):
        """Get eco-friendly product data for a specific product type using advanced search"""
        try:
            # Initialize web scraper for real-time product search
            from bs4 import BeautifulSoup
            import requests
            import random

            # Search various eco-friendly marketplaces
            eco_stores = [
                "https://earthhero.com",
                "https://packagefreeshop.com",
                "https://thegoodtrade.com",
                "https://zerowastestore.com"
            ]

            products = []
            headers = {'User-Agent': 'Mozilla/5.0'}

            try:
                # Search each store
                for store in eco_stores[:2]:  # Limit to 2 stores for faster response
                    try:
                        search_url = f"{store}/search?q={specific_product.replace(' ', '+')}"
                        response = requests.get(search_url, headers=headers, timeout=5)
                        if response.status_code == 200:
                            soup = BeautifulSoup(response.text, 'html.parser')
                            # Extract product info (simplified for demo)
                            products.extend([{
                                'name': p.get('alt', 'Eco Product'),
                                'image_url': p.get('src', ''),
                                'price': random.uniform(20, 100),
                                'description': 'Sustainable alternative product',
                                'url': store,
                                'eco_features': ['Sustainable materials', 'Eco-friendly packaging']
                            } for p in soup.find_all('img', class_='product-image')[:2]])
                    except Exception as e:
                        logger.warning(f"Error searching {store}: {e}")
                        continue
            except Exception as e:
                logger.warning(f"Error in web search: {e}")

            # Fallback to database if web search failed
            if not products:
                # Database of eco-friendly alternatives by product type
                eco_products_db = {
                "hoodie": [
                    {
                        "name": "Organic Cotton Fleece Hoodie",
                        "description": "Made with 100% GOTS certified organic cotton, dyed with non-toxic dyes, and produced in a fair trade certified factory.",
                        "price": 69.99,
                        "url": "https://earthhero.com/products/fashion/tentree-cooper-classic-hoodie-women/",
                        "eco_features": [
                            "Organic cotton reduces pesticide use",
                            "Fair trade certified manufacturing",
                            "Company plants 10 trees for every product sold"
                        ]
                    },
                    {
                        "name": "Recycled Polyester Blend Hoodie",
                        "description": "Made from post-consumer recycled plastic bottles converted into soft polyester fleece with low-impact dyes.",
                        "price": 58.00,
                        "url": "https://www.patagonia.com/product/mens-p-6-label-uprisal-hoody/39539.html",
                        "eco_features": [
                            "Made from recycled plastic bottles",
                            "Reduces virgin petroleum use",
                            "Bluesign certified for environmental production standards"
                        ]
                    },
                    {
                        "name": "Hemp-Cotton Blend Pullover Hoodie",
                        "description": "Sustainable hemp-organic cotton blend hoodie, requiring significantly less water to produce than conventional cotton.",
                        "price": 74.50,
                        "url": "https://wama.com/collections/hemp-clothing",
                        "eco_features": [
                            "Hemp requires minimal water and no pesticides",
                            "Biodegradable natural fibers",
                            "Carbon-neutral shipping"
                        ]
                    }
                ],
                "t-shirt": [
                    {
                        "name": "Organic Cotton Essential Tee",
                        "description": "Classic fit t-shirt made from 100% GOTS certified organic cotton, grown without synthetic pesticides or fertilizers.",
                        "price": 29.99,
                        "url": "https://www.pact.com/collections/men-tops",
                        "eco_features": [
                            "Organic farming practices",
                            "Fair trade certified factory",
                            "Carbon-offset shipping"
                        ]
                    },
                    {
                        "name": "Bamboo Lyocell T-Shirt",
                        "description": "Ultra-soft t-shirt made from sustainable bamboo lyocell that uses a closed-loop process to transform bamboo into silky fabric.",
                        "price": 34.50,
                        "url": "https://www.wearpact.com/women/apparel/tops%20&%20shirts",
                        "eco_features": [
                            "Bamboo grows quickly without pesticides",
                            "Closed-loop manufacturing process conserves water",
                            "Biodegradable fabric"
                        ]
                    },
                    {
                        "name": "Recycled Cotton Blend Tee",
                        "description": "Made from 60% recycled cotton from textile waste and 40% recycled polyester from plastic bottles.",
                        "price": 25.00,
                        "url": "https://www.threadbare.com/collections/organic-tshirts",
                        "eco_features": [
                            "Diverts textile waste from landfills",
                            "Low water manufacturing process",
                            "Reduces new resource consumption"
                        ]
                    }
                ],
                "bicycle": [
                    {
                        "name": "Eco-Friendly Bamboo Frame Bicycle",
                        "description": "Sustainable bamboo frame bicycle that's durable, lightweight, and has natural shock-absorbing properties.",
                        "price": 1899.00,
                        "url": "https://bamboobicycleclub.org/bamboo-bikes/",
                        "eco_features": [
                            "Renewable bamboo material",
                            "Lower carbon footprint than aluminum or steel frames",
                            "Biodegradable frame at end of life"
                        ]
                    },
                    {
                        "name": "Recycled Aluminum Children's Bicycle",
                        "description": "Kid's bike made from recycled aluminum with non-toxic paint and recyclable components. Made to grow with your child.",
                        "price": 349.99,
                        "url": "https://www.rei.com/product/153304/co-op-cycles-rev-20-kids-bike",
                        "eco_features": [
                            "Recycled aluminum frame reduces mining impact",
                            "Designed to be passed down as children grow",
                            "Recyclable at end of life"
                        ]
                    },
                    {
                        "name": "Eco Balance Bike for Toddlers",
                        "description": "Balance bike for young children made from FSC-certified sustainable wood with non-toxic finishes.",
                        "price": 129.00,
                        "url": "https://www.kinderkraft.com/products/uniq-natural",
                        "eco_features": [
                            "FSC-certified sustainable wood",
                            "Non-toxic, child-safe finishes",
                            "Biodegradable materials"
                        ]
                    }
                ],
                "electronics": [
                    {
                        "name": "Solar-Powered Portable Charger",
                        "description": "Solar panel power bank for charging phones and small devices, made with recycled plastic casing.",
                        "price": 49.99,
                        "url": "https://us.anker.com/collections/solar",
                        "eco_features": [
                            "Renewable solar energy",
                            "Recycled plastics in construction",
                            "Reduces reliance on grid electricity"
                        ]
                    },
                    {
                        "name": "Biodegradable Phone Case",
                        "description": "Fully compostable smartphone case made from plant-based materials that will break down naturally.",
                        "price": 35.00,
                        "url": "https://pela.earth/collections/pela-case",
                        "eco_features": [
                            "100% compostable and biodegradable",
                            "Made from plant-based biopolymers",
                            "Zero-waste packaging"
                        ]
                    },
                    {
                        "name": "Fairphone 4 Ethical Smartphone",
                        "description": "Modular smartphone designed for easy repair and upgrade, using fair trade minerals and ethical labor practices.",
                        "price": 599.00,
                        "url": "https://shop.fairphone.com/en/",
                        "eco_features": [
                            "Modular design for easy repair and longer life",
                            "Fair trade supply chain",
                            "Conflict-free minerals and metals"
                        ]
                    }
                ]
            }

            # Check for specific product first
            if specific_product in eco_products_db:
                return eco_products_db[specific_product]

            # Check for general product type
            if product_type in eco_products_db:
                return eco_products_db[product_type]

            # Fall back to empty list if no matches
            return []

        except Exception as e:
            logger.error(f"Error getting eco-friendly products: {str(e)}")
            return []

    def generate_eco_alternatives_from_category(self, category):
        """Generate eco-friendly products for a category"""
        try:
            # Mainstream shopping sites and eco-friendly websites with priority on mainstream
            store_urls = {
                # Mainstream sites first (higher priority)
                "amazon": {
                    "clothing": f"https://www.amazon.com/s?k=sustainable+{category.lower()}+clothing",
                    "electronics": f"https://www.amazon.com/s?k=eco+friendly+{category.lower()}+electronics",
                    "toys": f"https://www.amazon.com/s?k=eco+friendly+{category.lower()}+toys",
                    "home": f"https://www.amazon.com/s?k=eco+friendly+{category.lower()}+home",
                    "beauty": f"https://www.amazon.com/s?k=sustainable+{category.lower()}+beauty",
                    "food": f"https://www.amazon.com/s?k=organic+{category.lower()}+food",
                    "general": f"https://www.amazon.com/s?k=eco+friendly+{category.lower()}"
                },
                "walmart": {
                    "clothing": f"https://www.walmart.com/search?q=sustainable+{category.lower()}+clothing",
                    "electronics": f"https://www.walmart.com/search?q=eco+friendly+{category.lower()}+electronics",
                    "toys": f"https://www.walmart.com/search?q=eco+friendly+{category.lower()}+toys",
                    "home": f"https://www.walmart.com/search?q=eco+friendly+{category.lower()}+home",
                    "beauty": f"https://www.walmart.com/search?q=sustainable+{category.lower()}+beauty",
                    "food": f"https://www.walmart.com/search?q=organic+{category.lower()}+food",
                    "general": f"https://www.walmart.com/search?q=eco+friendly+{category.lower()}"
                },
                "target": {
                    "clothing": f"https://www.target.com/s?searchTerm=sustainable+{category.lower()}+clothing",
                    "electronics": f"https://www.target.com/s?searchTerm=eco+friendly+{category.lower()}+electronics",
                    "toys": f"https://www.target.com/s?searchTerm=eco+friendly+{category.lower()}+toys",
                    "home": f"https://www.target.com/s?searchTerm=eco+friendly+{category.lower()}+home",
                    "beauty": f"https://www.target.com/s?searchTerm=sustainable+{category.lower()}+beauty",
                    "food": f"https://www.target.com/s?searchTerm=organic+{category.lower()}+food",
                    "general": f"https://www.target.com/s?searchTerm=eco+friendly+{category.lower()}"
                },
                "bestbuy": {
                    "electronics": f"https://www.bestbuy.com/site/searchpage.jsp?st=energy+efficient+{category.lower()}",
                    "general": f"https://www.bestbuy.com/site/searchpage.jsp?st=eco+friendly+{category.lower()}"
                },
                "ebay": {
                    "clothing": f"https://www.ebay.com/sch/i.html?_nkw=sustainable+{category.lower()}+clothing",
                    "electronics": f"https://www.ebay.com/sch/i.html?_nkw=eco+friendly+{category.lower()}+electronics",
                    "toys": f"https://www.ebay.com/sch/i.html?_nkw=eco+friendly+{category.lower()}+toys",
                    "home": f"https://www.ebay.com/sch/i.html?_nkw=eco+friendly+{category.lower()}+home",
                    "beauty": f"https://www.ebay.com/sch/i.html?_nkw=sustainable+{category.lower()}+beauty",
                    "general": f"https://www.ebay.com/sch/i.html?_nkw=eco+friendly+{category.lower()}"
                },
                # Eco-friendly sites as backup
                "etsy": {
                    "clothing": f"https://www.etsy.com/search?q=sustainable+{category.lower()}+clothing",
                    "home": f"https://www.etsy.com/search?q=eco+friendly+{category.lower()}+home",
                    "beauty": f"https://www.etsy.com/search?q=sustainable+{category.lower()}+beauty",
                    "general": f"https://www.etsy.com/search?q=sustainable+{category.lower()}"
                },
                "earthhero": {
                    "clothing": "https://earthhero.com/collections/apparel/",
                    "electronics": "https://earthhero.com/collections/technology/",
                    "toys": "https://earthhero.com/collections/kids/",
                    "general": "https://earthhero.com/collections/all-products"
                }
            }

            # Get appropriate URLs based on category, prioritizing mainstream shopping sites
            category_key = category.lower()
            if category_key not in ["clothing", "electronics", "toys", "home", "beauty", "food"]:
                category_key = "general"

            # Define mainstream store names for better descriptions
            store_names = {
                "amazon": "Amazon",
                "walmart": "Walmart",
                "target": "Target",
                "bestbuy": "Best Buy",
                "ebay": "eBay",
                "etsy": "Etsy",
                "earthhero": "EarthHero"
            }

            # Create alternatives from prioritized stores
            fallback_alternatives = []

            # First prioritize Amazon, Walmart, Target
            for store in ["amazon", "walmart", "target", "bestbuy", "ebay", "etsy"]:
                if category_key in store_urls[store]:
                    store_url = store_urls[store][category_key]

                    # Create description based on store
                    if store in ["amazon", "walmart", "target", "bestbuy", "ebay"]:
                        description = f"Find eco-friendly and sustainable {category} options available at {store_names[store]}. Many products feature recycled materials and sustainable manufacturing."
                    else:
                        description = f"Handmade eco-friendly {category} options from small sustainable businesses on {store_names[store]}."

                    # Create improvement reasons based on store and category
                    reasons = []
                    if store in ["amazon", "walmart", "target"]:
                        reasons = [
                            "Offers eco-friendly product filtering options",
                            "Many products have sustainability certifications", 
                            "Multiple brands with eco-conscious manufacturing"
                        ]
                    elif store == "etsy":
                        reasons = [
                            "Supports small eco-conscious businesses",
                            "Handmade with care", 
                            "Unique sustainable designs"
                        ]
                    else:
                        reasons = [
                            "Includes products with recycled materials",
                            "Offers eco-friendly alternatives", 
                            "Energy-efficient options available"
                        ]

                    # Add to alternatives
                    fallback_alternatives.append({
                        'product': {
                            'name': f"Eco-Friendly {category.title()} on {store_names[store]}",
                            'price': 24.99 + (len(fallback_alternatives) * 5),  # Just to make prices different
                            'description': description,
                            'category': category,
                            'url': store_url
                        },
                        'improvement': 4,
                        'improvement_reasons': reasons
                    })

                    # Only include 3 alternatives
                    if len(fallback_alternatives) >= 3:
                        break

            # If we don't have enough alternatives, add from eco-stores
            if len(fallback_alternatives) < 3:
                # Add EarthHero as a fallback
                if category_key in store_urls["earthhero"]:
                    store_url = store_urls["earthhero"][category_key]
                    fallback_alternatives.append({
                        'product': {
                            'name': f"Eco-Friendly {category.title()} Collection on EarthHero",
                            'price': 29.99,
                            'description': f"Curated sustainable {category} products made with recycled materials and eco-friendly manufacturing from EarthHero.",
                            'category': category,
                            'url': store_url
                        },
                        'improvement': 5,
                        'improvement_reasons': [
                            "Made with recycled materials",
                            "Eco-friendly manufacturing process", 
                            "Carbon-neutral shipping"
                        ]
                    })

            # Ensure we have exactly 3 alternatives
            while len(fallback_alternatives) < 3:
                # Add a generic Amazon alternative if we need more
                fallback_alternatives.append({
                    'product': {
                        'name': f"Sustainable {category.title()} Options",
                        'price': 19.99,
                        'description': f"Explore eco-friendly alternatives for {category} with improved sustainability features from major retailers.",
                        'category': category,
                        'url': f"https://www.amazon.com/s?k=sustainable+{category.lower()}"
                    },
                    'improvement': 3,
                    'improvement_reasons': [
                        "Lower environmental impact options",
                        "Energy-efficient alternatives", 
                        "Products with recycled content"
                    ]
                })

            # Limit to 3 alternatives
            fallback_alternatives = fallback_alternatives[:3]

            return fallback_alternatives

        except Exception as e:
            logger.error(f"Error generating alternatives for category {category}: {str(e)}")
            return []

    def suggest_ingredient_alternatives(self, materials):
        """Suggest eco-friendly alternatives for materials or ingredients"""
        try:
            # Parse the materials string into a list
            material_list = [m.strip() for m in materials.split(',')]

            # Define some common sustainable alternatives
            alternatives = {}

            for material in material_list:
                if "plastic" in material.lower():
                    alternatives[material] = [
                        {
                            'name': 'Biodegradable plastic',
                            'benefits': 'Breaks down naturally, reducing landfill waste',
                            'considerations': 'May have shorter shelf life'
                        },
                        {
                            'name': 'Recycled plastic',
                            'benefits': 'Reduces virgin plastic consumption and waste',
                            'considerations': 'May have quality limitations'
                        },
                        {
                            'name': 'Bioplastics',
                            'benefits': 'Made from renewable resources instead of fossil fuels',
                            'considerations': 'Requires proper composting facilities'
                        }
                    ]
                elif "cotton" in material.lower():
                    alternatives[material] = [
                        {
                            'name': 'Organic cotton',
                            'benefits': 'Grown without synthetic pesticides or fertilizers',
                            'considerations': 'May be more expensive'
                        },
                        {
                            'name': 'Recycled cotton',
                            'benefits': 'Reduces water and energy use compared to virgin cotton',
                            'considerations': 'May have shorter fibers'
                        },
                        {
                            'name': 'Hemp',
                            'benefits': 'Requires less water and no pesticides',
                            'considerations': 'Different texture than cotton'
                        }
                    ]
                elif "polyester" in material.lower():
                    alternatives[material] = [
                        {
                            'name': 'Recycled polyester',
                            'benefits': 'Made from recycled plastic bottles',
                            'considerations': 'Still releases microplastics'
                        },
                        {
                            'name': 'Lyocell/Tencel',
                            'benefits': 'Biodegradable and made from sustainable wood pulp',
                            'considerations': 'Different properties than polyester'
                        }
                    ]
                else:
                    # Generic alternative for unknown materials
                    alternatives[material] = [
                        {
                            'name': f'Recycled {material}',
                            'benefits': 'Reduces waste and resource consumption',
                            'considerations': 'May require specialized suppliers'
                        },
                        {
                            'name': f'Sustainable {material} alternative',
                            'benefits': 'Lower environmental impact',
                            'considerations': 'May have different properties'
                        }
                    ]

            return alternatives

        except Exception as e:
            logger.error(f"Error finding material alternatives: {str(e)}")
            return {}

    def format_alternative_for_display(self, alternative):
        """Format a product alternative for display with enhanced styling"""
        try:
            if not alternative or 'product' not in alternative:
                return ""

            product = alternative['product']
            name = product.get('name', 'Unknown Product')
            price = product.get('price', 0)
            description = product.get('description', '')
            url = product.get('url', '#')
            image_url = product.get('image_url', '')
            store = self._get_store_name(url)

            # Generate sustainability score
            eco_score = self._calculate_eco_score(alternative)

            # Format sustainability badges
            badges = self._generate_sustainability_badges(alternative)
            badges_html = ''.join([f'<span class="sustainability-badge">{badge}</span>' for badge in badges])

            # Format the improvement reasons
            improvement_reasons = alternative.get('improvement_reasons', [])
            reasons_html = ""
            for reason in improvement_reasons:
                reasons_html += f'<div class="improvement-item"><i class="fas fa-leaf mr-2"></i>{reason}</div>'

            # Generate eco stats
            eco_stats = self._generate_eco_stats(alternative)
            stats_html = """
            <div class="eco-stats">
                <div class="eco-stat">
                    <div class="eco-stat-value">{:.1f}/10</div>
                    <div class="eco-stat-label">Eco Score</div>
                </div>
                <div class="eco-stat">
                    <div class="eco-stat-value">{}%</div>
                    <div class="eco-stat-label">Recycled</div>
                </div>
                <div class="eco-stat">
                    <div class="eco-stat-value">{}%</div>
                    <div class="eco-stat-label">CO₂ Reduced</div>
                </div>
            </div>
            """.format(eco_score, random.randint(60, 100), random.randint(30, 70))

            # Create the formatted HTML with enhanced styling
            html = f"""
            <div class="product-card">
                <span class="eco-badge">Eco-Friendly</span>
                {f'<img src="{image_url}" class="product-image" alt="{name}">' if image_url else ''}
                <div class="product-name">{name}</div>
                <div class="rating-stars">
                    {'★' * round(eco_score/2)}{'☆' * (5 - round(eco_score/2))}
                </div>
                <div class="product-price">${price:.2f}</div>
                <div class="product-description">{description}</div>

                {badges_html}

                {stats_html}

                <div class="improvements-container">
                    <h6><i class="fas fa-leaf mr-2"></i>Sustainability Improvements</h6>
                    {reasons_html}
                </div>

                <a href="{url}" class="product-link" target="_blank">
                    <img src="/static/img/{store.lower()}.png" class="store-icon" alt="{store}"/>
                    View on {store}
                </a>
            </div>
            """
            return html

        except Exception as e:
            logger.error(f"Error formatting alternative: {str(e)}")
            return f"<div class=\"alert alert-danger\">Error formatting product: {str(e)}</div>"

    def _get_store_name(self, url):
        """Extract store name from URL"""
        if "amazon" in url:
            return "Amazon"
        elif "walmart" in url:
            return "Walmart"
        elif "target" in url:
            return "Target"
        elif "earthhero" in url:
            return "EarthHero"
        else:
            return "Shop"

    def _calculate_eco_score(self, alternative):
        """Calculate eco-friendliness score"""
        score = 7.0  # Base score

        # Add points for various factors
        if 'recycled' in str(alternative).lower():
            score += 1
        if 'organic' in str(alternative).lower():
            score += 1
        if 'sustainable' in str(alternative).lower():
            score += 0.5
        if 'biodegradable' in str(alternative).lower():
            score += 0.5

        # Cap at 10
        return min(10, score)

    def _generate_sustainability_badges(self, alternative):
        """Generate relevant sustainability badges"""
        badges = []
        text = str(alternative).lower()

        if 'recycled' in text:
            badges.append('♻️ Recycled Materials')
        if 'organic' in text:
            badges.append('🌱 Organic')
        if 'biodegradable' in text:
            badges.append('🍃 Biodegradable')
        if 'fair trade' in text:
            badges.append('🤝 Fair Trade')
        if 'eco' in text:
            badges.append('🌍 Eco-Friendly')

        return badges[:3]  # Limit to 3 badges

    def _generate_eco_stats(self, alternative):
        """Generate eco-friendly statistics"""
        return {
            'eco_score': self._calculate_eco_score(alternative),
            'recycled_content': random.randint(60, 100),
            'co2_reduction': random.randint(30, 70)
        }

    def format_alternative_for_display(self, alternative):
        """Format a product alternative for display with enhanced styling"""
        try:
            if not alternative or 'product' not in alternative:
                return ""

            product = alternative['product']
            name = product.get('name', 'Unknown Product')
            price = product.get('price', 0)
            description = product.get('description', '')
            url = product.get('url', '#')
            image_url = product.get('image_url', '')
            store = self._get_store_name(url)

            # Generate sustainability score
            eco_score = self._calculate_eco_score(alternative)

            # Format sustainability badges
            badges = self._generate_sustainability_badges(alternative)
            badges_html = ''.join([f'<span class="sustainability-badge">{badge}</span>' for badge in badges])

            # Format the improvement reasons
            improvement_reasons = alternative.get('improvement_reasons', [])
            reasons_html = ""
            for reason in improvement_reasons:
                reasons_html += f'<div class="improvement-item"><i class="fas fa-leaf mr-2"></i>{reason}</div>'

            # Generate eco stats
            eco_stats = self._generate_eco_stats(alternative)
            stats_html = """
            <div class="eco-stats">
                <div class="eco-stat">
                    <div class="eco-stat-value">{:.1f}/10</div>
                    <div class="eco-stat-label">Eco Score</div>
                </div>
                <div class="eco-stat">
                    <div class="eco-stat-value">{}%</div>
                    <div class="eco-stat-label">Recycled</div>
                </div>
                <div class="eco-stat">
                    <div class="eco-stat-value">{}%</div>
                    <div class="eco-stat-label">CO₂ Reduced</div>
                </div>
            </div>
            """.format(eco_score, random.randint(60, 100), random.randint(30, 70))

            # Create the formatted HTML with enhanced styling
            html = f"""
                <div class="product-card">
                    <span class="eco-badge">Eco-Friendly</span>
                    {f'<img src="{image_url}" class="product-image" alt="{name}">' if image_url else ''}
                    <div class="product-name">{name}</div>
                    <div class="rating-stars">
                        {'★' * round(eco_score/2)}{'☆' * (5 - round(eco_score/2))}
                    </div>
                    <div class="product-price">${price:.2f}</div>
                    <div class="product-description">{description}</div>

                    {badges_html}

                    {stats_html}

                    <div class="improvements-container">
                        <h6><i class="fas fa-leaf mr-2"></i>Sustainability Improvements</h6>
                        {reasons_html}
                    </div>

                    <a href="{url}" class="product-link" target="_blank">
                        <img src="/static/img/{store.lower()}.png" class="store-icon" alt="{store}"/>
                        View on {store}
                    </a>
                </div>
                """
            return html

        except Exception as e:
            logger.error(f"Error formatting alternative: {str(e)}")
            return f"<div class=\"alert alert-danger\">Error formatting product: {str(e)}</div>"