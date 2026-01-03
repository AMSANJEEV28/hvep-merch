const MOCK_PRODUCTS = [
   
    { id: 1, name: 'Product ', price: 499, category: 'Personal Care', rating: 5, material: '.......', impact: '.................', ecoScore: { carbon: 'A-', water: 'A', waste: 'A+' }, images: ['https://placehold.co/800x800/10B981/ffffff?text=Image+1', 'https://placehold.co/800x800/059669/ffffff?text=Image+2', 'https://placehold.co/800x800/34D399/ffffff?text=Image', 'https://placehold.co/800x800/064e3b/ffffff?text=Image+4'] },
    { id: 2, name: 'Product ', price: 749, category: 'Accessories', rating: 4, material: '.......', impact: '.............', ecoScore: { carbon: 'B+', water: 'A', waste: 'B' }, images: ['https://placehold.co/800x800/3b82f6/ffffff?text=Image+1', 'https://placehold.co/800x800/1d4ed8/ffffff?text=Image+2', 'https://placehold.co/800x800/60a5fa/ffffff?text=Image+3'] },
    { id: 3, name: 'Product ', price: 599, category: 'Home Goods', rating: 5, material: '.........', impact: '..................', ecoScore: { carbon: 'A', water: 'B-', waste: 'A' }, images: ['https://placehold.co/800x800/f59e0b/ffffff?text=Image+1', 'https://placehold.co/800x800/fcd34d/ffffff?text=Image', 'https://placehold.co/800x800/fbbf24/ffffff?text=Image+3'] },
    { id: 4, name: 'Product', price: 1899, category: 'Accessories', rating: 5, material: '............', impact: '...............', ecoScore: { carbon: 'A+', water: 'A+', waste: 'A' }, images: ['https://placehold.co/800x800/4c4c4c/ffffff?text=Image+1', 'https://placehold.co/800x800/737373/ffffff?text=Image+2', 'https://placehold.co/800x800/a3a3a3/ffffff?text=Image+3'] },
    { id: 5, name: 'Product', price: 450, category: 'Home Goods', rating: 4, material: '............', impact: '..........', ecoScore: { carbon: 'B', water: 'B', waste: 'A+' }, images: ['https://placehold.co/800x800/6b7280/ffffff?text=Image+1', 'https://placehold.co/800x800/9ca3af/ffffff?text=Image+2', 'https://placehold.co/800x800/d1d5db/ffffff?text=Image+3'] },
    { id: 6, name: 'Product', price: 899, category: 'Accessories', rating: 4, material: '..............', impact: '..............', ecoScore: { carbon: 'A+', water: 'A+', waste: 'A+' }, images: ['https://placehold.co/800x800/083344/ffffff?text=Image+1', 'https://placehold.co/800x800/164e63/ffffff?text=Image+2'] },
    { id: 7, name: 'Product', price: 999, category: 'Electronics', rating: 3, material: '............', impact: '...............', ecoScore: { carbon: 'B', water: 'B', waste: 'A' }, images: ['https://placehold.co/800x800/ef4444/ffffff?text=Image+1', 'https://placehold.co/800x800/f87171/ffffff?text=Image+2', 'https://placehold.co/800x800/fca5a5/ffffff?text=Image+3'] },
    { id: 8, name: 'Product', price: 349, category: 'Personal Care', rating: 5, material: '...............', impact: '.............', ecoScore: { carbon: 'A', water: 'A', waste: 'A+' }, images: ['https://placehold.co/800x800/a78bfa/ffffff?text=Image+1', 'https://placehold.co/800x800/c4b5fd/ffffff?text=Image+2'] },
    { id: 9, name: 'Product', price: 1299, category: 'Home Goods', rating: 4, material: '................', impact: '...................', ecoScore: { carbon: 'B', water: 'C+', waste: 'A' }, images: ['https://placehold.co/800x800/7c3aed/ffffff?text=Image+1', 'https://placehold.co/800x800/9333ea/ffffff?text=Image+2'] },
    { id: 10, name: 'Product', price: 199, category: 'Stationery', rating: 4, material: '......................', impact: '....................', ecoScore: { carbon: 'A', water: 'B+', waste: 'A+' }, images: ['https://placehold.co/800x800/d97706/ffffff?text=Image', 'https://placehold.co/800x800/fcd34d/ffffff?text=Image+2'] },


];

