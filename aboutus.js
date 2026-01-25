import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// --- CONFIGURATION ---
const container = document.getElementById('canvas-container');

// --- RESPONSIVE SETTINGS ---
const isMobile = window.innerWidth < 768;
const textScale = isMobile ? 0.5 : 1.0; 

// --- LIGHTING & FOG TARGETS ---
const params = {
    envMapIntensity: 4.0, 
    exposure: 0.2,      
    targetAmbient: 7, 
    targetDirLight: 8.48,
    fogNear: -10,
    fogFar: 300,
    bgColor: 0x000d19    
};

// 1. SCENE SETUP
const scene = new THREE.Scene();

// STEP 1: Set a Fallback Color immediately (Dark Blue)
// This ensures you see SOMETHING if the image fails.
scene.background = new THREE.Color(params.bgColor);

// STEP 2: Try to load the image
const textureLoader = new THREE.TextureLoader();
textureLoader.load(
    'images/backiee-99310-landscape.jpg', 
    (texture) => {
        // Success: Swap color for image
        scene.background = texture;
        console.log("Background image loaded successfully!");
    },
    undefined,
    (err) => {
        console.error("ERROR: Could not load background image. Check the file path!", err);
    }
);

// INITIALIZE FOG (Black fog to blend with stars)
scene.fog = new THREE.Fog(0x000000, 1000, 4000); 

// 2. CAMERA SETUP
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-0.80, 30.80, 85.20);
const cameraTarget = new THREE.Vector3(-0.80, 32.80, 50.20); 

// 3. RENDERER SETUP
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = params.exposure;
container.appendChild(renderer.domElement);

// 4. LIGHTING
// We start them slightly visible (0.5) so you aren't staring at a black screen if animation fails
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5); 
dirLight.position.set(-18, 4.2, -77);
dirLight.castShadow = true;
scene.add(dirLight);

// 5. 3D TEXT GENERATOR
const fontLoader = new FontLoader();
const fontUrl = 'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json';

function create3DText(text, x, y, z, size, rotationY = 0, rotationX = 0) {
    fontLoader.load(fontUrl, (font) => {
        const responsiveSize = size * textScale;
        const textGeo = new TextGeometry(text, {
            font: font,
            size: responsiveSize,
            height: 0.2, 
            curveSegments: 12,
            bevelEnabled: false
        });
        textGeo.computeBoundingBox();
        const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
        textGeo.translate(centerOffset, 0, 0);

        const textMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,        
            emissive: 0xffffff,    
            emissiveIntensity: 3.0, 
            roughness: 0.0,
            metalness: 0.1
        });
        
        const textMesh = new THREE.Mesh(textGeo, textMat);
        textMesh.position.set(x, y, z);
        textMesh.rotation.y = rotationY;
        textMesh.rotation.x = rotationX;
        scene.add(textMesh);
    });
}

create3DText("An Idunn Loom Production", 0, 32.0, 36.4, 2.3, 0, 0);
create3DText("Crafted and", 0.5, 4, 23.4, 1, 0, 0);
create3DText("Developed By", 0.5, 2.5, 23.4, 1, 0, 0);
create3DText("PRISIL JESIN.", 5.3, 1.6, -2.5, 1.5, 0, 4.7);
create3DText("Get in Touch with Us.", -3, 24.1, -11.1, 2.0, 0, 0);

// 6. LOAD MODEL
const loader = new GLTFLoader();
const modelPath = './assets/station/raining_city.glb'; 

loader.load(modelPath, (gltf) => {
    console.log("City Model Loaded!"); // Debug log
    const cityModel = gltf.scene;
    scene.add(cityModel);
    initScrollAnimation();
}, undefined, (error) => {
    console.error('ERROR: Could not load City Model. Check path:', error);
});

// 7. PAGE LOAD LOGIC & INTRO ANIMATION
// We use a safer trigger logic here.
function startIntro() {
    console.log("Starting Intro Animation...");
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
    }
    const nav = document.querySelector('.glass-nav'); 
    if (nav) nav.classList.add('slide-in');

    // ANIMATE LIGHTS ON
    gsap.to(ambientLight, { intensity: params.targetAmbient, duration: 2.5, ease: "power2.out" });
    gsap.to(dirLight,     { intensity: params.targetDirLight, duration: 2.5, ease: "power2.out" });

    // ANIMATE FOG
    gsap.to(scene.fog, { 
        near: params.fogNear, 
        far: params.fogFar, 
        duration: 3, 
        ease: "power2.inOut" 
    });
}

// Fallback: If 'load' hangs, force start after 1 second
window.addEventListener('load', startIntro);
setTimeout(startIntro, 1500); // Safety net: Force start if image loading stuck

// 8. SCROLL ANIMATION
function initScrollAnimation() {
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5, 
        }
    });

    // Move 1
    tl.to(camera.position, { x: 0.20, y: 3.40, z: 33.20, ease: "power1.inOut" }, "s1")
      .to(cameraTarget,    { x: 0.20, y: 3.40, z: 23.20, ease: "power1.inOut" }, "s1")
      .to(camera,          { fov: 60, ease: "power1.inOut" }, "s1");
    // Move 2
    tl.to(camera.position, { x: 0.20, y: 3.40, z: 7.60, ease: "power1.inOut" }, "s2")
      .to(cameraTarget,    { x: 0.20, y: 3.40, z: -2.40, ease: "power1.inOut" }, "s2")
      .to(camera,          { fov: 60, ease: "power1.inOut" }, "s2");
    // Move 3
    tl.to(camera.position, { x: 0.63, y: 21.66, z: 1.04, ease: "power1.inOut" }, "s3")
      .to(cameraTarget,    { x: 0.63, y: 11.66, z: -1.13, ease: "power1.inOut" }, "s3")
      .to(camera,          { fov: 36, ease: "power1.inOut" }, "s3");
    // Move 4
    tl.to(camera.position, { x: 0.63, y: 32.86, z: 0.94, ease: "power1.inOut" }, "s4")
      .to(cameraTarget,    { x: 0.63, y: 22.86, z: -1.03, ease: "power1.inOut" }, "s4")
      .to(camera,          { fov: 54, ease: "power1.inOut" }, "s4");
    // Move 5
    tl.to(camera.position, { x: 0.02, y: 29.44, z: 26.20, ease: "power1.inOut" }, "s5")
      .to(cameraTarget,    { x: -0.06, y: 28.21, z: 16.28, ease: "power1.inOut" }, "s5")
      .to(camera,          { fov: 30, ease: "power1.inOut" }, "s5");
    // Move 6
    tl.to(camera.position, { x: 0.50, y: 38.58, z: 100.49, ease: "power1.inOut" }, "s6")
      .to(cameraTarget,    { x: 0.47, y: 36.34, z: 81.57, ease: "power1.inOut" }, "s6")
      .to(camera,          { fov: 30, ease: "power1.inOut" }, "s6");
}

function animate() {
    requestAnimationFrame(animate);
    camera.lookAt(cameraTarget); 
    camera.updateProjectionMatrix(); 
    renderer.render(scene, camera);
}

// Reload on Resize logic
let resizeTimeout;
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const newIsMobile = window.innerWidth < 768;
        if (newIsMobile !== isMobile) window.location.reload();
    }, 500);
});

animate();