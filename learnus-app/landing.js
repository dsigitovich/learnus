// Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // FAQ Toggle functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll('.problem-item, .solution-item, .step, .result-card, .testimonial, .proof-stat');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.nav');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScrollY = currentScrollY;
    });

    // CTA Button click tracking
    const ctaButtons = document.querySelectorAll('.btn-primary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Track conversion event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    'event_category': 'CTA',
                    'event_label': 'Landing Page CTA',
                    'value': 20
                });
            }
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Parallax effect for hero background
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }

    // Floating cards animation
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        // Add random movement
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            card.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 3000 + index * 1000);
    });

    // Counter animation for stats
    const animateCounter = (element, target, duration = 2000) => {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    };

    // Animate stats when they come into view
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('.stat-number, .result-number, .proof-stat .stat-number');
                if (statNumber) {
                    const target = parseInt(statNumber.textContent.replace(/[^\d]/g, ''));
                    if (target > 0) {
                        statNumber.textContent = '0';
                        animateCounter(statNumber, target);
                    }
                }
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statElements = document.querySelectorAll('.hero-stats, .results-grid, .proof-stats');
    statElements.forEach(el => statsObserver.observe(el));

    // Typing effect for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const titleText = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < titleText.length) {
                heroTitle.innerHTML += titleText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        setTimeout(typeWriter, 500);
    }

    // Form validation for demo inputs
    const demoInputs = document.querySelectorAll('.demo-input');
    demoInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#2563EB';
            this.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = '#D1D5DB';
            this.style.boxShadow = 'none';
        });
    });

    // Mobile menu toggle (if needed)
    const createMobileMenu = () => {
        const nav = document.querySelector('.nav-container');
        const navLinks = document.querySelector('.nav-links');
        
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-toggle')) {
            const toggle = document.createElement('button');
            toggle.className = 'mobile-menu-toggle';
            toggle.innerHTML = '☰';
            toggle.style.cssText = `
                display: block;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #2563EB;
            `;
            
            nav.appendChild(toggle);
            
            toggle.addEventListener('click', () => {
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            });
        }
    };

    // Initialize mobile menu
    createMobileMenu();
    window.addEventListener('resize', createMobileMenu);

    // Add loading states for buttons
    const addLoadingState = (button) => {
        const originalText = button.innerHTML;
        button.innerHTML = '<span>Загрузка...</span>';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    };

    // Add loading to CTA buttons
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            addLoadingState(this);
        });
    });

    // Smooth reveal animation for sections
    const revealSections = document.querySelectorAll('section');
    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    revealSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(section);
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.problem-item, .solution-item, .result-card, .testimonial');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Performance optimization: Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Console message for developers
    console.log('%c🚀 LearnUs Landing Page', 'color: #2563EB; font-size: 20px; font-weight: bold;');
    console.log('%cBuilt with ❤️ for maximum conversion', 'color: #10B981; font-size: 14px;');
});

// Utility functions
const utils = {
    // Debounce function for performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for scroll events
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { utils };
}