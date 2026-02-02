// Portfolio Website Carousel Controller
// Handles image carousel with autoplay, seamless looping, and user interactions

document.addEventListener("DOMContentLoaded", () => {
	// Get DOM elements
	const track = document.querySelector(".carousel__track");
	const originalSlides = Array.from(document.querySelectorAll(".carousel__slide"));
	const prevBtn = document.querySelector(".carousel__control.prev");
	const nextBtn = document.querySelector(".carousel__control.next");
	const dotsContainer = document.querySelector(".carousel__dots");
	
	// Carousel state
	let interval = null;
	const AUTOPLAY_MS = 5000; // 5 seconds between slides

	// Create navigation dots for each real slide
	originalSlides.forEach((_, i) => {
		const btn = document.createElement("button");
		if (i === 0) btn.classList.add("active");
		btn.addEventListener("click", () => goTo(i));
		dotsContainer.appendChild(btn);
	});
	const dots = Array.from(dotsContainer.children);

	// ---- SEAMLESS LOOPING SETUP ----
	// Clone first and last slides for infinite scroll effect
	const firstClone = originalSlides[0].cloneNode(true);
	const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
	firstClone.setAttribute('aria-hidden', 'true'); // Hide from screen readers
	lastClone.setAttribute('aria-hidden', 'true');
	
	// Add clones to track: [lastClone, slide1, slide2, slide3, firstClone]
	track.appendChild(firstClone);
	track.insertBefore(lastClone, track.firstChild);

	// Update slides array to include clones
	const slides = Array.from(track.querySelectorAll('.carousel__slide'));
	let current = 1; // Start at first real slide (index 1, because 0 is lastClone)

	// ---- POSITION MANAGEMENT ----
	// Set carousel position with optional transition control
	function setPosition(index, withTransition = true) {
		if (!withTransition) {
			track.style.transition = 'none';
		} else {
			track.style.transition = 'transform 0.6s ease';
		}
		track.style.transform = `translateX(${-index * 100}%)`;

		// Update active states for real slides and dots
		const realIndex = (index - 1 + originalSlides.length) % originalSlides.length;
		originalSlides.forEach((s, i) => s.classList.toggle('active', i === realIndex));
		dots.forEach((d, i) => d.classList.toggle('active', i === realIndex));
	}

	// Move to specific slide with transition
	function moveTo(index) {
		current = index;
		setPosition(current, true);
		resetAutoplay();
	}

	// Navigation functions
	function next() { moveTo(current + 1); }
	function prev() { moveTo(current - 1); }
	function goTo(slideIndex) { moveTo(slideIndex + 1); } // +1 because of leading clone

	// ---- EVENT LISTENERS ----
	// Button controls
	prevBtn.addEventListener('click', prev);
	nextBtn.addEventListener('click', next);

	// Handle seamless looping when transition ends
	track.addEventListener('transitionend', () => {
		// If we moved to the first clone (at end), jump to first real slide
		if (current === slides.length - 1) {
			current = 1;
			setPosition(current, false); // No transition for instant jump
		}
		// If we moved to the last clone (at beginning), jump to last real slide
		if (current === 0) {
			current = originalSlides.length;
			setPosition(current, false);
		}
	});

	// Dot navigation
	dots.forEach((btn, i) => btn.addEventListener('click', () => moveTo(i + 1)));

	// ---- AUTOPLAY MANAGEMENT ----
	function startAutoplay() {
		if (interval) return; // Prevent duplicate intervals
		interval = setInterval(() => next(), AUTOPLAY_MS);
	}

	function stopAutoplay() {
		if (!interval) return;
		clearInterval(interval);
		interval = null;
	}

	function resetAutoplay() { 
		stopAutoplay(); 
		startAutoplay(); 
	}

	// ---- USER INTERACTION HANDLING ----
	const carousel = document.querySelector('.carousel');
	
	// Pause autoplay on user interaction
	carousel.addEventListener('mouseenter', stopAutoplay);
	carousel.addEventListener('mouseleave', startAutoplay);
	carousel.addEventListener('focusin', stopAutoplay);
	carousel.addEventListener('focusout', startAutoplay);
	carousel.addEventListener('touchstart', stopAutoplay, { passive: true });
	carousel.addEventListener('touchend', startAutoplay, { passive: true });

	// Stop autoplay when page is hidden (tab switching, etc.)
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			stopAutoplay();
		} else {
			startAutoplay();
		}
	});

	// ---- KEYBOARD NAVIGATION ----
	document.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
	});

	// ---- INITIALIZATION ----
	// Set initial position and start autoplay
	setPosition(current, false);
	startAutoplay();
});