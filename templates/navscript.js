// Cart Management
let cart = [];
let cartCount = 0;

// Initialize cart from localStorage if available
function initCart() {
    const savedCart = localStorage.getItem('hvep_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        updateCartDisplay();
    }
}

// Update cart count display
function updateCartDisplay() {
    const cartCountElement = document.getElementById('cartCount');
    cartCountElement.textContent = cartCount;

    // Add animation when count changes
    cartCountElement.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCountElement.style.transform = 'scale(1)';
    }, 200);
}

// Add item to cart
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    cartCount++;
    updateCartDisplay();
    saveCart();
    showCartNotification('Item added to cart!');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('hvep_cart', JSON.stringify(cart));
}

// Show cart notification
function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #4a7c2c;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Search Functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categorySelect = document.getElementById('categorySelect');

function performSearch() {
    const searchTerm = searchInput.value.trim();
    const category = categorySelect.value;

    if (searchTerm === '') {
        showNotification('Please enter a search term', 'warning');
        return;
    }

    console.log('Searching for:', searchTerm, 'in category:', category);

    // Here you would typically redirect to a search results page or filter products
    showNotification(`Searching for "${searchTerm}" in ${category}...`, 'info');

    // Example: Redirect to search page with query parameters
    // window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`;
}

// Search on button click
searchBtn.addEventListener('click', performSearch);

// Search on Enter key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Search suggestions (optional enhancement)
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value.length >= 3) {
        // Here you could show search suggestions
        console.log('Show suggestions for:', value);
    }
});

// Cart Button Click
const cartBtn = document.getElementById('cartBtn');
cartBtn.addEventListener('click', () => {
    console.log('Cart clicked. Items:', cart);
    showNotification(`You have ${cartCount} item(s) in your cart`, 'info');

    // Redirect to cart page
    // window.location.href = 'cart.html';
});

// Home Button Click
const homeBtn = document.getElementById('homeBtn');
homeBtn.addEventListener('click', () => {
    window.location.href = 'https://himvillageprahari.org';
});

// Logo Click - Also redirect to home
const logo = document.getElementById('logo');
logo.addEventListener('click', () => {
    window.location.href = 'https://himvillageprahari.org';
});
logo.style.cursor = 'pointer';

// Location Modal
function createLocationModal() {
    const modal = document.createElement('div');
    modal.className = 'location-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Choose your location</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Delivery options and delivery speeds may vary for different locations</p>
                <div class="location-input-group">
                    <input type="text" id="pincodeInput" placeholder="Enter 6-digit pincode" maxlength="6">
                    <button id="applyPincode" class="apply-btn">Apply</button>
                </div>
                <div id="locationResult" class="location-result"></div>
                <div id="locationError" class="location-error"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Apply pincode
    const pincodeInput = modal.querySelector('#pincodeInput');
    const applyBtn = modal.querySelector('#applyPincode');
    const locationResult = modal.querySelector('#locationResult');
    const locationError = modal.querySelector('#locationError');

    let currentLocationData = null;

    // Real-time pincode validation and fetching
    pincodeInput.addEventListener('input', async (e) => {
        const pincode = e.target.value.trim();
        locationResult.innerHTML = '';
        locationError.innerHTML = '';

        if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
            // Show loading
            locationResult.innerHTML = '<div class="location-loading"><i class="fas fa-spinner fa-spin"></i> Fetching location...</div>';

            try {
                const locationData = await fetchLocationFromPincode(pincode);

                if (locationData.success) {
                    currentLocationData = locationData;
                    locationResult.innerHTML = `
                        <div class="location-found">
                            <i class="fas fa-check-circle"></i>
                            <div class="location-details">
                                <strong>${locationData.city}, ${locationData.state}</strong>
                                <span>${locationData.district} - ${pincode}</span>
                            </div>
                        </div>
                    `;
                    applyBtn.disabled = false;
                } else {
                    locationError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid pincode. Please check and try again.';
                    currentLocationData = null;
                    applyBtn.disabled = true;
                }
            } catch (error) {
                locationError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Unable to fetch location. Please try again.';
                currentLocationData = null;
                applyBtn.disabled = true;
            }
        } else if (pincode.length > 0) {
            applyBtn.disabled = true;
        }
    });

    applyBtn.addEventListener('click', () => {
        const pincode = pincodeInput.value.trim();

        if (pincode && /^\d{6}$/.test(pincode) && currentLocationData) {
            updateLocation(pincode, currentLocationData);
            closeModal();
        } else if (!currentLocationData) {
            locationError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid pincode';
        }
    });

    // Enter key support
    pincodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyBtn.click();
        }
    });

    // Focus input
    setTimeout(() => pincodeInput.focus(), 100);
}

