import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// --- CONFIGURATION ---
const container = document.getElementById('canvas-container');

// --- SETTINGS ---
// (You can tweak these numbers here directly)
const params = {
    // Material Settings
    envMapIntensity: 0.93, 
    roughness: 0.2,
    metalness: 1.0,
    clearcoat: 1.0,
    
    // Light Settings
    exposure: 2.5,
    mainLight: 5.0,
    rimLights: 15.0,
    rearLight: 10.0
};

// 1. SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

// 2. CAMERA SETUP
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
// Initial Position (Section 1)
camera.position.set(0.00, 0.14, -0.01); 

// Initial LookAt Target (Section 1)
const cameraTarget = new THREE.Vector3(0.00, 0.09, 0.61); 

// 3. RENDERER SETUP
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = params.exposure; 
container.appendChild(renderer.domElement);

// 4. LIGHTING SETUP
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

// Main Directional Light
const dirLight = new THREE.DirectionalLight(0xffffff, params.mainLight);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// Rim Lights
const rimLight1 = new THREE.SpotLight(0xffffff, params.rimLights);
rimLight1.position.set(-10, 2, -5);
scene.add(rimLight1);

const rimLight2 = new THREE.SpotLight(0xffffff, params.rimLights);
rimLight2.position.set(10, 2, -5);
scene.add(rimLight2);

// Rear Light
const rearLight = new THREE.SpotLight(0xffffff, params.rearLight);
rearLight.position.set(0, 5, -10);
scene.add(rearLight);

// 5. LOAD MODEL
const loader = new GLTFLoader();
const modelPath = './assets/amg-w14-s1-wwwvecarzcom (1)/source/f1_2023_mercedes_amg_w14_e_performance_s1.glb';

let carModel = null;

loader.load(modelPath, (gltf) => {
    carModel = gltf.scene;
    
    const box = new THREE.Box3().setFromObject(carModel);
    const center = box.getCenter(new THREE.Vector3());
    carModel.position.sub(center);

    // Initial Material & Shadow setup
    carModel.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            // Apply Material Settings from 'params'
            if (node.material) {
                // Global Reflection Strength
                node.material.envMapIntensity = params.envMapIntensity;

                // Specific Car Body Parts
                if (node.material.name.toLowerCase().includes('body') || 
                    node.material.name.toLowerCase().includes('paint')) {
                    node.material.roughness = params.roughness;
                    node.material.metalness = params.metalness;
                    node.material.clearcoat = params.clearcoat;
                }
            }
        }
    });

    scene.add(carModel);
    
    // Start animation sequence once model is loaded
    initScrollAnimation();
});

// 6. SCROLL ANIMATION (GSAP SEQUENCE)
function initScrollAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.0, 
        }
    });

    // --- Section Coordinates ---
    // Section 2 Coords
    const sec2Pos = { x: 0.47, y: 2.83, z: 2.58 };
    const sec2Tar = { x: -0.21, y: 0.03, z: 2.14 };
    
    // Section 3 Coords
    const sec3Pos = { x: -1.77, y: 0.08, z: 2.98 };
    const sec3Tar = { x: -1.01, y: 0.04, z: 2.74 };

    // --- Animation Sequence ---
    
    // Transition 1: From Start -> Section 2
    tl.to(camera.position, { 
        x: sec2Pos.x, y: sec2Pos.y, z: sec2Pos.z, ease: "none" 
    }, "step1")
      .to(cameraTarget, { 
        x: sec2Tar.x, y: sec2Tar.y, z: sec2Tar.z, ease: "none" 
    }, "step1");

    // Transition 2: From Section 2 -> Section 3
    tl.to(camera.position, { 
        x: sec3Pos.x, y: sec3Pos.y, z: sec3Pos.z, ease: "none" 
    }, "step2")
      .to(cameraTarget, { 
        x: sec3Tar.x, y: sec3Tar.y, z: sec3Tar.z, ease: "none" 
    }, "step2");
}

// 7. ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);
    // Critical: Update where the camera looks every frame
    camera.lookAt(cameraTarget); 
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();