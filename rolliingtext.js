document.addEventListener("DOMContentLoaded", () => {
            const words = document.querySelectorAll('.word');
            const wrapper = document.querySelector('.roll-text-wrapper');
            let currentIndex = 0;
            let autoRollInterval;
            let isHovering = false;
            
            const GAP_BETWEEN_WORDS = 100; 
            const ANIMATION_DURATION = 1000; 
            
            function triggerNextWord() {
                if (isHovering) return;
                words.forEach(w => w.classList.remove('auto-roll'));
                
                const currentWord = words[currentIndex];
                currentWord.classList.add('auto-roll');

                setTimeout(() => {
                    if (!isHovering) currentWord.classList.remove('auto-roll');
                }, ANIMATION_DURATION);

                currentIndex = (currentIndex + 1) % words.length;
                autoRollInterval = setTimeout(triggerNextWord, GAP_BETWEEN_WORDS + ANIMATION_DURATION);
            }

            wrapper.addEventListener('mouseenter', () => {
                isHovering = true;
                clearTimeout(autoRollInterval); 
                words.forEach(w => w.classList.remove('auto-roll')); 
            });

            wrapper.addEventListener('mouseleave', () => {
                isHovering = false;
                triggerNextWord();
            });

            // Initial start
            triggerNextWord();
        });