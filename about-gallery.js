document.addEventListener("DOMContentLoaded", (event) => {
    // Ensure GSAP plugins are registered
    gsap.registerPlugin(ScrollTrigger, Flip);

    let flipCtx;

    const createTween = () => {
        let galleryElement = document.querySelector("#gallery-8");
        let galleryItems = galleryElement.querySelectorAll(".gallery__item");

        // Cleanup previous context if resizing
        if (flipCtx) flipCtx.revert();
        
        // Ensure we start from the initial state
        galleryElement.classList.remove("gallery--final");

        flipCtx = gsap.context(() => {
            // 1. Capture the "Final" State (Expanded)
            // We add the class, calculate state, then remove the class immediately
            galleryElement.classList.add("gallery--final");
            const flipState = Flip.getState(galleryItems);
            galleryElement.classList.remove("gallery--final");

            // 2. Define the Flip Animation
            const flip = Flip.to(flipState, {
                simple: true,
                ease: "expoScale(1, 5)",
                duration: 1
            });

            // 3. Link Animation to ScrollTrigger
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".gallery-wrap", // The wrapper pins the screen
                    start: "center center",
                    end: "+=100%", // Scroll distance duration
                    scrub: true,   // Smooth scrubbing
                    pin: true,     // Pin the gallery in place
                    anticipatePin: 1
                }
            });
            
            tl.add(flip);
        });
    };

    // Initialize
    createTween();

    // Re-calculate on window resize to keep things responsive
    window.addEventListener("resize", createTween);
});