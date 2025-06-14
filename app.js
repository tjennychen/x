class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.isTransitioning = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateSlideCounter();
        this.updateNavButtons();
    }

    initializeElements() {
        // Get DOM elements
        this.slides = document.querySelectorAll('.slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.currentSlideEl = document.getElementById('current-slide');
        this.totalSlidesEl = document.getElementById('total-slides');
        
        // Set total slides
        this.totalSlidesEl.textContent = this.totalSlides;
    }

    bindEvents() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Slide indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index + 1));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Prevent context menu on right click for better presentation experience
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    handleKeyboard(e) {
        if (this.isTransitioning) return;
        
        switch(e.key) {
            case 'ArrowRight':
            case ' ': // Spacebar
            case 'PageDown':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'Escape':
                e.preventDefault();
                this.goToSlide(1);
                break;
        }
    }

    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.updateSlideLayout();
        }, 250);
    }

    updateSlideLayout() {
        // Force layout recalculation after resize
        this.slides.forEach(slide => {
            slide.style.transform = slide.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';
        });
    }

    nextSlide() {
        if (this.isTransitioning || this.currentSlide >= this.totalSlides) return;
        this.goToSlide(this.currentSlide + 1);
    }

    previousSlide() {
        if (this.isTransitioning || this.currentSlide <= 1) return;
        this.goToSlide(this.currentSlide - 1);
    }

    goToSlide(slideNumber) {
        if (this.isTransitioning || slideNumber === this.currentSlide || slideNumber < 1 || slideNumber > this.totalSlides) {
            return;
        }

        this.isTransitioning = true;
        const previousSlide = this.currentSlide;
        this.currentSlide = slideNumber;

        // Update slide visibility and transitions
        this.updateSlideTransitions(previousSlide, this.currentSlide);
        
        // Update UI elements
        this.updateSlideCounter();
        this.updateNavButtons();
        this.updateIndicators();

        // Reset transition flag after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
            this.cleanupSlideClasses();
        }, 500);
    }

    updateSlideTransitions(fromSlide, toSlide) {
        const currentSlideEl = document.querySelector(`.slide[data-slide="${fromSlide}"]`);
        const nextSlideEl = document.querySelector(`.slide[data-slide="${toSlide}"]`);

        if (!currentSlideEl || !nextSlideEl) return;

        // Determine direction
        const isForward = toSlide > fromSlide;
        
        // Remove active class from current slide
        currentSlideEl.classList.remove('active');
        
        // Set up next slide position
        if (isForward) {
            nextSlideEl.style.transform = 'translateX(100%)';
            currentSlideEl.style.transform = 'translateX(-100%)';
        } else {
            nextSlideEl.style.transform = 'translateX(-100%)';
            currentSlideEl.style.transform = 'translateX(100%)';
        }

        // Force reflow
        nextSlideEl.offsetHeight;

        // Animate to final positions
        requestAnimationFrame(() => {
            nextSlideEl.classList.add('active');
            nextSlideEl.style.transform = 'translateX(0)';
            
            if (isForward) {
                currentSlideEl.classList.add('prev');
            }
        });
    }

    cleanupSlideClasses() {
        // Clean up all slide classes and positions
        this.slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            
            if (slideNumber === this.currentSlide) {
                slide.classList.add('active');
                slide.classList.remove('prev');
                slide.style.transform = 'translateX(0)';
            } else {
                slide.classList.remove('active', 'prev');
                slide.style.transform = slideNumber < this.currentSlide ? 'translateX(-100%)' : 'translateX(100%)';
            }
        });
    }

    updateSlideCounter() {
        this.currentSlideEl.textContent = this.currentSlide;
        
        // Add smooth counter animation
        this.currentSlideEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.currentSlideEl.style.transform = 'scale(1)';
        }, 150);
    }

    updateNavButtons() {
        // Update previous button
        if (this.currentSlide <= 1) {
            this.prevBtn.disabled = true;
            this.prevBtn.style.opacity = '0.3';
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.style.opacity = '1';
        }

        // Update next button
        if (this.currentSlide >= this.totalSlides) {
            this.nextBtn.disabled = true;
            this.nextBtn.style.opacity = '0.3';
        } else {
            this.nextBtn.disabled = false;
            this.nextBtn.style.opacity = '1';
        }
    }

    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            const slideNumber = index + 1;
            
            if (slideNumber === this.currentSlide) {
                indicator.classList.add('active');
                indicator.style.transform = 'scale(1.2)';
            } else {
                indicator.classList.remove('active');
                indicator.style.transform = 'scale(1)';
            }
        });
    }

    // Public methods for external control
    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }

    isLastSlide() {
        return this.currentSlide === this.totalSlides;
    }

    isFirstSlide() {
        return this.currentSlide === 1;
    }

    // Auto-advance functionality (optional)
    startAutoAdvance(intervalMs = 30000) {
        this.stopAutoAdvance();
        this.autoAdvanceInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoAdvance();
            }
        }, intervalMs);
    }

    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }

    // Presentation mode controls
    enterPresentationMode() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
        document.body.style.cursor = 'none';
        
        // Auto-hide cursor after inactivity
        this.setupCursorAutoHide();
    }

    exitPresentationMode() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        document.body.style.cursor = 'default';
        this.clearCursorAutoHide();
    }

    setupCursorAutoHide() {
        let cursorTimeout;
        
        const hideCursor = () => {
            document.body.style.cursor = 'none';
        };
        
        const showCursor = () => {
            document.body.style.cursor = 'default';
            clearTimeout(cursorTimeout);
            cursorTimeout = setTimeout(hideCursor, 3000);
        };
        
        document.addEventListener('mousemove', showCursor);
        this.cursorAutoHide = { showCursor, hideCursor };
    }

    clearCursorAutoHide() {
        if (this.cursorAutoHide) {
            document.removeEventListener('mousemove', this.cursorAutoHide.showCursor);
            this.cursorAutoHide = null;
        }
    }
}

// Utility functions for smooth animations
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateValue(element, start, end, duration, callback) {
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        
        const currentValue = start + (end - start) * easedProgress;
        
        if (callback) {
            callback(currentValue);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global presentation instance
    window.presentation = new PresentationApp();
    
    // Add some presentation-specific behaviors
    
    // Smooth scroll behavior for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Prevent text selection for cleaner presentation
    document.body.style.userSelect = 'none';
    
    // Add loading animation completion
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // Handle visibility change (for pause/resume functionality)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            window.presentation.stopAutoAdvance();
        }
    });
    
    // Add gesture support for touch devices
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchStartX - touchEndX;
        const deltaY = touchStartY - touchEndY;
        
        // Only handle horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // Swipe left (next slide)
                window.presentation.nextSlide();
            } else {
                // Swipe right (previous slide)
                window.presentation.previousSlide();
            }
        }
        
        touchStartX = 0;
        touchStartY = 0;
    }, { passive: true });
    
    // Add double-tap to enter/exit fullscreen
    let lastTouchTime = 0;
    document.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTouchTime;
        
        if (tapLength < 500 && tapLength > 0) {
            // Double tap detected
            if (document.fullscreenElement) {
                window.presentation.exitPresentationMode();
            } else {
                window.presentation.enterPresentationMode();
            }
        }
        
        lastTouchTime = currentTime;
    });
    
    // Console helper for development
    if (window.console) {
        console.log('🎯 Aurgen Presentation Ready!');
        console.log('Use arrow keys, spacebar, or click navigation to control slides');
        console.log('Press F11 or double-tap for fullscreen presentation mode');
        console.log('Available methods:', Object.getOwnPropertyNames(PresentationApp.prototype));
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresentationApp;
}