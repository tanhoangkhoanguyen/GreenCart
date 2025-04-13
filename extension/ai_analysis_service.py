# ai_analysis_service.py
import os
import base64
import json
import logging
import time
import random
import re
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
import io

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class SustainabilityAnalyzer:
    def __init__(self):
        # Initialize Google Generative AI
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            logger.error("GOOGLE_API_KEY not found in environment variables")
            raise ValueError("GOOGLE_API_KEY is required. Please set it in the .env file.")
        
        genai.configure(api_key=api_key)
        
        # Initialize the generative model
        try:
            # Try to use the best available Gemini model
            self.model = genai.GenerativeModel('gemini-1.5-pro')
            logger.info("Using gemini-1.5-pro for analysis")
        except Exception as e:
            logger.warning(f"Could not initialize gemini-1.5-pro: {e}")
            try:
                # Fall back to gemini-1.0-pro if the newer model is not available
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("Using gemini-pro for analysis")
            except Exception as e:
                logger.error(f"Could not initialize any model: {e}")
                self.model = None
        
        # Initialize a vision model for image analysis
        try:
            # First try to get available models to find a vision-capable model
            available_models = []
            try:
                available_models = [model.name for model in genai.list_models() if hasattr(model, 'supported_generation_methods') and 'generateContent' in model.supported_generation_methods]
                logger.info(f"Available models: {available_models}")
            except Exception as e:
                logger.warning(f"Could not list available models: {e}")
            
            # Check if specific vision models are in the available models list
            vision_models = ['gemini-pro-vision', 'gemini-1.0-pro-vision']
            if available_models:
                for model_name in vision_models:
                    if model_name in available_models:
                        self.vision_model = genai.GenerativeModel(model_name)
                        logger.info(f"Using {model_name} for image analysis")
                        break
                else:
                    # If we get here, none of the vision models were found in available_models
                    # Try with the regular model which might support multimodal
                    self.vision_model = self.model
                    logger.info("Using text model for image analysis as fallback")
            else:
                # If we couldn't list models, try directly with known model names
                try:
                    self.vision_model = genai.GenerativeModel('gemini-pro-vision')
                    logger.info("Using gemini-pro-vision for image analysis")
                except Exception as e:
                    logger.warning(f"Could not initialize gemini-pro-vision: {e}")
                    try:
                        # If that fails, use the same model as for text analysis
                        self.vision_model = self.model
                        logger.info("Using text model for image analysis as fallback")
                    except Exception as e:
                        logger.error(f"Could not initialize any vision model: {e}")
                        self.vision_model = None
        except Exception as e:
            logger.error(f"Error initializing vision model: {e}")
            self.vision_model = None
    
    def analyze_product_description(self, description):
        """
        Analyze a product description for sustainability metrics
        
        Args:
            description (str): The product description to analyze
            
        Returns:
            dict: A dictionary containing sustainability metrics
        """
        try:
            logger.debug(f"Analyzing product description: {description[:50]}...")
            
            if not self.model:
                return {"error": "AI model not available"}
            
            # Create prompt for the AI model
            prompt = f"""
            Analyze this product description for sustainability and environmental impact:
            
            PRODUCT DESCRIPTION:
            {description}
            
            Perform a comprehensive sustainability analysis and return a STRUCTURED JSON RESPONSE with the following fields:
            
            1. materials_sustainability (float, 1-10): Score for the sustainability of materials
            2. manufacturing_process (float, 1-10): Score for the manufacturing process sustainability
            3. carbon_footprint (float, 1-10): Score for the product's carbon footprint (lower is better)
            4. recyclability (float, 1-10): Score for how recyclable the product is
            5. overall_sustainability_score (float, 1-10): Overall sustainability score
            6. improvement_opportunities (array of strings): List specific ways this product could be more sustainable
            7. sustainability_tags (object): Boolean fields for tags like "Eco-Friendly", "Organic", "Recyclable", "Biodegradable", "Fair Trade", "Energy Efficient", "Plastic-Free", "Single-Use", "Plastic Packaging", "High Carbon Footprint"
            8. sustainability_justification (string): Brief paragraph explaining the sustainability assessment
            
            Format your response as a well-structured JSON object WITHOUT ANY ADDITIONAL TEXT. Do not include markdown formatting, code blocks, or any text outside the JSON structure.
            """
            
            # Generate content using the AI model
            response = self.model.generate_content(prompt)
            
            # Process the response
            try:
                # Try to extract JSON from response
                response_text = response.text
                json_data = self._extract_json(response_text)
                
                return json_data
            except Exception as e:
                logger.error(f"Error processing analysis response: {e}")
                # Generate synthetic response with random scores for demonstration
                return self._generate_fallback_response(description)
        
        except Exception as e:
            logger.error(f"Error analyzing product description: {e}")
            return {"error": f"Error analyzing product: {str(e)}"}
    
    def analyze_product_image(self, image_data, detect_multiple=False):
        """
        Analyze a product image for sustainability, with optional multiple product detection
        
        Args:
            image_data (bytes): The image data to analyze
            detect_multiple (bool): If True, detect and analyze multiple products in the image
            
        Returns:
            dict: A dictionary containing the image analysis and sustainability metrics
                 If detect_multiple is True, returns a list of product analyses
        """
        try:
            logger.debug("Analyzing product image...")
            
            if not self.vision_model:
                return {"error": "Vision model not available"}
            
            # Convert bytes to image for processing
            try:
                image = Image.open(io.BytesIO(image_data))
                # Resize if needed
                max_size = (1024, 1024)
                image.thumbnail(max_size, Image.LANCZOS)
                
                # Convert back to bytes
                img_byte_arr = io.BytesIO()
                image.save(img_byte_arr, format=image.format or 'JPEG')
                image_bytes = img_byte_arr.getvalue()
                
                # Create parts for the multimodal model
                image_parts = [
                    {
                        "mime_type": f"image/{image.format.lower() if image.format else 'jpeg'}", 
                        "data": image_bytes
                    }
                ]
            except Exception as e:
                logger.error(f"Error processing image: {e}")
                return {"error": f"Error processing image: {str(e)}"}
            
            # Choose prompt based on whether we're detecting multiple products or not
            if detect_multiple:
                prompt = """
                Analyze this image for multiple products and perform a sustainability analysis:
                
                First, identify all distinct products visible in the image. For each identified product, provide:
                
                1. What the product appears to be (name)
                2. A detailed description of what you observe
                3. Any visible materials, packaging, or labeling
                4. Any sustainability or eco-friendly claims visible
                
                Then analyze each product's likely sustainability impact based on what's visible.
                
                IMPORTANT GREENWASHING ASSESSMENT GUIDELINES:
                - "High" greenwashing risk: Products with multiple vague eco-claims (eco-friendly, green, natural) without specific details or verification
                - "Medium" greenwashing risk: Products with some unsubstantiated claims or misleading terminology, but also some valid information 
                - "Low" greenwashing risk: Products with few or no eco-claims, or products with well-substantiated environmental claims
                - Products using "eco-friendly," "green," or "natural" without specific details should NOT be rated "Low" risk
                - Plastic products labeled as "eco-friendly" should be "Medium" or "High" risk
                - Products making environmental claims without visible certifications should be at least "Medium" risk
                
                Be skeptical and critical in your assessment. Apply a higher standard of evidence for sustainability claims.
                
                Return the results as a STRUCTURED JSON with the following format:
                
                {
                    "multiple_products": true,
                    "product_count": number of distinct products identified,
                    "products": [
                        {
                            "image_analysis": {
                                "product_name": what this product appears to be,
                                "description": detailed description of this product,
                                "visible_materials": list of materials you can identify for this product,
                                "visible_claims": any eco-friendly or sustainability claims visible for this product
                            },
                            "sustainability_analysis": {
                                "materials_sustainability": estimated score (1-10) for sustainability of visible materials,
                                "packaging_sustainability": score (1-10) for visible packaging sustainability,
                                "greenwashing_risk": "Low", "Medium", or "High" risk of greenwashing based on visible claims - be sure to follow the guidelines above,
                                "improvement_suggestions": array of realistic sustainability improvements,
                                "overall_sustainability_score": overall sustainability estimate (1-10),
                                "sustainability_justification": brief justification for the assessment
                            }
                        },
                        ... (repeat for each identified product)
                    ]
                }
                
                If only one product is clearly visible, still use the same format but with product_count: 1.
                Format your response as a well-structured JSON object WITHOUT ANY ADDITIONAL TEXT.
                """
            else:
                prompt = """
                Analyze this product image and provide:
                
                1. What the product appears to be
                2. A detailed description of what you observe
                3. Any visible materials, packaging, or labeling
                4. Any sustainability or eco-friendly claims visible
                
                Then analyze the product's likely sustainability impact based on what's visible.
                
                IMPORTANT GREENWASHING ASSESSMENT GUIDELINES:
                - "High" greenwashing risk: Products with multiple vague eco-claims (eco-friendly, green, natural) without specific details or verification
                - "Medium" greenwashing risk: Products with some unsubstantiated claims or misleading terminology, but also some valid information 
                - "Low" greenwashing risk: Products with few or no eco-claims, or products with well-substantiated environmental claims
                - Products using "eco-friendly," "green," or "natural" without specific details should NOT be rated "Low" risk
                - Plastic products labeled as "eco-friendly" should be "Medium" or "High" risk
                - Products making environmental claims without visible certifications should be at least "Medium" risk
                
                Be skeptical and critical in your assessment. Apply a higher standard of evidence for sustainability claims.
                
                Return the results as a STRUCTURED JSON with the following fields:
                
                1. image_analysis: {
                   product_name: what the product appears to be,
                   description: detailed description of the product,
                   visible_materials: list of materials you can identify,
                   visible_claims: any eco-friendly or sustainability claims visible
                }
                
                2. sustainability_analysis: {
                   materials_sustainability (float, 1-10): Estimated score for sustainability of visible materials,
                   packaging_sustainability (float, 1-10): Score for visible packaging sustainability,
                   greenwashing_risk (string): "Low", "Medium", or "High" risk of greenwashing based on visible claims - be sure to follow the guidelines above,
                   improvement_suggestions: array of realistic sustainability improvements,
                   overall_sustainability_score (float, 1-10): Overall sustainability estimate,
                   sustainability_justification: Brief justification for the assessment
                }
                
                Format your response as a well-structured JSON object WITHOUT ANY ADDITIONAL TEXT.
                """
            
            # Generate content using the AI model
            try:
                response = self.vision_model.generate_content([prompt, image_parts[0]])
                
                # Process the response
                try:
                    # Try to extract JSON from response
                    response_text = response.text
                    json_data = self._extract_json(response_text)
                    
                    return json_data
                except Exception as e:
                    logger.error(f"Error processing image analysis response: {e}")
                    # Generate synthetic response
                    return self._generate_fallback_image_analysis()
            except Exception as vision_error:
                logger.error(f"Error with vision model, trying alternative approach: {vision_error}")
                
                # If vision model fails, try to extract text from image and analyze that as text
                try:
                    # Try to use a text-only model with a description from what we can see in the image
                    image_description = f"Product appears to be {image.format if image.format else 'unknown'} image format, size {image.size}."
                    
                    text_prompt = f"""
                    Analyze this product (image description provided) for sustainability:
                    
                    IMAGE DESCRIPTION:
                    {image_description}
                    
                    Since I cannot see the actual image, please provide a general sustainability assessment for what might be in this product category.
                    
                    Return the results as a STRUCTURED JSON with fields similar to a typical product analysis, including overall_sustainability_score.
                    
                    Format as a well-structured JSON object WITHOUT ANY ADDITIONAL TEXT.
                    """
                    
                    if self.model:
                        text_response = self.model.generate_content(text_prompt)
                        response_text = text_response.text
                        json_data = self._extract_json(response_text)
                        return json_data
                    else:
                        return self._generate_fallback_image_analysis()
                except Exception as text_error:
                    logger.error(f"Both vision and text fallback approaches failed: {text_error}")
                    return self._generate_fallback_image_analysis()
        
        except Exception as e:
            logger.error(f"Error analyzing product image: {e}")
            return {"error": f"Error analyzing image: {str(e)}"}
    
    def identify_greenwashing(self, description):
        """
        Analyze a product description to identify potential greenwashing
        
        Args:
            description (str): The product description to analyze
            
        Returns:
            dict: A dictionary containing greenwashing analysis
        """
        try:
            logger.debug(f"Analyzing for greenwashing: {description[:50]}...")
            
            if not self.model:
                return {"error": "AI model not available"}
            
            # Create prompt for the AI model with enhanced guidelines for more accurate assessment
            prompt = f"""
            Analyze this product description for potential greenwashing:
            
            PRODUCT DESCRIPTION:
            {description}
            
            Greenwashing is the practice of making misleading or unsubstantiated claims about the environmental benefits of a product.
            
            IMPORTANT ASSESSMENT GUIDELINES:
            - "High" greenwashing risk: Products with multiple vague eco-claims (eco-friendly, green, natural) without specific details or verification
            - "Medium" greenwashing risk: Products with some unsubstantiated claims or misleading terminology, but also some valid information
            - "Low" greenwashing risk: Products with few or no eco-claims, or products with well-substantiated environmental claims
            - Products using "eco-friendly," "green," or "natural" without specific details should NOT be rated "Low" risk
            - Products with plastic components labeled as "eco-friendly" should be "Medium" or "High" risk
            - Products making environmental claims without third-party certifications should be at least "Medium" risk
            
            Be critical and skeptical in your assessment. The default for products making environmental claims should be "Medium" risk unless they provide specific, verifiable evidence.
            
            Return a detailed analysis in JSON format with these fields:
            
            1. greenwashing_risk (string): "Low", "Medium", or "High" risk of greenwashing - be sure to follow the guidelines above
            2. issues (array of strings): Specific potential greenwashing issues identified, if any
            3. vague_claims (array of strings): Any vague or unsubstantiated environmental claims
            4. misleading_terms (array of strings): Any potentially misleading terms
            5. missing_information (array of strings): Critical sustainability information that's missing
            6. explanation (string): Detailed explanation of the greenwashing assessment
            7. recommendations (array of strings): How the product description could be improved for transparency
            
            Format your response as a well-structured JSON object WITHOUT ANY ADDITIONAL TEXT.
            """
            
            # Generate content using the AI model
            response = self.model.generate_content(prompt)
            
            # Process the response
            try:
                # Try to extract JSON from response
                response_text = response.text
                json_data = self._extract_json(response_text)
                
                return json_data
            except Exception as e:
                logger.error(f"Error processing greenwashing analysis: {e}")
                # Generate synthetic response
                return self._generate_fallback_greenwashing(description)
        
        except Exception as e:
            logger.error(f"Error analyzing for greenwashing: {e}")
            return {"error": f"Error analyzing for greenwashing: {str(e)}"}
    
    def format_analysis_for_display(self, analysis):
        """
        Format the analysis results into HTML for display
        
        Args:
            analysis (dict): The analysis results
            
        Returns:
            str: Formatted HTML for display
        """
        if not analysis:
            return '<div class="alert alert-warning">No analysis data available.</div>'
        
        if "error" in analysis:
            return f'<div class="alert alert-danger">{analysis["error"]}</div>'
        
        try:
            # Check if this is a multiple product analysis
            if "multiple_products" in analysis and analysis["multiple_products"]:
                # Handle multiple products format
                product_count = analysis.get("product_count", 0)
                html = f'''
                <div class="multi-product-container">
                    <div class="multi-product-header">
                        <h4><i class="fas fa-layer-group me-2"></i>Multiple Products Detected ({product_count})</h4>
                        <p>We've identified multiple products in your image. Select a tab to view each product's analysis.</p>
                    </div>
                    
                    <ul class="nav nav-tabs mb-3" id="productTabs" role="tablist">
                '''
                
                # Create tab headers for each product
                products = analysis.get("products", [])
                for i, product in enumerate(products):
                    product_name = product.get("image_analysis", {}).get("product_name", f"Product {i+1}")
                    active_class = "active" if i == 0 else ""
                    html += f'''
                    <li class="nav-item" role="presentation">
                        <button class="nav-link {active_class}" id="product-tab-{i}" data-bs-toggle="tab" 
                                data-bs-target="#product-content-{i}" type="button" role="tab" aria-selected="{str(i == 0).lower()}">
                            {product_name}
                        </button>
                    </li>
                    '''
                
                html += '</ul><div class="tab-content" id="productTabsContent">'
                
                # Create content for each product tab
                for i, product in enumerate(products):
                    active_class = "show active" if i == 0 else ""
                    
                    # Format each product's analysis using the single product formatter
                    single_product_html = self._format_single_product(product)
                    
                    html += f'''
                    <div class="tab-pane fade {active_class}" id="product-content-{i}" role="tabpanel" aria-labelledby="product-tab-{i}">
                        {single_product_html}
                    </div>
                    '''
                
                html += '</div></div>'  # Close the tabs and container
                
                return html
            else:
                # Single product format - use the existing logic
                html = '<div class="analysis-container">'
                
                # Product identification from image
                if "image_analysis" in analysis:
                    image_data = analysis["image_analysis"]
                    
                    # Product name and description
                    if "product_name" in image_data:
                        html += f'''
                        <div class="metric-container">
                            <h4 class="product-title">{image_data.get("product_name", "Unknown Product")}</h4>
                            <div class="product-description mb-3">{image_data.get("description", "")}</div>
                        </div>
                        '''
                    
                    # Materials identified
                    if "visible_materials" in image_data and image_data["visible_materials"]:
                        html += '<div class="metric-container"><h5>Materials Identified</h5><div class="tags-container">'
                        for material in image_data["visible_materials"]:
                            html += f'<span class="sustainability-tag">{material}</span>'
                        html += '</div></div>'
                    
                    # Sustainability claims
                    if "visible_claims" in image_data and image_data["visible_claims"]:
                        html += '<div class="metric-container"><h5>Sustainability Claims</h5><div class="tags-container">'
                        for claim in image_data["visible_claims"]:
                            html += f'<span class="sustainability-tag">{claim}</span>'
                        html += '</div></div>'
            
            # Check for sustainability analysis data from image analysis
            if "sustainability_analysis" in analysis:
                sustainability_data = analysis["sustainability_analysis"]
                
                # Materials sustainability from image analysis
                if "materials_sustainability" in sustainability_data:
                    score = self._parse_score(sustainability_data["materials_sustainability"])
                    score_class = self._get_score_class(score)
                    
                    html += f'''
                    <div class="metric-container">
                        <div class="metric-name">
                            Materials Sustainability
                            <span class="metric-score">{score}/10</span>
                        </div>
                        <div class="metric-bar">
                            <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                        </div>
                    </div>
                    '''
                
                # Overall sustainability score from image analysis
                if "overall_sustainability_score" in sustainability_data:
                    score = self._parse_score(sustainability_data["overall_sustainability_score"])
                    score_class = self._get_score_class(score)
                    
                    html += f'''
                    <div class="metric-container">
                        <div class="metric-name">
                            Overall Sustainability Score
                            <span class="metric-score">{score}/10</span>
                        </div>
                        <div class="metric-bar">
                            <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                        </div>
                    </div>
                    '''
                
                # Improvement suggestions from image analysis
                if "improvement_suggestions" in sustainability_data and sustainability_data["improvement_suggestions"]:
                    html += '<div class="metric-container"><h5>Improvement Opportunities</h5><ul class="list-group">'
                    
                    for suggestion in sustainability_data["improvement_suggestions"]:
                        html += f'<li class="list-group-item">{suggestion}</li>'
                    
                    html += '</ul></div>'
                
                # Sustainability justification from image analysis
                if "sustainability_justification" in sustainability_data:
                    html += f'''
                    <div class="metric-container">
                        <h5>Assessment Explanation</h5>
                        <div class="metric-justification">{sustainability_data["sustainability_justification"]}</div>
                    </div>
                    '''
                
                # Greenwashing risk section removed
            
            # Overall sustainability score
            if "overall_sustainability_score" in analysis:
                score = self._parse_score(analysis["overall_sustainability_score"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Overall Sustainability Score
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Materials sustainability
            if "materials_sustainability" in analysis:
                score = self._parse_score(analysis["materials_sustainability"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Materials Sustainability
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Manufacturing process
            if "manufacturing_process" in analysis:
                score = self._parse_score(analysis["manufacturing_process"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Manufacturing Process
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Carbon footprint
            if "carbon_footprint" in analysis:
                score = self._parse_score(analysis["carbon_footprint"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Carbon Footprint
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Recyclability
            if "recyclability" in analysis:
                score = self._parse_score(analysis["recyclability"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Recyclability
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Sustainability tags
            if "sustainability_tags" in analysis and isinstance(analysis["sustainability_tags"], dict):
                html += '<div class="metric-container"><h5>Sustainability Tags</h5><div class="tags-container">'
                
                for tag, value in analysis["sustainability_tags"].items():
                    if value and value is not False and value != "false" and value != "False":
                        tag_name = tag.replace("_", " ").title()
                        html += f'<span class="sustainability-tag">{tag_name}</span>'
                
                html += '</div></div>'
            
            # Improvement opportunities
            if "improvement_opportunities" in analysis and analysis["improvement_opportunities"]:
                html += '<div class="metric-container"><h5>Improvement Opportunities</h5><ul class="list-group">'
                
                for opportunity in analysis["improvement_opportunities"]:
                    html += f'<li class="list-group-item">{opportunity}</li>'
                
                html += '</ul></div>'
            
            # Sustainability justification
            if "sustainability_justification" in analysis and analysis["sustainability_justification"]:
                html += f'''
                <div class="metric-container">
                    <h5>Assessment Explanation</h5>
                    <div class="metric-justification">{analysis["sustainability_justification"]}</div>
                </div>
                '''
            
            html += '</div>'
            return html
            
        except Exception as e:
            logger.error(f"Error formatting analysis for display: {e}")
            return f'<div class="alert alert-danger">Error formatting analysis: {str(e)}</div>'
    
    def _extract_json(self, text):
        """
        Extract JSON from a text response
        
        Args:
            text (str): The text to extract JSON from
            
        Returns:
            dict: The extracted JSON as a dictionary
        """
        # Find the JSON part of the response
        try:
            # Look for JSON block
            json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Look for curly braces
                start_idx = text.find('{')
                end_idx = text.rfind('}') + 1
                if start_idx != -1 and end_idx > start_idx:
                    json_str = text[start_idx:end_idx]
                else:
                    raise ValueError("No JSON found in the response")
            
            # Parse the JSON
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"Error extracting JSON: {e}")
            raise
    
    def _format_single_product(self, product):
        """
        Format a single product analysis into HTML
        
        Args:
            product (dict): The product analysis
            
        Returns:
            str: Formatted HTML for the product
        """
        if not product:
            return '<div class="alert alert-warning">No product data available.</div>'
            
        html = '<div class="analysis-container">'
        
        # Product identification from image
        if "image_analysis" in product:
            image_data = product["image_analysis"]
            
            # Product name and description
            if "product_name" in image_data:
                html += f'''
                <div class="metric-container">
                    <h4 class="product-title">{image_data.get("product_name", "Unknown Product")}</h4>
                    <div class="product-description mb-3">{image_data.get("description", "")}</div>
                </div>
                '''
            
            # Materials identified
            if "visible_materials" in image_data and image_data["visible_materials"]:
                html += '<div class="metric-container"><h5>Materials Identified</h5><div class="tags-container">'
                for material in image_data["visible_materials"]:
                    html += f'<span class="sustainability-tag">{material}</span>'
                html += '</div></div>'
            
            # Sustainability claims
            if "visible_claims" in image_data and image_data["visible_claims"]:
                html += '<div class="metric-container"><h5>Sustainability Claims</h5><div class="tags-container">'
                for claim in image_data["visible_claims"]:
                    html += f'<span class="sustainability-tag">{claim}</span>'
                html += '</div></div>'
        
        # Check for sustainability analysis data
        if "sustainability_analysis" in product:
            sustainability_data = product["sustainability_analysis"]
            
            # Materials sustainability
            if "materials_sustainability" in sustainability_data:
                score = self._parse_score(sustainability_data["materials_sustainability"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Materials Sustainability
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Overall sustainability score
            if "overall_sustainability_score" in sustainability_data:
                score = self._parse_score(sustainability_data["overall_sustainability_score"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Overall Sustainability Score
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Improvement suggestions
            if "improvement_suggestions" in sustainability_data and sustainability_data["improvement_suggestions"]:
                html += '<div class="metric-container"><h5>Improvement Opportunities</h5><ul class="list-group">'
                
                for suggestion in sustainability_data["improvement_suggestions"]:
                    html += f'<li class="list-group-item">{suggestion}</li>'
                
                html += '</ul></div>'
            
            # Sustainability justification
            if "sustainability_justification" in sustainability_data:
                html += f'''
                <div class="metric-container">
                    <h5>Assessment Explanation</h5>
                    <div class="metric-justification">{sustainability_data["sustainability_justification"]}</div>
                </div>
                '''
            
            # Greenwashing risk
            if "greenwashing_risk" in sustainability_data:
                risk = sustainability_data["greenwashing_risk"]
                risk_class = ""
                
                if risk.lower() == "high":
                    risk_class = "text-danger fw-bold"
                elif risk.lower() == "medium":
                    risk_class = "text-warning fw-bold"
                elif risk.lower() == "low":
                    risk_class = "text-success fw-bold"
                
                html += f'''
                <div class="metric-container">
                    <h5>Greenwashing Risk</h5>
                    <p class="{risk_class}">{risk}</p>
                </div>
                '''
        
        html += '</div>'
        return html
        
    def _parse_score(self, score):
        """
        Parse a score value to ensure it's a float between 0 and 10
        
        Args:
            score: The score to parse
            
        Returns:
            float: The parsed score
        """
        try:
            # Convert to float if it's a string
            if isinstance(score, str):
                # Remove any trailing /10 or /100
                score = score.split('/')[0].strip()
                score = float(score)
            else:
                score = float(score)
            
            # Scale to 0-10 if it appears to be on a 0-100 scale
            if score > 10:
                score = score / 10
                
            # Clamp to 0-10
            return max(0, min(10, score))
        except:
            # Return a default value if parsing fails
            return 5.0
    
    def _get_score_class(self, score):
        """
        Get the CSS class for a score
        
        Args:
            score (float): The score
            
        Returns:
            str: The CSS class
        """
        if score >= 7:
            return "metric-fill"  # Good (green)
        elif score >= 4:
            return "medium-fill"  # Medium (yellow/orange)
        else:
            return "bad-fill"  # Bad (red)
    
    def _generate_fallback_response(self, description):
        """Generate a fallback response when API call fails"""
        # Check for eco-friendly keywords in the description
        eco_friendly_keywords = ['organic', 'recycled', 'sustainable', 'eco-friendly', 'biodegradable', 'fair trade']
        harmful_keywords = ['plastic', 'single-use', 'non-recyclable', 'chemical', 'synthetic']
        
        # Count occurrences of eco-friendly and harmful words
        eco_count = sum(1 for word in eco_friendly_keywords if word in description.lower())
        harm_count = sum(1 for word in harmful_keywords if word in description.lower())
        
        # Generate base scores based on keyword matches
        base_score = 5 + min(4, eco_count) - min(4, harm_count)
        base_score = max(1, min(9, base_score))  # Keep between 1-9
        
        # Create varied scores
        materials = base_score + random.uniform(-1, 1)
        manufacturing = base_score + random.uniform(-1, 1)
        carbon = base_score + random.uniform(-1, 1)
        recyclability = base_score + random.uniform(-1, 1)
        overall = (materials + manufacturing + carbon + recyclability) / 4
        
        # Round scores to nearest 0.5
        materials = round(materials * 2) / 2
        manufacturing = round(manufacturing * 2) / 2
        carbon = round(carbon * 2) / 2
        recyclability = round(recyclability * 2) / 2
        overall = round(overall * 2) / 2
        
        # Generate sustainability tags
        tags = {
            "Eco-Friendly": eco_count > 1,
            "Organic": "organic" in description.lower(),
            "Recyclable": "recycl" in description.lower(),
            "Biodegradable": "biodegrad" in description.lower(),
            "Fair Trade": "fair trade" in description.lower(),
            "Energy Efficient": "energy" in description.lower() and "efficien" in description.lower(),
            "Plastic-Free": "plastic-free" in description.lower(),
            "Single-Use": "single" in description.lower() and "use" in description.lower(),
            "Plastic Packaging": "plastic" in description.lower() and "packag" in description.lower(),
            "High Carbon Footprint": "carbon" in description.lower() and harm_count > 1
        }
        
        # Generate improvement opportunities
        improvements = []
        if not tags["Recyclable"]:
            improvements.append("Use recyclable materials")
        if tags["Plastic Packaging"]:
            improvements.append("Replace plastic packaging with biodegradable alternatives")
        if tags["Single-Use"]:
            improvements.append("Redesign for reusability instead of single-use")
        if not tags["Eco-Friendly"]:
            improvements.append("Source materials from sustainable suppliers")
        if overall < 7:
            improvements.append("Implement carbon offset program")
            
        if not improvements:
            improvements = [
                "Further improve material sourcing transparency",
                "Consider a take-back program for end-of-life recycling",
                "Reduce packaging volume"
            ]
        
        return {
            "materials_sustainability": materials,
            "manufacturing_process": manufacturing,
            "carbon_footprint": carbon,
            "recyclability": recyclability,
            "overall_sustainability_score": overall,
            "improvement_opportunities": improvements,
            "sustainability_tags": tags,
            "sustainability_justification": "This is a preliminary assessment based on the provided description. A more detailed analysis would require information about specific materials, manufacturing processes, and supply chain practices."
        }
    
    def _generate_fallback_image_analysis(self):
        """Generate a fallback image analysis when API call fails"""
        # Enhanced eco-claims detection
        eco_claims = [
            "eco", "green", "natural", "sustainable", "environmentally friendly",
            "biodegradable", "earth-friendly", "eco-conscious", "clean",
            "non-toxic", "chemical-free", "pure", "organic"
        ]
        
        # Specific certification terms
        certification_terms = [
            "certified", "verified", "certified organic", "fair trade", "fsc",
            "gots", "energy star", "cradle to cradle", "ecolabel", "bluesign"
        ]
        
        # Look for specific materials that might indicate greenwashing
        problematic_materials = ["plastic", "synthetic", "petroleum-based"]
        
        # Count various indicators
        description_lower = description.lower() if 'description' in locals() else ""
        claim_count = sum(1 for claim in eco_claims if claim in description_lower)
        cert_count = sum(1 for cert in certification_terms if cert in description_lower)
        problematic_count = sum(1 for mat in problematic_materials if mat in description_lower)
        
        # Determine risk level with stricter criteria
        if claim_count > 1 and cert_count == 0:
            greenwashing_risk = "High"
        elif claim_count > 0 and problematic_count > 0:
            greenwashing_risk = "Medium"
        elif claim_count > 0 and cert_count == 0:
            greenwashing_risk = "Medium"
        elif claim_count == 0 or cert_count >= claim_count:
            greenwashing_risk = "Low"
        else:
            greenwashing_risk = "Medium"
        
        # Determine risk level based on claims vs certifications
        if claim_count > 2 and cert_count == 0:
            greenwashing_risk = "High"
        elif claim_count > 0 and cert_count == 0:
            greenwashing_risk = "Medium"
        elif claim_count == 0:
            greenwashing_risk = "Low"
        else:
            # If there are both claims and certifications, assess the ratio
            greenwashing_risk = "Medium" if claim_count > cert_count * 2 else "Low"
        
        # Customize justification based on risk level
        if greenwashing_risk == "High":
            justification = "Product appears to make environmental claims without clear verification or certification. Many products use vague eco-friendly terminology without substantiating their claims with specific metrics or third-party verification."
        elif greenwashing_risk == "Medium":
            justification = "Product may contain some environmentally focused aspects, but without specific certifications or precise metrics to validate claims. More transparent labeling would improve sustainability assessment."
        else:
            justification = "Product doesn't appear to make explicit environmental claims, or those claims are supported with specific evidence. Without clear visibility of the product materials and packaging, a preliminary assessment gives an average sustainability score."
        
        # Create suggestions based on risk level
        suggestions = ["Consider more transparent sustainability labeling"]
        if greenwashing_risk != "Low":
            suggestions.append("Obtain third-party certifications for environmental claims")
            suggestions.append("Provide specific metrics rather than vague eco-terminology")
        
        suggestions.append("Use easily recyclable packaging materials")
        suggestions.append("Provide more information about material sourcing")
        
        return {
            "image_analysis": {
                "product_name": "Product",
                "description": "The image appears to show a product. For detailed analysis, please try again or provide a clearer image.",
                "visible_materials": ["Unable to determine from image"],
                "visible_claims": ["No claims detected"]
            },
            "sustainability_analysis": {
                "materials_sustainability": 5,
                "packaging_sustainability": 5,
                "greenwashing_risk": greenwashing_risk,
                "improvement_suggestions": suggestions,
                "overall_sustainability_score": 5,
                "sustainability_justification": justification
            }
        }
    
    def _generate_fallback_greenwashing(self, description):
        """Generate a fallback greenwashing analysis when API call fails"""
        description = description.lower()
        
        # Check for vague eco-terms
        vague_terms = ['eco-friendly', 'green', 'natural', 'sustainable', 'earth-friendly', 
                      'environmentally friendly', 'eco', 'clean', 'pure', 'chemical-free']
        
        problematic_materials = ['plastic', 'polyester', 'synthetic', 'petroleum', 'chemical', 
                              'disposable', 'single-use', 'non-renewable']
        
        specific_terms = ['recycled content', 'biodegradable', 'organic certified', 'carbon neutral', 
                        'fair trade certified', 'energy star certified', 'fsc certified', 
                        'rainforest alliance', 'ecolabel', 'cradle-to-cradle']
        
        certification_terms = ['certified', 'certification', 'verified', 'label', 'standard', 'iso']
        
        # Count various types of terms
        vague_count = sum(1 for term in vague_terms if term in description)
        specific_count = sum(1 for term in specific_terms if term in description)
        problematic_count = sum(1 for term in problematic_materials if term in description)
        certification_count = sum(1 for term in certification_terms if term in description)
        
        # Identify specific product types that are often greenwashed
        is_plastic_product = 'plastic' in description and not ('plastic-free' in description or 'no plastic' in description)
        is_fast_fashion = any(term in description for term in ['fashion', 'clothing', 'apparel', 'wear'])
        is_cleaning_product = any(term in description for term in ['clean', 'cleaner', 'detergent', 'soap'])
        is_packaged_food = any(term in description for term in ['packaged', 'food', 'snack'])
        
        # Define eco claim words before using them
        eco_claim_words = ['eco', 'environment', 'planet', 'green', 'sustain']
        has_eco_claims = any(word in description for word in eco_claim_words)
        
        # Determine risk level using more sophisticated logic
        risk = "Low"  # Default risk
        
        # High risk indicators
        if (vague_count >= 2 and specific_count == 0) or \
           (vague_count > 0 and problematic_count >= 2 and certification_count == 0) or \
           ('chemical-free' in description) or \
           (is_plastic_product and 'eco-friendly' in description and certification_count == 0) or \
           (is_fast_fashion and 'sustainable' in description and specific_count == 0):
            risk = "High"
        # Medium risk indicators
        elif (vague_count > 0) or \
             (problematic_count > 0 and any(term in description for term in vague_terms)) or \
             (is_cleaning_product and 'natural' in description and certification_count == 0) or \
             (is_packaged_food and 'green' in description):
            risk = "Medium"
        # Keep Low risk only when clearly appropriate
        elif has_eco_claims and specific_count == 0 and certification_count == 0:
            # If description contains eco-claims but no specific evidence, elevate to at least Medium
            risk = "Medium"
            
        # Generate vague claims
        vague_claims = [term for term in vague_terms if term in description]
        if not vague_claims:
            vague_claims = ["No specific vague claims detected"]
            
        # Generate issues
        issues = []
        if vague_count > 0 and specific_count == 0:
            issues.append("Uses vague environmental claims without specific substantiation")
        if "natural" in description:
            issues.append("Uses 'natural' labeling which can be misleading (many harmful substances are also natural)")
        if "green" in description and specific_count == 0:
            issues.append("Uses 'green' terminology without specific environmental benefits")
        if "chemical-free" in description:
            issues.append("Claims to be 'chemical-free' which is scientifically impossible as all products are made of chemicals")
        if is_plastic_product and any(term in description for term in vague_terms):
            issues.append("Describes plastic product with eco-terminology despite plastic's environmental impact")
        if problematic_count > 0 and 'eco-friendly' in description:
            issues.append("Claims to be eco-friendly while containing environmentally problematic materials")
            
        if not issues and risk != "Low":
            issues = ["Insufficient specific environmental information to back marketing claims"]
            
        # Generate missing information
        missing_info = []
        if certification_count == 0 and has_eco_claims:
            missing_info.append("Third-party sustainability certifications")
        if is_plastic_product:
            missing_info.append("Specific percentage of recycled content in plastic")
        if "biodegradable" in description:
            missing_info.append("Specific biodegradability standards and timeframes")
        if "sustainable" in description:
            missing_info.append("Specific sustainability metrics and comparisons")
        
        # Add default missing info if needed
        if not missing_info:
            missing_info = [
                "Specific percentage of recycled content",
                "Third-party certifications",
                "Quantifiable environmental impact data"
            ]
            
        # Generate recommendations
        recommendations = []
        if vague_count > 0:
            recommendations.append("Replace vague eco-terms with specific, measurable claims")
        if specific_count == 0:
            recommendations.append("Add quantifiable data about environmental benefits")
        if certification_count == 0:
            recommendations.append("Include certification information from recognized environmental standards")
        if is_plastic_product:
            recommendations.append("Provide specific information about plastic type, recycled content percentage, and end-of-life options")
        
        # Create appropriate explanation based on risk level
        if risk == "High":
            explanation = f"The product description uses {vague_count} vague environmental claims with little to no substantiating evidence. This pattern is characteristic of high-risk greenwashing, where marketing emphasizes environmental benefits without sufficient specific evidence."
        elif risk == "Medium":
            explanation = f"The product makes some environmental claims but lacks complete substantiation. While some specific information is provided, there are {vague_count} vague terms that could potentially mislead consumers without additional context."
        else:
            explanation = "The product description contains minimal environmental claims, or those claims are well-substantiated with specific metrics and certifications."
            
        return {
            "greenwashing_risk": risk,
            "issues": issues,
            "vague_claims": vague_claims,
            "misleading_terms": vague_claims[:2] if vague_claims and vague_claims[0] != "No specific vague claims detected" else ["None detected"],
            "missing_information": missing_info,
            "explanation": explanation,
            "recommendations": recommendations
        }