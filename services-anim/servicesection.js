class AccordionSlider {
    constructor() {
        this.slides = document.querySelectorAll("#services-container .slide");
        this.prevBtn = document.querySelector("#services-container .nav-prev");
        this.nextBtn = document.querySelector("#services-container .nav-next");
        
        if (this.slides.length === 0) return;

        this.currentIndex = -1;
        this.init();
    }

    init() {
        this.slides.forEach((slide, index) => {
            slide.addEventListener("click", () => this.setActiveSlide(index));
        });

        if (this.prevBtn) this.prevBtn.addEventListener("click", () => this.previousSlide());
        if (this.nextBtn) this.nextBtn.addEventListener("click", () => this.nextSlide());

        document.addEventListener("keydown", (e) => {
            // Only trigger if the section is in view (optional safety)
            const container = document.getElementById("services-container");
            if (container && container.getBoundingClientRect().top < window.innerHeight) {
                if (e.key === "ArrowLeft") this.previousSlide();
                if (e.key === "ArrowRight") this.nextSlide();
            }
        });
    }

    setActiveSlide(index) {
        if (this.currentIndex === index) {
            this.slides.forEach((slide) => slide.classList.remove("active"));
            this.currentIndex = -1;
        } else {
            this.slides.forEach((slide) => slide.classList.remove("active"));
            this.slides[index].classList.add("active");
            this.currentIndex = index;
        }
    }

    nextSlide() {
        const nextIndex = this.currentIndex === -1 ? 0 : (this.currentIndex + 1) % this.slides.length;
        this.setActiveSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = this.currentIndex === -1 ? this.slides.length - 1 : (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.setActiveSlide(prevIndex);
    }
}

// --- LOADER LOGIC ---
function loadServices() {
    fetch('services-anim/servicesection.html')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load services');
            return response.text();
        })
        .then(data => {
            const container = document.getElementById('services-container');
            if (container) {
                container.innerHTML = data;
                // Initialize the slider AFTER the HTML is inserted
                new AccordionSlider();
                console.log("Services loaded successfully.");
            }
        })
        .catch(err => console.error(err));
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", loadServices);

// --- GLITCH SCROLL EFFECT ---
document.addEventListener("DOMContentLoaded", () => {
    const servicesSection = document.getElementById('services-container');
    const displacementMap = document.getElementById('displacement-map');

    if (servicesSection && displacementMap) {
        const observerOptions = {
            root: null,
            // We use a high density of thresholds to catch the fast snap movement
            threshold: buildThresholdList()
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const visibility = entry.intersectionRatio;
                const innerContent = servicesSection.querySelector('.slider-container');

                // 1. Calculate Glitch Intensity
                // INCREASED MULTIPLIER to 50 (was 15). 
                // Since snapping is fast, we need a stronger effect to make it visible.
                const glitchAmount = (1 - visibility) * 15; 
                displacementMap.scale.baseVal = glitchAmount;

                // 2. Fade the INNER CONTENT
                if (innerContent) {
                    // Logic to ensure text remains crisp when fully visible
                    if (visibility > 0.99) {
                        innerContent.style.filter = 'none';
                        innerContent.style.opacity = 1;
                    } else {
                        innerContent.style.filter = 'url(#pixel-glitch-filter)';
                        innerContent.style.opacity = visibility;
                    }
                }
            });
        }, observerOptions);

        observer.observe(servicesSection);
    }
});

function buildThresholdList() {
    let thresholds = [];
    let numSteps = 55; // Increased steps for smoother detection during snap
    for (let i = 1.0; i <= numSteps; i++) {
        thresholds.push(i / numSteps);
    }
    thresholds.push(0);
    return thresholds;
}