let selectedProduct = null;
let currentImageIndex = 0;
let activeFilters = {
    categories: [],
    maxPrice: 5000,
    minRating: 0,
    sort: 'newest',
    searchTerm: ''
};

const SORT_OPTIONS = {
    'newest': 'Newest Arrivals',
    'price_asc': 'Price: Low to High',
    'price_desc': 'Price: High to Low',
    'rating_desc': 'Top Rated'
};

const apiKey = ""; 
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

async function geminiFetch(payload, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 && i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text || "Error: Could not generate content.";

        } catch (error) {
            console.error("Gemini API Error:", error);
            if (i === maxRetries - 1) throw error;
        }
    }
}

function getStarRatingHTML(rating) {
    const fullStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return `<span class="star-rating">${fullStars}${emptyStars}</span>`;
}

// VIEW MANAGEMENT
function toggleFilterModal(open) {
    const modal = document.getElementById('filter-modal');
    const desktopFilters = document.getElementById('filters-desktop-container');
    const modalPlaceholder = document.getElementById('filter-modal-content-placeholder');

    if (open) {
       
        modalPlaceholder.innerHTML = desktopFilters.innerHTML;
        modal.classList.add('open');
        modal.classList.remove('hidden');
        document.body.classList.add('body-scroll-lock');
    } else {
        modal.classList.remove('open');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('body-scroll-lock');
        }, 300);
    }
}

