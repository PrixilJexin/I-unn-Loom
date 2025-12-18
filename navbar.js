document.addEventListener("DOMContentLoaded", function() {
    const navPlaceholder = document.getElementById("nav-placeholder");

    fetch("navbar.html")
        .then(response => response.text())
        .then(data => {
            navPlaceholder.innerHTML = data;

            const nav = document.querySelector(".glass-nav");
            
            // LOGIC:
            // If Home Page: Do nothing (Waiting for Enter Button).
            // If Other Page: Slide down immediately.
            
            if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
                // We are on About, Services, etc.
                setTimeout(() => {
                    if (nav) nav.classList.add("slide-in");
                }, 200); // Slight delay for smoothness
            }
        })
        .catch(error => console.error("Error loading navbar:", error));
});