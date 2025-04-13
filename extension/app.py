# app.py
from flask import Flask, render_template, request, jsonify, redirect, url_for
from werkzeug.utils import secure_filename
import os
import io
import logging
from dotenv import load_dotenv
import google.generativeai as genai

# Import custom modules
from ai_analysis_service import SustainabilityAnalyzer
from recommendation_engine import EcoRecommendationEngine

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Google API
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    logger.error("GOOGLE_API_KEY not found in environment variables")
    raise ValueError("GOOGLE_API_KEY is required. Please set it in the .env file.")
genai.configure(api_key=api_key)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "supersecretkey")

# Configure upload folder for images
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Max upload size: 16MB

# Initialize analyzer and recommendation engine
analyzer = SustainabilityAnalyzer()
recommendation_engine = EcoRecommendationEngine()

# Preload some sample products
def preload_sample_products():
    sample_products = [
        {
            "name": "Regular Cotton T-shirt",
            "category": "clothing",
            "description": "Cotton t-shirt made in Bangladesh. Machine washable. 100% cotton.",
            "price": 15.99
        },
        {
            "name": "Organic Cotton T-shirt",
            "category": "clothing",
            "description": "Organic cotton t-shirt made with renewable energy in a fair-trade certified facility. "
            "Made with 100% GOTS certified organic cotton. Low-impact dyes. Carbon-neutral shipping.",
            "price": 29.99
        },
        {
            "name": "Recycled Polyester Jacket",
            "category": "clothing",
            "description": "Jacket made from 80% recycled plastic bottles. Water-resistant coating without PFCs. "
            "Designed for circularity with easily separable components for recycling at end of life.",
            "price": 89.99
        },
        {
            "name": "Bamboo Toothbrush",
            "category": "personal care",
            "description": "Biodegradable bamboo toothbrush with plant-based bristles. "
            "Comes in recyclable paper packaging. Carbon-neutral shipping.",
            "price": 4.99
        },
        {
            "name": "Plastic Bottled Water",
            "category": "beverages",
            "description": "Spring water in single-use plastic bottle. Purified and bottled at source.",
            "price": 1.99
        },
        {
            "name": "Reusable Water Bottle",
            "category": "beverages",
            "description": "Stainless steel water bottle, BPA free, double-walled insulation. "
            "Keeps drinks cold for 24 hours or hot for 12 hours. Durable and recyclable.",
            "price": 24.99
        }
    ]
    
    for product in sample_products:
        recommendation_engine.add_product_to_database(product)
    
    logger.info(f"Preloaded {len(sample_products)} sample products")

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_product():
    try:
        description = request.form.get('description')
        category = request.form.get('category', '')
        
        if not description:
            return jsonify({"error": "Product description is required"}), 400
            
        logger.debug(f"Analyzing product: {description[:50]}...")
        
        # Analyze the product
        analysis = analyzer.analyze_product_description(description)
        
        # Return the analysis
        return jsonify({"analysis": analysis})
    
    except Exception as e:
        logger.error(f"Error analyzing product: {str(e)}")
        return jsonify({"analysis": {"error": f"Error analyzing product: {str(e)}"}}), 500



@app.route('/alternatives', methods=['POST'])
def find_alternatives():
    try:
        description = request.form.get('description')
        category = request.form.get('category', '')
        
        if not description:
            return jsonify({"error": "Product description is required"}), 400
            
        logger.debug(f"Finding alternatives for: {description[:50]}...")
        
        # Find alternatives
        alternatives = recommendation_engine.find_alternatives(description, category)
        
        # Return the alternatives
        return jsonify({"alternatives": alternatives})
    
    except Exception as e:
        logger.error(f"Error finding alternatives: {str(e)}")
        return jsonify({"alternatives": [], "error": f"Error finding alternatives: {str(e)}"}), 500