function showView(viewId) {
    document.getElementById('product-listing').classList.add('hidden');
    document.getElementById('product-detail').classList.add('hidden');
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-nav'));
    const navButton = document.querySelector(`[data-view="${viewId}"]`);
    if (!navButton && viewId === 'product-listing') {
         const productsNavButton = document.querySelector(`[data-view="product-listing"]`);
         if (productsNavButton) {
             productsNavButton.classList.add('active-nav');
         }
    } else if (navButton) {
        navButton.classList.add('active-nav');
    }
    
    if (viewId === 'product-listing') {
        renderFilters(); 
        applyFilters(); 
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// --- PRODUCT LISTING PAGE (PLP) LOGIC ---

function updateSearchTerm(input) {
    activeFilters.searchTerm = input.value.trim().toLowerCase();
    applyFilters();
}
function renderFilters() {
    const categoryContainer = document.getElementById('category-filter'); 
    const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];
    let html = '<p class="filter-label">Product Category</p>';
    
    categories.forEach(cat => {
        const isChecked = activeFilters.categories.includes(cat) ? 'checked' : '';
        html += `
            <label>
                <input type="checkbox" value="${cat}" ${isChecked} onchange="updateCategoryFilter(this)"> 
                ${cat}
            </label>
        `;
    });
    if (categoryContainer) {
        categoryContainer.innerHTML = html;
    }
    const priceRangeInput = document.getElementById('price-range');
    const maxPriceDisplay = document.getElementById('max-price-display');
    const ratingRadio = document.querySelector(`#rating-filter input[value="${activeFilters.minRating}"]`);

    if (priceRangeInput && maxPriceDisplay) {
        maxPriceDisplay.textContent = '₹' + priceRangeInput.value;
    }
    if (ratingRadio) {
        ratingRadio.checked = true;
    }
    const sortButtonText = document.getElementById('sort-current-value');
    if (sortButtonText) {
        sortButtonText.textContent = SORT_OPTIONS[activeFilters.sort];
    }
}
function toggleSortDropdown() {
    const dropdown = document.getElementById('sort-dropdown-menu');
    if (dropdown) {
        dropdown.classList.toggle('visible');
    }
}

/**
 * Updates the sort filter and closes the dropdown.
 * @param {string} value - The new sort value (e.g., 'price_asc').
 */
function selectSortOption(value) {
    activeFilters.sort = value;
    const sortButtonText = document.getElementById('sort-current-value');
    if (sortButtonText) {
        sortButtonText.textContent = SORT_OPTIONS[value];
    }
    const dropdown = document.getElementById('sort-dropdown-menu');
    if (dropdown) {
        dropdown.classList.remove('visible');
    }
    applyFilters();
}
function updateCategoryFilter(checkbox) {
    const targetValue = checkbox.value;
    const isChecked = checkbox.checked;
    document.querySelectorAll(`input[value="${targetValue}"][type="checkbox"]`).forEach(input => {
        if (input !== checkbox) {
            input.checked = isChecked;
        }
    });

    if (isChecked) {
        if (!activeFilters.categories.includes(targetValue)) {
            activeFilters.categories.push(targetValue);
        }
    } else {
        activeFilters.categories = activeFilters.categories.filter(c => c !== targetValue);
    }
    applyFilters();
}

function applyFilters() {
    const priceRangeInput = document.getElementById('price-range');
    if (priceRangeInput) {
        activeFilters.maxPrice = parseInt(priceRangeInput.value);
    }
    
    const ratingRadio = document.querySelector('#rating-filter input[name="rating"]:checked');
    activeFilters.minRating = ratingRadio ? parseInt(ratingRadio.value) : 0;


    const maxPriceDisplay = document.getElementById('max-price-display');
    if (maxPriceDisplay && priceRangeInput) {
        maxPriceDisplay.textContent = '₹' + priceRangeInput.value;
    }


    let filteredProducts = [...MOCK_PRODUCTS];

    filteredProducts = filteredProducts.filter(product => {
        const matchesCategory = activeFilters.categories.length === 0 || activeFilters.categories.includes(product.category);
        const matchesPrice = product.price <= activeFilters.maxPrice;
        const matchesRating = product.rating >= activeFilters.minRating;
        
        const matchesSearch = activeFilters.searchTerm === '' || product.name.toLowerCase().includes(activeFilters.searchTerm);

        return matchesCategory && matchesPrice && matchesRating && matchesSearch;
    });

    switch (activeFilters.sort) {
        case 'price_asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating_desc':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            break;
    }

    renderProductGrid(filteredProducts);
}


function renderProductGrid(products) {
    const grid = document.getElementById('product-grid');
    const countDisplay = document.getElementById('product-count');
    
    if (countDisplay) {
        countDisplay.textContent = products.length;
    }
    
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div class="no-results p-5 text-center text-gray-500 col-span-full">No products match your current filters. Try adjusting your selections.</div>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const firstImage = product.images?.[0] || 'https://placehold.co/600x400/34D399/ffffff?text=Eco+Product';
        return `
            <div class="product-card" onclick="viewProductDetail(${product.id})">
                <img 
                    src="${firstImage}" 
                    alt="${product.name}" 
                    class="product-image"
                    onerror="this.onerror=null;this.src='https://placehold.co/600x400/34D399/ffffff?text=Image+Missing';"
                >
                <div class="card-info">
                    <h4>${product.name}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <p class="card-price">₹${product.price.toLocaleString('en-IN')}</p>
                        ${getStarRatingHTML(product.rating)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// --- SINGLE PRODUCT PAGE (SPP) LOGIC ---

/**
 * Navigates the image carousel forward or backward.
 */
function navigateImage(direction) {
    const images = selectedProduct.images;
    if (!images || images.length <= 1) return;

    let newIndex = currentImageIndex + direction;

    if (newIndex < 0) {
        newIndex = images.length - 1; // Wrap around to end
    } else if (newIndex >= images.length) {
        newIndex = 0; // Wrap around to beginning
    }

    currentImageIndex = newIndex;
    
    // Smooth transition effect: fade out, change src, fade in
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.style.opacity = 0;
        setTimeout(() => {
            mainImage.src = images[currentImageIndex];
            mainImage.style.opacity = 1;
        }, 150);
    }
}

/**Renders the Eco Score section HTML.*/
function renderEcoScore(score) {
    return `
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Sustainability Scorecard</h3>
        <div class="eco-score-container">
            <div class="score-item">
                <i class="fas fa-smog"></i>
                <div class="score-value text-red-500">${score.carbon}</div>
                <div class="score-label">Carbon Footprint</div>
            </div>
            <div class="score-item">
                <i class="fas fa-tint"></i>
                <div class="score-value text-blue-500">${score.water}</div>
                <div class="score-label">Water Usage</div>
            </div>
            <div class="score-item">
                <i class="fas fa-recycle"></i>
                <div class="score-value text-green-500">${score.waste}</div>
                <div class="score-label">Waste Reduction</div>
            </div>
        </div>
    `;
}


/**Loads and displays the details for a selected product, including image gallery.*/
function viewProductDetail(productId) {
    selectedProduct = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!selectedProduct) return;

    const container = document.getElementById('detail-container');
    
    currentImageIndex = 0;
    
    selectedProduct.report = null;

    if (!container) return;

    container.innerHTML = `
        <div class="detail-layout">
            <!-- Image Carousel/Gallery -->
            <div class="gallery-col">
                <div class="image-carousel-wrapper">
                    <img id="main-product-image" 
                        src="${selectedProduct.images?.[0] || 'https://placehold.co/800x800/10B981/ffffff?text=Product+Image'}" 
                        alt="${selectedProduct.name}" 
                        class="detail-image"
                        onerror="this.onerror=null;this.src='https://placehold.co/800x800/10B981/ffffff?text=Image+Missing';"
                    >
                    <button class="gallery-button prev" onclick="navigateImage(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="gallery-button next" onclick="navigateImage(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <!-- Product Info & CTA -->
            <div class="detail-info">
                <div class="product-rating">
                    ${getStarRatingHTML(selectedProduct.rating)} (${selectedProduct.rating}.0 / 5)
                </div>
                <h2>${selectedProduct.name}</h2>
                <p class="detail-price">₹${selectedProduct.price.toLocaleString('en-IN')}</p>

                <!-- Eco Scorecard -->
                <div class="eco-score-card">
                    ${renderEcoScore(selectedProduct.ecoScore)}
                </div>

                <!-- Eco-Story Block -->
                <div class="eco-story-box eco-story-section">
                    <h3><i class="fas fa-seedling"></i> The Story Behind It</h3>
                    <p class="story-text text-gray-700">
                        This product is made with **${selectedProduct.material}**. Its key benefit is **${selectedProduct.impact}**. We work directly with fair-trade certified co-operatives to ensure ethical labor and sourcing. By choosing this item, you support a fully transparent supply chain.
                    </p>
                    <button class="report-btn" onclick="generateEcoImpactReport()">
                        <i class="fas fa-clipboard-list"></i> Read Full Ethical Story →
                    </button>
                    <div id="gemini-report-container"></div>
                </div>

                
                <button class="add-to-cart-btn" onclick="console.log('Added ${selectedProduct.name} to cart. Teammate\'s flow starts here.')">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;

    showView('product-detail');
}

/**Generates and displays the detailed Eco-Impact Report using the Gemini API.*/
async function generateEcoImpactReport() {
    if (!selectedProduct) return;
    
    const container = document.getElementById('gemini-report-container');
    const reportButton = document.querySelector('.report-btn');
    if (!container || !reportButton) return; // Defensive check

    if (selectedProduct.report) {
        container.innerHTML = '';
        selectedProduct.report = null;
        reportButton.innerHTML = '<i class="fas fa-clipboard-list"></i> Read Full Ethical Story →';
        return;
    }
    reportButton.disabled = true;
    reportButton.innerHTML = '<span class="loading-spinner"></span> Generating report...';
    
    const systemPrompt = "You are a professional sustainability communications specialist. Your goal is to write a highly persuasive, concise, and scientifically grounded paragraph (max 100 words) detailing the environmental and ethical impact of a product. Focus on material origin, labor practices, and carbon footprint reduction.";
    
    const userQuery = `Generate an engaging 1-paragraph impact report for the '${selectedProduct.name}'. Key data: Material: ${selectedProduct.material}, Impact: ${selectedProduct.impact}.`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        config: {
            temperature: 0.7,
            maxOutputTokens: 120
        }
    };

    try {
        const reportText = await geminiFetch(payload);
        selectedProduct.report = reportText;

        container.innerHTML = `<div class="gemini-report">${reportText}</div>`;
        reportButton.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Full Ethical Story ←';
    } catch (error) {
        container.innerHTML = `<div class="gemini-report" style="border-color: red; color: red;">Could not generate report. Network or API error occurred.</div>`;
        reportButton.innerHTML = '<i class="fas fa-redo"></i> Retry Report Generation';
    } finally {
        reportButton.disabled = false;
    }
}




function initProductApp() {
    renderFilters();
    applyFilters();
    const listingView = document.getElementById('product-listing');
    const detailView = document.getElementById('product-detail');
    
    if (listingView) { listingView.classList.remove('hidden'); }
    if (detailView) { detailView.classList.add('hidden'); }
}

window.initProductApp = initProductApp;
window.updateSearchTerm = updateSearchTerm; 
window.toggleSortDropdown = toggleSortDropdown;
window.selectSortOption = selectSortOption;
