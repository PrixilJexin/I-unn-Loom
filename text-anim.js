document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Initialize SplitType
    // This splits the text into lines, words, and characters (.char)
    const textElements = document.querySelectorAll('.animate-text');
    
    const split = new SplitType(textElements, {
        types: 'lines, words, chars',
        tagName: 'span'
    });

    // 2. Make elements visible now that they are split
    textElements.forEach(el => el.classList.add('is-initialized'));

    // 3. Create the "Rising Strong" Animation
    textElements.forEach((element) => {
        // Select the characters inside this specific element
        const chars = element.querySelectorAll('.char');

        gsap.fromTo(chars, 
            {
                y: 100,         // Start 100px down
                opacity: 0      // Start invisible
            },
            {
                y: 0,           // Move to original position
                opacity: 1,
                duration: 1.2,  // Duration of flight
                ease: "expo.out", // The specific "Rising Strong" easing curve
                stagger: 0.02,  // Delay between each letter
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%", // Start anim when text is near bottom of screen
                    end: "bottom center",
                    toggleActions: "play none none reverse" // Replays if you scroll back up
                }
            }
        );
    });

    // 4. Handle Window Resize (SplitText needs to recalculate on resize)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Revert splitting to clean up DOM
            split.revert();
            // Re-split and re-animate (optional, or just refresh ScrollTrigger)
            ScrollTrigger.refresh();
        }, 200);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // 1. STANDARD TEXT ANIMATION (Paragraphs)
    // ==========================================
    const paraElements = document.querySelectorAll('.animate-text');
    const paraSplit = new SplitType(paraElements, { types: 'lines, words, chars', tagName: 'span' });
    
    paraElements.forEach(el => el.classList.add('is-initialized'));

    paraElements.forEach((element) => {
        const chars = element.querySelectorAll('.char');
        gsap.fromTo(chars, 
            { y: 50, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.01,
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // ==========================================
    // 2. "MOVING LETTERS #5" FOR H2
    // ==========================================
    const titleElement = document.querySelector('.ml5');
    
    if (titleElement) {
        // 1. Inject the Line span automatically
        const line = document.createElement('span');
        line.classList.add('line');
        titleElement.appendChild(line);

        // 2. Split the Text
        const titleSplit = new SplitType(titleElement, { types: 'chars', tagName: 'span' });

        // 3. Create the Timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: titleElement,
                start: "top 80%", // Start when title is 80% down the screen
                toggleActions: "play none none reverse"
            }
        });

        // Sequence: Line expands -> Text rises up -> (Optional) Line fades slightly
        tl.to(line, {
            scaleX: 1,
            duration: 0.8,
            ease: "expo.inOut"
        })
        .fromTo(titleElement.querySelectorAll('.char'), 
            { 
                y: "100%", 
                opacity: 0 
            }, 
            {
                y: "0%",
                opacity: 1,
                duration: 0.8,
                ease: "expo.out",
                stagger: 0.04
            }, 
            "-=0.4" // Start text overlapping with line expansion
        );
    }

    // ==========================================
    // HANDLE RESIZE
    // ==========================================
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            paraSplit.revert();
            // Note: We don't revert titleSplit here to keep the .line element intact
            // But we reload the page or refresh ScrollTrigger
            ScrollTrigger.refresh();
        }, 200);
    });
});