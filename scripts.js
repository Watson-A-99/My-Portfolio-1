// Portfolio Website Carousel Controller - FIXED VERSION
document.addEventListener("DOMContentLoaded", () => {
	const track = document.querySelector(".carousel__track");
	const slides = Array.from(document.querySelectorAll(".carousel__slide"));
	const prevBtn = document.querySelector(".carousel__control.prev");
	const nextBtn = document.querySelector(".carousel__control.next");
	const dotsContainer = document.querySelector(".carousel__dots");
	
	// Ensure all elements exist before proceeding
	if (!track || !slides.length || !prevBtn || !nextBtn || !dotsContainer) {
		console.warn('Carousel elements not found');
		return;
	}
	
	// Create dots for navigation
	slides.forEach((_, i) => {
		const btn = document.createElement("button");
		btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
		if (i === 0) btn.classList.add("active");
		dotsContainer.appendChild(btn);
	});
	const dots = Array.from(dotsContainer.children);
	
	let currentSlide = 0;
	let interval = null;
	const AUTOPLAY_MS = 5000;
	let isTransitioning = false;

	// FIXED: Ensure captions are always visible during transitions
	function ensureCaptionVisibility() {
		slides.forEach((slide, index) => {
			const caption = slide.querySelector('.hero__caption');
			if (caption) {
				// Force caption to stay visible
				caption.style.visibility = 'visible';
				caption.style.opacity = '1';
				caption.style.zIndex = '100';
				caption.style.transform = 'translateZ(0)';
			}
		});
	}

	// Update slide position and active states
	function updateSlide(targetIndex, immediate = false) {
		if (isTransitioning && !immediate) return;
		
		isTransitioning = true;
		
		// Apply transform
		const translateX = -targetIndex * 100;
		track.style.transform = `translateX(${translateX}%)`;
		
		// Update dots
		dots.forEach((dot, index) => {
			dot.classList.toggle('active', index === targetIndex);
		});
		
		// Update current slide
		currentSlide = targetIndex;
		
		// FIXED: Ensure captions remain visible during and after transition
		ensureCaptionVisibility();
		
		// Reset transition flag after animation completes
		setTimeout(() => {
			isTransitioning = false;
			ensureCaptionVisibility(); // Double-check caption visibility
		}, 600); // Match CSS transition duration
	}

	// Navigation functions
	function nextSlide() {
		const nextIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
		updateSlide(nextIndex);
	}

	function prevSlide() {
		const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
		updateSlide(prevIndex);
	}

	// Event listeners
	nextBtn.addEventListener('click', (e) => {
		e.preventDefault();
		nextSlide();
		resetAutoplay();
	});

	prevBtn.addEventListener('click', (e) => {
		e.preventDefault();
		prevSlide();
		resetAutoplay();
	});

	// Dot navigation
	dots.forEach((dot, i) => {
		dot.addEventListener('click', (e) => {
			e.preventDefault();
			updateSlide(i);
			resetAutoplay();
		});
	});

	// Autoplay functions
	function startAutoplay() {
		if (interval) return;
		interval = setInterval(() => {
			nextSlide();
		}, AUTOPLAY_MS);
	}

	function stopAutoplay() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function resetAutoplay() {
		stopAutoplay();
		setTimeout(() => {
			startAutoplay();
		}, 1000); // Give user a moment before resuming autoplay
	}

	// Pause autoplay on interaction
	const carousel = document.querySelector('.carousel');
	if (carousel) {
		carousel.addEventListener('mouseenter', stopAutoplay);
		carousel.addEventListener('mouseleave', startAutoplay);
		carousel.addEventListener('focusin', stopAutoplay);
		carousel.addEventListener('focusout', startAutoplay);
	}

	// Keyboard navigation
	document.addEventListener('keydown', (e) => {
		if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
			return; // Don't interfere with form inputs
		}
		
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prevSlide();
			resetAutoplay();
		}
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			nextSlide();
			resetAutoplay();
		}
	});

	// Pause when tab is hidden
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			stopAutoplay();
		} else {
			startAutoplay();
		}
	});

	// FIXED: Touch/swipe support for mobile
	let startX = 0;
	let startY = 0;
	let isTouch = false;

	if (carousel) {
		carousel.addEventListener('touchstart', (e) => {
			startX = e.touches[0].clientX;
			startY = e.touches[0].clientY;
			isTouch = true;
			stopAutoplay();
		}, { passive: true });

		carousel.addEventListener('touchmove', (e) => {
			if (!isTouch) return;
			// Prevent scrolling if horizontal swipe is detected
			const deltaX = Math.abs(e.touches[0].clientX - startX);
			const deltaY = Math.abs(e.touches[0].clientY - startY);
			if (deltaX > deltaY) {
				e.preventDefault();
			}
		}, { passive: false });

		carousel.addEventListener('touchend', (e) => {
			if (!isTouch) return;
			
			const endX = e.changedTouches[0].clientX;
			const deltaX = startX - endX;
			const minSwipeDistance = 50;

			if (Math.abs(deltaX) > minSwipeDistance) {
				if (deltaX > 0) {
					nextSlide(); // Swipe left - next slide
				} else {
					prevSlide(); // Swipe right - previous slide
				}
			}
			
			isTouch = false;
			resetAutoplay();
		}, { passive: true });
	}

	// FIXED: Initialize with immediate caption fix
	function initialize() {
		updateSlide(0, true); // Immediate, no transition
		ensureCaptionVisibility();
		
		// Start autoplay after a brief delay
		setTimeout(() => {
			startAutoplay();
		}, 500);
	}

	// FIXED: Ensure captions are visible on page load
	window.addEventListener('load', () => {
		setTimeout(() => {
			ensureCaptionVisibility();
		}, 100);
	});

	// Initialize the carousel
	initialize();
	
	// FIXED: Additional safety check for caption visibility
	setInterval(ensureCaptionVisibility, 2000); // Check every 2 seconds
});