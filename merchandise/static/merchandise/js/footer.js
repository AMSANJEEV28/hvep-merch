
document.addEventListener('DOMContentLoaded', () => {
    console.log('Footer initialized');

    setupFooterLinks();
    setupScrollToTop();
});

/**
 * Handle footer link clicks (optional enhancement)
 */
function setupFooterLinks() {
    const footerLinks = document.querySelectorAll('.site-footer a');

    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Ignore real navigation links
            if (!href || href === '#') {
                e.preventDefault();
                showFooterNotification('This page will be available soon');
            }
        });
    });
}


function setupScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');

    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.pointerEvents = 'auto';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.pointerEvents = 'none';
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function showFooterNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 20px;
        background-color: #1b5e20;
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 14px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideUp 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

/* Animations */
const footerStyle = document.createElement('style');
footerStyle.textContent = `
    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(footerStyle);