@app.route('/upload_image', methods=['POST'])
def upload_image():
    try:
        # Check if the post request has the image file
        if 'image' not in request.files:
            logger.error("No image file in request")
            return jsonify({"error": "No image file provided"}), 400
            
        file = request.files['image']
        
        # If the user does not select a file, the browser submits an empty file
        if file.filename == '':
            logger.error("Empty filename in request")
            return jsonify({"error": "No image selected"}), 400
            
        if file:
            # Save the uploaded file
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            logger.debug(f"Image uploaded to: {file_path}")
            
            # Analyze the image
            with open(file_path, "rb") as img_file:
                image_data = img_file.read()
            
            # Use the analyzer to process the image
            logger.debug(f"Starting image analysis for {filename}")
            analysis = analyzer.analyze_product_image(image_data)
            logger.debug(f"Analysis completed: {str(analysis)[:500]}...")
            
            if not analysis or "error" in analysis:
                logger.error(f"Analysis returned error or empty result: {analysis.get('error') if analysis else 'None'}")
                return jsonify({
                    "error": "Unable to analyze image",
                    "details": analysis.get("error") if analysis else "No analysis returned",
                    "analysis": analysis
                })
            
            # Format the analysis for display
            formatted_analysis = analyzer.format_analysis_for_display(analysis)
            logger.debug(f"Formatted analysis generated, length: {len(formatted_analysis)}")
            
            # Find eco-friendly alternatives based on detected product
            product_name = ""
            product_description = ""
            if "image_analysis" in analysis and "product_name" in analysis["image_analysis"]:
                product_name = analysis["image_analysis"]["product_name"]
                product_description = analysis["image_analysis"].get("description", "")
            
            logger.debug(f"Looking for alternatives for: {product_name}")
            alternatives = []
            if product_name:
                alternatives = recommendation_engine.find_alternatives(
                    f"{product_name}. {product_description}"
                )
                logger.debug(f"Found {len(alternatives)} alternatives")
            return jsonify({
                "analysis": analysis,
            })
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Error processing image", 
            "details": str(e)
        }), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    try:
        # In a real application, these would come from a database
        # For now, we'll return a predefined list of common product categories
        categories = [
            {"id": "clothing", "name": "Clothing & Apparel", "icon": "tshirt"},
            {"id": "electronics", "name": "Electronics", "icon": "laptop"},
            {"id": "food", "name": "Food & Beverages", "icon": "utensils"},
            {"id": "home", "name": "Home & Garden", "icon": "home"},
            {"id": "beauty", "name": "Beauty & Personal Care", "icon": "spa"},
            {"id": "toys", "name": "Toys & Games", "icon": "gamepad"},
            {"id": "sports", "name": "Sports & Outdoors", "icon": "basketball-ball"},
            {"id": "automotive", "name": "Automotive", "icon": "car"},
            {"id": "office", "name": "Office Supplies", "icon": "pencil-alt"},
            {"id": "pet", "name": "Pet Supplies", "icon": "paw"}
        ]
        
        return jsonify({"categories": categories})
    
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        return jsonify({"categories": [], "error": str(e)}), 500

@app.route('/category_products/<category>', methods=['GET'])
def get_category_products(category):
    try:
        # Generate eco-friendly product suggestions for the category
        eco_alternatives = recommendation_engine.generate_eco_alternatives_from_category(category)
        
        return jsonify({"products": eco_alternatives})
    
    except Exception as e:
        logger.error(f"Error fetching category products: {str(e)}")
        return jsonify({"products": [], "error": str(e)}), 500

@app.route('/material_alternatives', methods=['POST'])
def get_material_alternatives():
    try:
        materials = request.form.get('materials', '')
        
        if not materials:
            return jsonify({"error": "No materials specified"}), 400
            
        # Get sustainable alternatives for materials
        alternatives = recommendation_engine.suggest_ingredient_alternatives(materials)
        
        return jsonify({"alternatives": alternatives})
    
    except Exception as e:
        logger.error(f"Error finding material alternatives: {str(e)}")
        return jsonify({"alternatives": {}, "error": str(e)}), 500

@app.route('/test_image_upload')
def test_image_upload():
    """A simple page for testing image uploads"""
    return render_template('test_image_upload.html')

if __name__ == '__main__':
    # Preload sample products
    preload_sample_products()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)