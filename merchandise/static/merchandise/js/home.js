// Static site scripts: carousel, header scroll, render products

const featuredProducts = [
  {
    id: 'prod1',
    image: 'team1-assets/product-images/glass-jar-lantern.png',
    name: 'Recycled Paper Journal',
    tagline: 'Pen your thoughts sustainably.',
    price: 85,
  },
  {
    id: 'prod2',
    image: 'team1-assets/product-images/ChatGPT%20Image%20Nov%207%2C%202025%2C%2009_18_19%20PM.png',
    name: 'Glass Jar Lantern',
    tagline: 'Light up your world, eco-style.',
    price: 150,
  },
  {
    id: 'prod3',
    image: 'team1-assets/product-images/upcycled-tyre-pplanter.png',
    name: 'Upcycled Tire Planter',
    tagline: 'Give your plants a recycled home.',
    price: 120,
  },
  {
    id: 'prod4',
    image: 'team1-assets/product-images/woven-bag.png',
    name: 'Woven Plastic Tote Bag',
    tagline: 'Carry your essentials with purpose.',
    price: 100,
  },
  {
    id: 'prod5',
    image: 'team1-assets/product-images/cap-covers.png',
    name: 'Bottle Cap Coasters',
    tagline: 'Protect your surfaces with art.',
    price: 50,
  },
];

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  featuredProducts.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="muted">${p.tagline}</p>
      </div>
      <div class="card-footer">
        <div class="price">${formatCurrency(p.price)}</div>
        <div class="card-actions">
          <button class="btn ghost wishlist" data-id="${p.id}">♥</button>
          <button class="btn" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Currency formatting helper for Indian Rupees
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0 // No decimal places for rupees
});

function formatCurrency(value) {
  // Prices are stored in rupees, no conversion needed
  return inrFormatter.format(value);
}

// Enhanced carousel with indicators
function initHeroCarousel() {
  const slides = Array.from(document.querySelectorAll('#hero .slide'));
  if (!slides.length) return;
  let idx = slides.findIndex((s) => s.classList.contains('active'));
  if (idx < 0) idx = 0;
  const total = slides.length;
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');
  const indicators = Array.from(document.querySelectorAll('.indicator'));

  function show(i, updateIndicators = true) {
    i = ((i % total) + total) % total; // normalize
    slides.forEach((s, si) => {
      const active = si === i;
      s.classList.toggle('active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if (updateIndicators) {
      indicators.forEach((ind, ii) => ind.classList.toggle('active', ii === i));
    }
    idx = i;
  }

  // Navigation
  prevBtn && prevBtn.addEventListener('click', () => {
    show(idx - 1);
    restartAutoplay();
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    show(idx + 1);
    restartAutoplay();
  });

  // Indicators
  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => {
      show(i);
      restartAutoplay();
    });
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { show(idx - 1); restartAutoplay(); }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { show(idx + 1); restartAutoplay(); }
  });

  let autoplay = null;
  function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(() => show(idx + 1), 5000);
  }
  function stopAutoplay() {
    if (autoplay) { clearInterval(autoplay); autoplay = null; }
  }
  function restartAutoplay() { stopAutoplay(); startAutoplay(); }

  // pause on hover/focus
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mouseenter', stopAutoplay);
    hero.addEventListener('mouseleave', startAutoplay);
    hero.addEventListener('focusin', stopAutoplay);
    hero.addEventListener('focusout', startAutoplay);
  }

  // initialize
  show(idx);
  startAutoplay();
}

// Header scroll behavior and mobile menu
function initHeader() {
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (!header || !menuToggle || !mainNav) return;

  // Scroll behavior
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
  });

  // Close menu when clicking outside or on a link
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      mainNav.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  mainNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      mainNav.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initHeroCarousel();
  initHeader();
  // simple handlers
  document.body.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches && t.matches('.wishlist')) {
      alert('Added to wishlist (static demo)');
    }
  });
});
