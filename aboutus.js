import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- CONFIGURATION ---
const container = document.getElementById('canvas-container');

// --- LIGHTING SETTINGS (Preserved) ---
const params = {
    envMapIntensity: 1.0, 
    exposure: 0.30,      
    ambientIntensity: 2.87, 
    dirLightIntensity: 6.48, 
    bgColor: 0x000d19    
};

// 1. SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(params.bgColor);
scene.fog = new THREE.Fog(params.bgColor, 10, 80); 

// 2. CAMERA SETUP
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// --- START POSITION (Image 1: 221253.png) ---
camera.position.set(16.46, 24.30, -36.02);
// Global target object that we will animate
const cameraTarget = new THREE.Vector3(15.76, 25.02, -11.24); 

// 3. RENDERER SETUP
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = params.exposure;
container.appendChild(renderer.domElement);

// 4. LIGHTING
const ambientLight = new THREE.AmbientLight(0xffffff, params.ambientIntensity);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, params.dirLightIntensity);
dirLight.position.set(-18, 4.2, -77);
dirLight.castShadow = true;
scene.add(dirLight);

// 5. LOAD MODEL
const loader = new GLTFLoader();
const modelPath = './assets/station/raining_city.glb'; 

let cityModel = null;

loader.load(modelPath, (gltf) => {
    cityModel = gltf.scene;
    scene.add(cityModel);
    
    // Start animation timeline once model is loaded
    initScrollAnimation();
}, undefined, (error) => {
    console.error('An error happened loading the model:', error);
});

// 6. PAGE LOAD LOGIC
const loadingScreen = document.getElementById('loading-screen'); 

window.addEventListener('load', () => {
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0'; 
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
        }
        const nav = document.querySelector('.glass-nav'); 
        if (nav) nav.classList.add('slide-in'); 
    }, 2500); 
});

// 7. SCROLL ANIMATION
function initScrollAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    // Text Fade Effects
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => {
        const textBox = sec.querySelector('.text-box');
        ScrollTrigger.create({
            trigger: sec,
            start: "top center",
            onEnter: () => textBox.classList.add('visible'),
            onLeaveBack: () => textBox.classList.remove('visible')
        });
    });

    // Master Timeline
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5, 
        }
    });

    // --- COORDINATE SEQUENCE (Mapped from your 7 new images) ---

    // Move 1: Drop to street level
    tl.to(camera.position, { x: 15.39, y: 2.16, z: -35.43, ease: "power1.inOut" }, "s1")
      .to(cameraTarget,    { x: 15.88, y: 1.86, z: -10.64, ease: "power1.inOut" }, "s1");

    // Move 2: Look straight down/forward from mid-height
    tl.to(camera.position, { x: 15.18, y: 10.85, z: 12.97, ease: "power1.inOut" }, "s2")
      .to(cameraTarget,    { x: 15.88, y: 1.80, z: -10.60, ease: "power1.inOut" }, "s2");

    // Move 3: Top-down view
    tl.to(camera.position, { x: 16.33, y: 35.65, z: 12.36, ease: "power1.inOut" }, "s3")
      .to(cameraTarget,    { x: 16.33, y: 1.97, z: 12.59, ease: "power1.inOut" }, "s3");

    // Move 4: Rotate to side view
    tl.to(camera.position, { x: 16.46, y: 27.73, z: 1.46, ease: "power1.inOut" }, "s4")
      .to(cameraTarget,    { x: 15.95, y: 26.96, z: 25.00, ease: "power1.inOut" }, "s4");

    // Move 5: Pan further right
    tl.to(camera.position, { x: 24.11, y: 28.31, z: 8.61, ease: "power1.inOut" }, "s5")
      .to(cameraTarget,    { x: 5.00, y: 27.43, z: 20.24, ease: "power1.inOut" }, "s5");

    // Move 6: Wide shot pull-back
    tl.to(camera.position, { x: 44.17, y: 29.24, z: -3.61, ease: "power1.inOut" }, "s6")
      .to(cameraTarget,    { x: 5.00, y: 27.43, z: 20.24, ease: "power1.inOut" }, "s6");
}

// 8. RENDER LOOP
function animate() {
    requestAnimationFrame(animate);
    camera.lookAt(cameraTarget); 
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();