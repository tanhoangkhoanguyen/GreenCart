$(document).ready(function() {
    // Load categories on page load
    loadCategories();

    // Image Analysis Form Submit
    $('#image-analysis-form').submit(function(e) {
        e.preventDefault();

        const formData = new FormData();
        const imageFile = $('#product-image')[0].files[0];

        if (!imageFile) {
            alert('Please select an image to analyze.');
            return;
        }

        formData.append('image', imageFile);

        // Create an image preview
        const previewUrl = URL.createObjectURL(imageFile);

        // Show loading spinner
        $('#image-analysis-content').html(
            `<div class="row mb-4">
                <div class="col-md-5">
                    <div class="uploaded-image-container">
                        <img src="${previewUrl}" alt="Uploaded product" class="img-fluid uploaded-product-image">
                        <div class="image-caption">Uploaded Product Image</div>
                    </div>
                </div>
                <div class="col-md-7">
                    <div class="spinner-container mt-5">
                        <div class="spinner"></div>
                        <p>Analyzing product image...</p>
                    </div>
                </div>
            </div>`
        );
        $('#image-analysis-results').show();

        // Hide alternatives section initially
        $('#eco-alternatives-results').hide();

        // Analyze image
        $.ajax({
            url: '/upload_image',
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                console.log("Response received:", response);

                if (response.error) {
                    // Keep the image but show error
                    const imageHtml = $('#image-analysis-content').find('.col-md-5').prop('outerHTML');
                    $('#image-analysis-content').html(
                        `<div class="row mb-4">
                            ${imageHtml}
                            <div class="col-md-7">
                                <div class="alert alert-danger">${response.error}</div>
                                ${response.details ? `<div class="alert alert-info">Details: ${response.details}</div>` : ''}
                            </div>
                        </div>`
                    );
                } else {
                    // Keep the image and show analysis
                    const imageHtml = $('#image-analysis-content').find('.col-md-5').prop('outerHTML');
                    const analysisHtml = response.formatted_analysis || formatAnalysisObject(response.analysis);

                    $('#image-analysis-content').html(
                        `<div class="row mb-4">
                            ${imageHtml}
                            <div class="col-md-7">
                                ${analysisHtml}
                            </div>
                        </div>`
                    );

                    // Display alternatives if available
                    if (response.alternatives && response.alternatives.length > 0) {
                        $('#eco-alternatives-content').html('');
                        displayAlternatives(response.alternatives, '#eco-alternatives-content');
                        $('#eco-alternatives-results').show();
                    }
                }

                // Scroll to results
                $('html, body').animate({
                    scrollTop: $('#image-analysis-results').offset().top - 70
                }, 500);
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
                $('#image-analysis-content').html('<div class="alert alert-danger">Error analyzing image. Please try again.</div>');
                if (xhr.responseText) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.details) {
                            $('#image-analysis-content').append(`<div class="alert alert-info">Details: ${response.details}</div>`);
                        }
                    } catch (e) {
                        console.error("Error parsing response:", e);
                    }
                }
            }
        });
    });

    // Helper Functions
    function formatAnalysisObject(analysis) {
        if (!analysis) {
            return '<div class="alert alert-warning">No analysis data available.</div>';
        }

        if (analysis.error) {
            return `<div class="alert alert-danger">${analysis.error}</div>`;
        }

        let html = '<div class="analysis-container">';

        // Overall sustainability score
        if (analysis.overall_sustainability_score !== undefined) {
            let score = parseScore(analysis.overall_sustainability_score);
            let scoreClass = getScoreClass(score);

            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Overall Sustainability Score
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }

        // Materials sustainability
        if (analysis.materials_sustainability !== undefined) {
            let score = parseScore(analysis.materials_sustainability);
            let scoreClass = getScoreClass(score);

            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Materials Sustainability
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }

        // Manufacturing process
        if (analysis.manufacturing_process !== undefined) {
            let score = parseScore(analysis.manufacturing_process);
            let scoreClass = getScoreClass(score);

            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Manufacturing Process
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }

        // Carbon footprint
        if (analysis.carbon_footprint !== undefined) {
            let score = parseScore(analysis.carbon_footprint);
            let scoreClass = getScoreClass(score);

            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Carbon Footprint
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }

        // Recyclability
        if (analysis.recyclability !== undefined) {
            let score = parseScore(analysis.recyclability);
            let scoreClass = getScoreClass(score);

            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Recyclability
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }

        // Sustainability tags
        if (analysis.sustainability_tags && typeof analysis.sustainability_tags === 'object') {
            html += '<div class="metric-container"><h5>Sustainability Tags</h5><div class="tags-container">';

            for (const [tag, value] of Object.entries(analysis.sustainability_tags)) {
                if (value && value !== false && value !== "false" && value !== "False") {
                    const tagName = tag.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                    html += `<span class="sustainability-tag">${tagName}</span>`;
                }
            }

            html += '</div></div>';
        }

        // Improvement opportunities
        if (analysis.improvement_opportunities && analysis.improvement_opportunities.length > 0) {
            html += '<div class="metric-container"><h5>Improvement Opportunities</h5><ul class="list-group">';

            for (const opportunity of analysis.improvement_opportunities) {
                html += `<li class="list-group-item">${opportunity}</li>`;
            }

            html += '</ul></div>';
        }

        // Sustainability justification
        if (analysis.sustainability_justification) {
            html += `
            <div class="metric-container">
                <h5>Assessment Explanation</h5>
                <div class="metric-justification">${analysis.sustainability_justification}</div>
            </div>
            `;
        }

        html += '</div>';
        return html;
    }

    function displayAlternatives(alternatives, targetSelector = '#alternatives-content') {
        let html = '';

        alternatives.forEach(function(alternative, index) {
            const colClass = alternatives.length > 2 ? 'col-md-4' : 'col-md-6';
            html += `<div class="${colClass} mb-4">`;

            if (alternative.product) {
                // Format the product content
                const product = alternative.product;
                const name = product.name || 'Alternative Product';
                const price = product.price || '';
                const description = product.description || '';
                const url = product.url || '#';
                const imageUrl = product.image_url || 'https://via.placeholder.com/200x200?text=Eco+Product';


                html += `
                <div class="product-card">
                    <img src="${imageUrl}" class="product-image img-fluid mb-2" alt="${name}">
                    <div class="product-name">${name}</div>
                `;

                if (price) {
                    html += `<div class="product-price">$${parseFloat(price).toFixed(2)}</div>`;
                }

                html += `<div class="product-description">${description}</div>`;

                // Add improvement reasons if available
                if (alternative.improvement_reasons && alternative.improvement_reasons.length > 0) {
                    html += '<div class="improvements-container"><h6>Sustainability Improvements:</h6>';

                    alternative.improvement_reasons.forEach(function(reason) {
                        html += `<div class="improvement-item">${reason}</div>`;
                    });

                    html += '</div>';
                }

                if (url && url !== '#') {
                    html += `<a href="${url}" class="product-link" target="_blank">View Product</a>`;
                }

                html += `</div>`;
            } else {
                // If the alternative doesn't have a product object
                html += `
                <div class="product-card">
                    <div class="product-name">Alternative ${index + 1}</div>
                    <div class="product-description">No detailed information available.</div>
                </div>
                `;
            }

            html += '</div>';
        });

        $(targetSelector).html(html);
    }


    function loadCategories() {
        $.ajax({
            url: '/categories',
            method: 'GET',
            success: function(response) {
                if (response.categories && response.categories.length > 0) {
                    displayCategories(response.categories);
                } else {
                    $('#categories-list').html('<div class="alert alert-info">No product categories available.</div>');
                }
            },
            error: function() {
                $('#categories-list').html('<div class="alert alert-danger">Error loading categories. Please refresh the page.</div>');
            }
        });
    }

    function displayCategories(categories) {
        let html = '';

        categories.forEach(function(category) {
            const icon = category.icon ? `<i class="fas fa-${category.icon} me-2"></i>` : '';
            const name = category.name || category.id;
            const id = category.id;

            html += `
            <div class="col-6 col-md-4 col-lg-3 mb-3">
                <button class="category-btn w-100" data-category="${id}">
                    ${icon}${name}
                </button>
            </div>
            `;
        });

        $('#categories-list').html(html);

        // Add click handlers for category buttons
        $('.category-btn').click(function() {
            const category = $(this).data('category');
            $('#category-title').html(`<i class="fas fa-list me-2"></i>${$(this).text().trim()} Products`);
            loadCategoryProducts(category);
        });
    }

    function loadCategoryProducts(category) {
        // Show loading spinner
        $('#category-content').html('<div class="spinner-container"><div class="spinner"></div><p>Loading eco-friendly products...</p></div>');
        $('#category-results').show();

        // Scroll to category results
        $('html, body').animate({
            scrollTop: $('#category-results').offset().top - 70
        }, 500);

        // Load products for the category
        $.ajax({
            url: `/category_products/${category}`,
            method: 'GET',
            success: function(response) {
                if (response.products && response.products.length > 0) {
                    displayAlternatives(response.products);
                } else {
                    $('#category-content').html('<div class="alert alert-warning">No products found in this category.</div>');
                }
            },
            error: function() {
                $('#category-content').html('<div class="alert alert-danger">Error loading products. Please try again.</div>');
            }
        });
    }

    // Helper function to parse score values
    function parseScore(score) {
        if (typeof score === 'string') {
            // Remove any trailing /10 or similar
            score = score.split('/')[0].trim();
            score = parseFloat(score);
        } else if (typeof score === 'number') {
            score = score;
        } else {
            score = 0;
        }

        // Scale to 0-10 if it appears to be on a 0-100 scale
        if (score > 10) {
            score = score / 10;
        }

        // Clamp to 0-10 and round to 1 decimal place
        return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
    }

    // Helper function to get CSS class for score
    function getScoreClass(score) {
        if (score >= 7) {
            return "metric-fill"; // Good (green)
        } else if (score >= 4) {
            return "medium-fill"; // Medium (yellow/orange)
        } else {
            return "bad-fill"; // Bad (red)
        }
    }
});