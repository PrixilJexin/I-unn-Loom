import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURATION ---
const GALAXY_PATH = 'space_galaxy.gltf';
const SPACESHIP_PATH = 'spaceship_compressed.glb'; 

// Camera Settings
const START_POS = new THREE.Vector3(0, 80, 40); 
const TARGET_POS = new THREE.Vector3(1, 2, 0.5); // Standard View
const ZOOM_SPEED = 1; 

// Warp Settings (Close-up Zoom)
const WARP_POS = new THREE.Vector3(0, 0.0001, 0); 
const WARP_SPEED = 1.0; 

// State
let isZooming = false; 
let isWarping = false; 

// 1. Setup Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(START_POS);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace; 
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 2. Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// 3. Load Models
const loader = new GLTFLoader();
let galaxyMixer;
let spaceshipMixer;
let spaceshipModel;

// A. LOAD GALAXY
loader.load(GALAXY_PATH, (gltf) => {
    const model = gltf.scene;
    model.scale.set(2, 2, 2); 

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    model.traverse((child) => {
        if (child.isMesh || child.isPoints) {
            child.material.vertexColors = true;
            if (child.material.emissive) {
                child.material.emissive = child.material.color;
                child.material.emissiveIntensity = 1.5;
            }
        }
    });

    scene.add(model);

    if (gltf.animations && gltf.animations.length > 0) {
        galaxyMixer = new THREE.AnimationMixer(model);
        galaxyMixer.clipAction(gltf.animations[0]).play();
    }
}, undefined, (error) => console.error(error));

// B. LOAD SPACESHIP
loader.load(SPACESHIP_PATH, (gltf) => {
    spaceshipModel = gltf.scene;
    spaceshipModel.scale.set(1, 1, 1); 
    spaceshipModel.position.set(3, 0, 0); 
    spaceshipModel.rotation.y = -Math.PI / 6; 
    
    scene.add(spaceshipModel);

    if (gltf.animations && gltf.animations.length > 0) {
        spaceshipMixer = new THREE.AnimationMixer(spaceshipModel);
        spaceshipMixer.clipAction(gltf.animations[0]).play();
    }
}, undefined, (error) => console.error(error));

// 4. Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false; 
controls.autoRotate = true; 
controls.autoRotateSpeed = 0.1;
controls.enablePan = false; 
controls.enabled = false; 

// 5. PAGE LOAD LOGIC
const loadingScreen = document.getElementById('loading-screen'); 
const content = document.querySelector('.hero-content'); 

window.addEventListener('load', () => {
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0'; 
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
        }
        
        // --- NEW: TRIGGER TEXT ANIMATION HERE ---
        initLetterAnimation(); 
        // ----------------------------------------

        if (content) content.classList.add('visible');
        
        const nav = document.querySelector('.glass-nav'); 
        if (nav) nav.classList.add('slide-in'); 

        isZooming = true; 
    }, 2500); 
});

// 6. EVENT LISTENERS

// A. Button Click (Start Warp)
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'explore-btn') {
        isWarping = true; 
        controls.enabled = false;
        controls.autoRotate = false;
    }
});

// B. Reset Logic when leaving Station Section
const stationSection = document.getElementById('station-section');
if (stationSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                isWarping = false; 
                controls.autoRotate = true;
            }
        });
    }, { threshold: 0.1 }); 

    observer.observe(stationSection);
}


// 7. Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (isZooming) {
        camera.position.lerp(TARGET_POS, ZOOM_SPEED * delta);
        camera.lookAt(0, 0, 0);

        if (camera.position.distanceTo(TARGET_POS) < 0.1) {
            isZooming = false;
            controls.enabled = true; 
            controls.target.set(0, 0, 0); 
        }
    }

    if (isWarping) {
        camera.position.lerp(WARP_POS, WARP_SPEED * delta);
        camera.lookAt(0, 0, 0);
    } 
    else if (!isZooming && !isWarping && camera.position.distanceTo(TARGET_POS) > 0.1) {
        camera.position.lerp(TARGET_POS, 1.0 * delta); 
        camera.lookAt(0, 0, 0);
        
        if (camera.position.distanceTo(TARGET_POS) < 0.1) {
             controls.enabled = true;
        }
    }

    if (galaxyMixer) galaxyMixer.update(delta);
    if (spaceshipMixer) spaceshipMixer.update(delta);

    if (spaceshipModel) {
        spaceshipModel.position.y = Math.sin(elapsedTime * 0.5) * 0.2; 
    }

    if (!isZooming && !isWarping) {
        controls.update();
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- NEW HELPER FUNCTION: TEXT ANIMATION ---
function initLetterAnimation() {
    // Select all elements with the 'js-spanize' class
    const elements = document.querySelectorAll('.js-spanize');
    
    elements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = ''; // Clear current text
        
        // Split text into characters
        const chars = text.split('');
        
        chars.forEach((char, index) => {
            const span = document.createElement('span');
            
            // Preserve spaces
            if (char === ' ') {
                span.innerHTML = '&nbsp;';
            } else {
                span.innerText = char;
            }
            
            // MATH FOR DELAY:
            // If it's the subtitle, add an extra 1.5s delay so it plays after the title
            let baseDelay = 0;
            if (el.classList.contains('subtitle')) {
                baseDelay = 1; 
            }
            
            // Stagger each letter by 0.05s
            const delay = baseDelay + (index * 0.05);
            span.style.animationDelay = `${delay}s`;
            
            el.appendChild(span);
        });
    });
}