// Fetch location from pincode using India Post API
async function fetchLocationFromPincode(pincode) {
    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            return {
                success: true,
                pincode: pincode,
                city: postOffice.District || postOffice.Name,
                state: postOffice.State,
                district: postOffice.District,
                country: postOffice.Country
            };
        } else {
            return { success: false };
        }
    } catch (error) {
        console.error('Error fetching pincode data:', error);
        return { success: false };
    }
}

function updateLocation(pincode, locationData) {
    const locationText = locationData ? `${locationData.city} ${pincode}` : `${pincode}`;
    document.querySelector('.deliver-location').textContent = locationText;

    // Save to localStorage
    localStorage.setItem('hvep_location', pincode);
    localStorage.setItem('hvep_location_data', JSON.stringify(locationData));

    showNotification(`Location updated to ${locationData.city}!`, 'success');
}

// Deliver To Click
const deliverTo = document.querySelector('.deliver-to');
deliverTo.addEventListener('click', () => {
    createLocationModal();
});

// Load saved location
function loadLocation() {
    const savedLocation = localStorage.getItem('hvep_location');
    const savedLocationData = localStorage.getItem('hvep_location_data');

    if (savedLocation && savedLocationData) {
        try {
            const locationData = JSON.parse(savedLocationData);
            document.querySelector('.deliver-location').textContent = `${locationData.city} ${savedLocation}`;
        } catch (e) {
            document.querySelector('.deliver-location').textContent = `${savedLocation}`;
        }
    } else if (savedLocation) {
        document.querySelector('.deliver-location').textContent = `${savedLocation}`;
    }
}

