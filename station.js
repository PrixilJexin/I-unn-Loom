import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function initStation() {
    const canvas = document.querySelector('#station-canvas');
    const section = document.querySelector('#station-section');
    const btn = document.getElementById('explore-btn');
    const content = document.querySelector('.station-content'); 
    const footer = document.getElementById('station-footer'); // NEW: Select the footer
    
    if (!canvas) return;

    // --- 1. COORDINATES SETUP ---
    const START_POS = new THREE.Vector3(-20, 0, 500);
    const SCROLL_POS = new THREE.Vector3(-15, 6.5, -15.5);
    const EXPLORE_POS = new THREE.Vector3(1.5, 6, -16);

    // Current target state
    let targetPos = START_POS.clone();
    let moveSpeed = 0.02; // Standard cinematic speed
    
    // NEW: State flags for footer logic
    let isExploring = false; 
    let footerVisible = false;

    // --- 2. SCENE SETUP ---
    const scene = new THREE.Scene();
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.copy(START_POS);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // --- 3. LOAD MODEL ---
    const loader = new GLTFLoader();
    let mixer;
    const clock = new THREE.Clock();

    loader.load('assets/station/scene.gltf', (gltf) => {
        const model = gltf.scene;
        // Adjust scale/position if needed to keep it centered
        model.scale.set(1, 1, 1); 
        model.position.set(0, -1, 0);
        scene.add(model);

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }
    }, undefined, (error) => console.error(error));

    // --- 4. INTERACTION LOGIC ---

    // A. SCROLL OBSERVER (Triggers movement when section is visible)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // --- USER ENTERS SECTION ---
                targetPos = SCROLL_POS;
                moveSpeed = 0.02; 
            } else {
                // --- USER LEAVES SECTION (RESET EVERYTHING) ---
                
                // 1. Reset Camera
                targetPos = START_POS;
                moveSpeed = 0.02;
                
                // 2. Reset Flags
                isExploring = false;
                footerVisible = false;
                
                // 3. Reset Text Visibility
                if (content) {
                    content.style.transition = 'opacity 0.5s ease'; 
                    content.style.opacity = '1';
                    content.style.pointerEvents = 'auto'; 
                }

                // 4. Hide Footer
                if (footer) {
                    footer.classList.remove('visible');
                }
            }
        });
    }, { threshold: 0.3 }); 

    if (section) observer.observe(section);

    // B. BUTTON CLICK (Triggers Explore Zoom)
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            // Set new target to EXPLORE_POS
            targetPos = EXPLORE_POS;
            moveSpeed = 0.03; 
            
            // Mark state as exploring so we know to check for the footer
            isExploring = true;

            // Hide the text/button
            if (content) {
                content.style.transition = 'opacity 0.5s ease';
                content.style.opacity = '0';
                content.style.pointerEvents = 'none';
            }
        });
    }

    // --- 5. ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);

        // Resize Logic
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        // --- CAMERA MOVEMENT ---
        // Smoothly lerp current position to the target position
        camera.position.lerp(targetPos, moveSpeed);
        camera.lookAt(0, 0, 0);

        // --- NEW: FOOTER TRIGGER CHECK ---
        // Only check if we are exploring and the footer is not yet visible
        if (isExploring && !footerVisible) {
            // Check distance to target. If < 0.5 units, we have "arrived"
            if (camera.position.distanceTo(EXPLORE_POS) < 0.5) {
                if (footer) footer.classList.add('visible'); // Show footer via CSS class
                footerVisible = true; // Stop checking
            }
        }

        renderer.render(scene, camera);
    }

    animate();
}

initStation();