// Language Dropdown
function createLanguageDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'language-dropdown';
    dropdown.innerHTML = `
        <div class="dropdown-content">
            <div class="dropdown-header">
                <h4>Select Language</h4>
            </div>
            <div class="language-options">
                <button class="language-option" data-lang="EN">
                    <span class="lang-icon">🇬🇧</span>
                    <span class="lang-text">English</span>
                    <span class="lang-check">✓</span>
                </button>
                <button class="language-option" data-lang="HI">
                    <span class="lang-icon">🇮🇳</span>
                    <span class="lang-text">हिंदी (Hindi)</span>
                    <span class="lang-check">✓</span>
                </button>
                <button class="language-option" data-lang="MR">
                    <span class="lang-icon">🇮🇳</span>
                    <span class="lang-text">मराठी (Marathi)</span>
                    <span class="lang-check">✓</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dropdown);

    // Position dropdown
    const languageItem = document.querySelectorAll('.nav-item')[1];
    const rect = languageItem.getBoundingClientRect();
    const dropdownContent = dropdown.querySelector('.dropdown-content');
    dropdownContent.style.top = rect.bottom + 'px';
    dropdownContent.style.left = rect.left + 'px';

    // Show dropdown
    setTimeout(() => {
        dropdownContent.style.opacity = '1';
        dropdownContent.style.transform = 'translateY(0)';
    }, 10);

    // Highlight current language
    const currentLang = localStorage.getItem('hvep_language') || 'EN';
    const options = dropdown.querySelectorAll('.language-option');
    options.forEach(option => {
        if (option.dataset.lang === currentLang) {
            option.classList.add('active');
        }

        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            updateLanguage(lang);
            closeDropdown();
        });
    });

    // Close dropdown when clicking outside
    const closeDropdown = () => {
        dropdownContent.style.opacity = '0';
        dropdownContent.style.transform = 'translateY(-10px)';
        setTimeout(() => dropdown.remove(), 200);
    };

    setTimeout(() => {
        document.addEventListener('click', function closeHandler(e) {
            if (!dropdown.contains(e.target) && !languageItem.contains(e.target)) {
                closeDropdown();
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 100);
}

function updateLanguage(lang) {
    const languageItem = document.querySelectorAll('.nav-item')[1];
    languageItem.querySelector('.nav-item-title').textContent = lang;
    localStorage.setItem('hvep_language', lang);

    const langNames = { EN: 'English', HI: 'Hindi', MR: 'Marathi' };
    showNotification(`Language changed to ${langNames[lang]}`, 'success');
}

// Language Item Click - Globe icon
const languageItem = document.querySelectorAll('.nav-item')[1];
languageItem.addEventListener('click', (e) => {
    e.stopPropagation();

    // Remove any existing dropdown
    const existing = document.querySelector('.language-dropdown');
    if (existing) {
        existing.remove();
        return;
    }

    createLanguageDropdown();
});

// Account Menu - Do nothing (user is not signed in)
const accountItem = document.querySelectorAll('.nav-item')[2]; // Account & Lists
accountItem.addEventListener('click', (e) => {
    // Do nothing when not signed in
    // In future, could show login modal or redirect to login page
    console.log('Account clicked - user not signed in');
});

// Returns & Orders
const returnsItem = document.querySelectorAll('.nav-item')[3];
returnsItem.addEventListener('click', () => {
    showNotification('Please sign in to view orders', 'info');
    // window.location.href = 'login.html';
});

// Bottom Navigation Links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const text = link.textContent.trim();

        console.log('Navigation clicked:', text);

        // Handle different navigation items
        if (text === 'All' || text.includes('All')) {
            showNotification('Browse all categories', 'info');
        } else if (text === "Today's Deals") {
            showNotification('Loading today\'s deals...', 'info');
        } else if (text.includes('Eco-Friendly')) {
            showNotification('Browse eco-friendly products', 'info');
        } else {
            showNotification(`Browse ${text}`, 'info');
        }
    });
});

// General Notification Function
function showNotification(message, type = 'info') {
    const colors = {
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#4a7c2c'
    };

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    .cart-count {
        transition: transform 0.2s ease;
    }

    .search-input:focus {
        outline: 2px solid #8bc34a;
    }

    .nav-item:active, .nav-link:active {
        transform: scale(0.98);
    }

    /* Location Modal */
    .location-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10001;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
    }

    .modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        animation: modalSlideIn 0.3s ease;
    }

    @keyframes modalSlideIn {
        from {
            transform: translate(-50%, -60%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%);
            opacity: 1;
        }
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
        margin: 0;
        color: #2d5016;
        font-size: 20px;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 32px;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
    }

    .modal-close:hover {
        background-color: #f0f0f0;
    }

    .modal-body {
        padding: 24px;
    }

    .modal-body p {
        color: #666;
        margin-bottom: 20px;
        font-size: 14px;
    }

    .location-input-group {
        display: flex;
        gap: 10px;
        margin-bottom: 24px;
    }

    #pincodeInput {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }

    #pincodeInput:focus {
        outline: none;
        border-color: #4a7c2c;
    }

    .apply-btn {
        padding: 12px 24px;
        background-color: #4a7c2c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;
    }

    .apply-btn:hover {
        background-color: #3d6724;
    }

    .popular-locations h4 {
        color: #333;
        font-size: 16px;
        margin-bottom: 12px;
    }

    .location-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .location-item {
        padding: 12px 16px;
        background-color: #f5f5f5;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        text-align: left;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
    }

    .location-item:hover {
        background-color: #e8f5e9;
        border-color: #4a7c2c;
    }

    /* Location Result */
    .location-result {
        margin-top: 16px;
        min-height: 60px;
    }

    .location-loading {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #666;
        font-size: 14px;
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 4px;
    }

    .location-loading i {
        color: #4a7c2c;
    }

    .location-found {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background-color: #e8f5e9;
        border: 1px solid #4a7c2c;
        border-radius: 4px;
    }

    .location-found i {
        color: #4a7c2c;
        font-size: 20px;
    }

    .location-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .location-details strong {
        color: #2d5016;
        font-size: 15px;
    }

    .location-details span {
        color: #666;
        font-size: 13px;
    }

    .location-error {
        margin-top: 12px;
        padding: 12px;
        background-color: #ffebee;
        border: 1px solid #f44336;
        border-radius: 4px;
        color: #c62828;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .location-error i {
        font-size: 16px;
    }

    .apply-btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    /* Language Dropdown */
    .language-dropdown {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
    }

    .dropdown-content {
        position: absolute;
        background: white;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 250px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.2s ease;
    }

    .dropdown-header {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
    }

    .dropdown-header h4 {
        margin: 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
    }

    .language-options {
        padding: 8px 0;
    }

    .language-option {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border: none;
        background: white;
        cursor: pointer;
        transition: background-color 0.2s;
        gap: 12px;
    }

    .language-option:hover {
        background-color: #f5f5f5;
    }

    .lang-icon {
        font-size: 20px;
    }

    .lang-text {
        flex: 1;
        text-align: left;
        color: #333;
        font-size: 14px;
    }

    .lang-check {
        color: #4a7c2c;
        font-weight: bold;
        opacity: 0;
    }

    .language-option.active .lang-check {
        opacity: 1;
    }

    .language-option.active {
        background-color: #e8f5e9;
    }
`;
document.head.appendChild(style);

// Mobile Menu Toggle (for responsive design)
const allMenuBtn = document.querySelector('.all-menu');
allMenuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('All categories menu', 'info');
});

// Sticky Navbar on Scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        navbar.style.boxShadow = 'none';
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    }

    lastScroll = currentScroll;
});

// Load saved language
function loadLanguage() {
    const savedLang = localStorage.getItem('hvep_language');
    if (savedLang) {
        const languageItem = document.querySelectorAll('.nav-item')[1];
        languageItem.querySelector('.nav-item-title').textContent = savedLang;
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    initCart();
    loadLocation();
    loadLanguage();
    console.log('HimVillage ePrahari Store initialized!');
});

// Example function to add products to cart (call this from product pages)
window.addProductToCart = function(productId, productName, price) {
    addToCart({
        id: productId,
        name: productName,
        price: price
    });
};

// Export functions for use in other scripts
window.hvepStore = {
    addToCart,
    cart,
    showNotification,
    updateCartDisplay
};