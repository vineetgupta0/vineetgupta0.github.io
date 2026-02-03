// =====================================================
// VINEET KUMAR GUPTA - 3D RESUME GAME v2.0
// Interactive Three.js Experience - Enhanced
// =====================================================

// Global variables
let scene, camera, renderer;
let character, characterGroup;
let islands = {};
let particles;
let clock;
let mixer;

// Movement state
const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

// Game state
const gameState = {
    currentZone: 'home',
    nearZone: null,
    isPanelOpen: false,
    isLoading: true,
    isIntroShown: false,
    loadProgress: 0
};

// Character properties - smoother movement
const characterProps = {
    speed: 0.4,
    rotationSpeed: 0.06,
    position: new THREE.Vector3(0, 0, 0),
    targetPosition: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    targetRotation: 0,
    velocity: new THREE.Vector3(0, 0, 0)
};

// Camera properties - smoother follow
const cameraProps = {
    distance: 22,
    height: 12,
    smoothing: 0.08
};

// =====================================================
// INITIALIZATION
// =====================================================

function init() {
    // Create clock for animations
    clock = new THREE.Clock();

    // Create scene
    scene = new THREE.Scene();

    // Create gradient background
    createBackground();

    // Create camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, cameraProps.height, cameraProps.distance);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add lights
    createLights();

    // Create environment
    createParticles();
    createIslands();
    createCharacter();
    createIndianFlag();
    createConnectingPaths();
    createIslandLabels();
    createIslandLabels();

    // Setup UI
    initUI();

    // Setup event listeners
    setupEventListeners();

    // Simulate loading
    simulateLoading();

    // Start animation loop
    animate();
}

// Initialize UI elements
function initUI() {
    // Populate quick nav
    const navItems = document.getElementById('nav-items');
    if (navItems) {
        Object.keys(zoneConfigs).forEach(zoneKey => {
            const config = zoneConfigs[zoneKey];
            const item = document.createElement('div');
            item.className = 'nav-item' + (zoneKey === 'home' ? ' active' : '');
            item.dataset.zone = zoneKey;
            item.innerHTML = `
                <span class="nav-item-icon">${config.icon}</span>
                <span class="nav-item-text">${config.name}</span>
            `;
            item.addEventListener('click', () => teleportToZone(zoneKey));
            navItems.appendChild(item);
        });
    }

    // Setup intro modal
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('intro-modal').classList.add('hidden');
            gameState.isIntroShown = true;
        });
    }

    // Setup zone card button
    const zoneCardBtn = document.getElementById('zone-card-btn');
    if (zoneCardBtn) {
        zoneCardBtn.addEventListener('click', () => {
            if (gameState.nearZone || gameState.currentZone) {
                openPanel(gameState.nearZone || gameState.currentZone);
            }
        });
    }

    // Initial zone card update
    updateZoneCard('home');
}

// Teleport to zone
function teleportToZone(zoneKey) {
    const config = zoneConfigs[zoneKey];
    if (config && character) {
        // Update characterProps
        characterProps.position.x = config.position.x;
        characterProps.position.z = config.position.z + 15;
        characterProps.rotation = 0;

        // Also update the actual character mesh position
        character.position.x = characterProps.position.x;
        character.position.z = characterProps.position.z;
        character.rotation.y = 0;

        // Instantly move camera to new position
        camera.position.x = characterProps.position.x;
        camera.position.z = characterProps.position.z + cameraProps.distance;
        camera.position.y = cameraProps.height;
        camera.lookAt(characterProps.position.x, 3, characterProps.position.z);

        gameState.currentZone = zoneKey;
        updateZoneCard(zoneKey);
        updateNavHighlight(zoneKey);

        console.log('Teleported to:', zoneKey, 'at position:', characterProps.position.x, characterProps.position.z);
    }
}

// Update zone card preview
function updateZoneCard(zoneKey) {
    const config = zoneConfigs[zoneKey];
    if (!config) return;

    const icon = document.getElementById('zone-card-icon');
    const title = document.getElementById('zone-card-title');
    const subtitle = document.getElementById('zone-card-subtitle');
    const preview = document.getElementById('zone-card-preview');

    if (icon) icon.textContent = config.icon;
    if (title) title.textContent = config.name;
    if (subtitle) subtitle.textContent = config.description || '';
    if (preview) preview.innerHTML = getZonePreview(zoneKey);
}

// Get zone preview content
function getZonePreview(zoneKey) {
    switch (zoneKey) {
        case 'home':
            return `<strong>Gen-AI Engineer @ Goldman Sachs</strong><br>Building AI platforms for 50K+ users`;
        case 'experience':
            return `<strong>Goldman Sachs</strong> → Barraiser → Squadstack<br>2+ years of engineering excellence`;
        case 'education':
            return `<strong>VIT Bhopal</strong><br>B.Tech CSE • CGPA: 9.12`;
        case 'skills':
            return `<strong>AI/ML:</strong> LangChain, LLMs, RAG<br><strong>Cloud:</strong> AWS, Terraform, K8s`;
        case 'projects':
            return `<strong>Squad-Gunicorn</strong><br>Open source on PyPI`;
        case 'achievements':
            return `🥇 Hackathon Winner<br>☁️ Azure Certified`;
        case 'contact':
            return `📧 vk779756@gmail.com<br>📍 Bangalore, India`;
        default:
            return '';
    }
}

// Update nav highlight
function updateNavHighlight(zoneKey) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.zone === zoneKey);
    });
}

// =====================================================
// BACKGROUND & ENVIRONMENT
// =====================================================

function createBackground() {
    // Create deep space background
    const skyGeometry = new THREE.SphereGeometry(500, 64, 64);
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x000005) },
            bottomColor: { value: new THREE.Color(0x0a0015) },
            offset: { value: 20 },
            exponent: { value: 0.4 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Add stars
    createStars();

    // Add Earth in the distance
    createEarth();

    // Add subtle fog for moon surface feel
    scene.fog = new THREE.FogExp2(0x0a0a15, 0.004);
}

// Create starfield
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        const radius = 300 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi);
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        sizes[i] = Math.random() * 2 + 0.5;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Create Earth in the sky
function createEarth() {
    const earthGroup = new THREE.Group();

    // Earth sphere
    const earthGeometry = new THREE.SphereGeometry(40, 32, 32);
    const earthMaterial = new THREE.MeshStandardMaterial({
        color: 0x2233ff,
        emissive: 0x112244,
        emissiveIntensity: 0.3,
        metalness: 0.1,
        roughness: 0.8
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // Continents (simplified as green patches)
    const continentGeometry = new THREE.SphereGeometry(40.5, 32, 32);
    const continentMaterial = new THREE.MeshStandardMaterial({
        color: 0x22aa44,
        transparent: true,
        opacity: 0.6
    });
    const continents = new THREE.Mesh(continentGeometry, continentMaterial);
    earthGroup.add(continents);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(42, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphere);

    // Position Earth in the sky
    earthGroup.position.set(-150, 120, -200);
    earthGroup.userData.isEarth = true;
    scene.add(earthGroup);
}

function createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(50, 100, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.camera.left = -100;
    mainLight.shadow.camera.right = 100;
    mainLight.shadow.camera.top = 100;
    mainLight.shadow.camera.bottom = -100;
    scene.add(mainLight);

    // Colored point lights for ambiance
    const pinkLight = new THREE.PointLight(0xff6b9d, 1, 100);
    pinkLight.position.set(-30, 20, -30);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x4cc9ff, 1, 100);
    cyanLight.position.set(30, 20, 30);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xc44cff, 0.8, 80);
    purpleLight.position.set(0, 30, 0);
    scene.add(purpleLight);
}

function createParticles() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorOptions = [
        new THREE.Color(0xff6b9d),
        new THREE.Color(0xc44cff),
        new THREE.Color(0x4cc9ff),
        new THREE.Color(0x00f5d4),
        new THREE.Color(0xfee440)
    ];

    for (let i = 0; i < particleCount; i++) {
        // Random position in a large sphere
        const radius = Math.random() * 200 + 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = (Math.random() - 0.3) * 100;
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // Random color from options
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Random size
        sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

// =====================================================
// ISLANDS CREATION
// =====================================================

function createIslands() {
    Object.keys(zoneConfigs).forEach(zoneKey => {
        const config = zoneConfigs[zoneKey];
        const island = createIsland(config, zoneKey);
        islands[zoneKey] = island;
        scene.add(island);
    });
}

function createIsland(config, zoneKey) {
    const group = new THREE.Group();
    group.userData = { zoneKey, config };

    // Main platform - Lunar surface style (gray/silver)
    const platformGeometry = new THREE.CylinderGeometry(12, 14, 3, 12);
    const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3a, // Dark gray lunar surface
        metalness: 0.4,
        roughness: 0.8,
        emissive: 0x111122,
        emissiveIntensity: 0.1
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.castShadow = true;
    platform.receiveShadow = true;
    group.add(platform);

    // Top surface - Lighter lunar dust
    const topGeometry = new THREE.CylinderGeometry(11, 12, 0.5, 12);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a4a, // Lighter gray
        metalness: 0.3,
        roughness: 0.9
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 1.5;
    top.receiveShadow = true;
    group.add(top);

    // Glowing ring - Space station style
    const ringGeometry = new THREE.TorusGeometry(13, 0.4, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: config.secondaryColor,
        transparent: true,
        opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.8;
    group.add(ring);

    // Create zone-specific decorations
    createZoneDecorations(group, zoneKey, config);

    // Floating crystals
    createFloatingCrystals(group, config);

    // Point light for glow effect
    const pointLight = new THREE.PointLight(config.secondaryColor, 0.8, 30);
    pointLight.position.y = 5;
    group.add(pointLight);

    // Position the island
    group.position.set(config.position.x, 0, config.position.z);

    // Add floating animation data
    group.userData.floatOffset = Math.random() * Math.PI * 2;
    group.userData.originalY = 0;

    return group;
}

function createZoneDecorations(group, zoneKey, config) {
    switch (zoneKey) {
        case 'home':
            // Central holographic pedestal
            createHologramPedestal(group);
            break;
        case 'education':
            // Books and graduation cap
            createEducationProps(group);
            break;
        case 'experience':
            // Office/tech elements
            createExperienceProps(group);
            break;
        case 'projects':
            // Workshop/lab elements
            createProjectsProps(group);
            break;
        case 'skills':
            // Tech pillars
            createSkillsProps(group);
            break;
        case 'achievements':
            // Trophy and medals
            createAchievementsProps(group);
            break;
        case 'contact':
            // Portal effect
            createContactProps(group);
            break;
    }
}

function createHologramPedestal(group) {
    // Central pillar
    const pillarGeometry = new THREE.CylinderGeometry(1.5, 2, 4, 6);
    const pillarMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a4a,
        metalness: 0.8,
        roughness: 0.2
    });
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.y = 4;
    group.add(pillar);

    // Hologram effect - rotating rings
    for (let i = 0; i < 3; i++) {
        const holoRingGeometry = new THREE.TorusGeometry(2.5 + i * 0.8, 0.1, 8, 50);
        const holoRingMaterial = new THREE.MeshBasicMaterial({
            color: 0x4cc9ff,
            transparent: true,
            opacity: 0.6 - i * 0.15
        });
        const holoRing = new THREE.Mesh(holoRingGeometry, holoRingMaterial);
        holoRing.position.y = 7 + i * 0.5;
        holoRing.rotation.x = Math.PI / 2 + (i * 0.3);
        holoRing.userData.rotationSpeed = 0.02 - i * 0.005;
        holoRing.userData.isHoloRing = true;
        group.add(holoRing);
    }

    // Name text placeholder (simple geometry)
    const nameGeometry = new THREE.BoxGeometry(6, 1, 0.2);
    const nameMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b9d,
        transparent: true,
        opacity: 0.8
    });
    const name = new THREE.Mesh(nameGeometry, nameMaterial);
    name.position.y = 9;
    name.userData.isFloating = true;
    group.add(name);
}

function createEducationProps(group) {
    // Stack of books
    const bookColors = [0xff6b9d, 0x4cc9ff, 0xc44cff, 0x00f5d4];
    for (let i = 0; i < 4; i++) {
        const bookGeometry = new THREE.BoxGeometry(3, 0.6, 2);
        const bookMaterial = new THREE.MeshStandardMaterial({
            color: bookColors[i],
            metalness: 0.2,
            roughness: 0.8
        });
        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        book.position.set(-3, 2.5 + i * 0.7, 0);
        book.rotation.y = (i * 0.2) - 0.2;
        group.add(book);
    }

    // Graduation cap
    const capBaseGeometry = new THREE.BoxGeometry(3, 0.3, 3);
    const capMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.5,
        roughness: 0.3
    });
    const capBase = new THREE.Mesh(capBaseGeometry, capMaterial);
    capBase.position.set(3, 6, 0);
    capBase.rotation.y = Math.PI / 4;
    group.add(capBase);

    const capTopGeometry = new THREE.ConeGeometry(0.5, 1, 4);
    const capTop = new THREE.Mesh(capTopGeometry, capMaterial);
    capTop.position.set(3, 6.5, 0);
    group.add(capTop);
}

function createExperienceProps(group) {
    // Server rack
    const rackGeometry = new THREE.BoxGeometry(2, 5, 1.5);
    const rackMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a4a,
        metalness: 0.7,
        roughness: 0.3
    });
    const rack = new THREE.Mesh(rackGeometry, rackMaterial);
    rack.position.set(0, 4.5, 0);
    group.add(rack);

    // Blinking lights on rack
    for (let i = 0; i < 5; i++) {
        const lightGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.1);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x00f5d4 : 0xff6b9d
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(0, 2.5 + i * 0.8, 0.8);
        light.userData.isBlinking = true;
        light.userData.blinkOffset = i * 0.5;
        group.add(light);
    }

    // Cloud symbol
    const cloudGroup = new THREE.Group();
    const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0x4cc9ff,
        transparent: true,
        opacity: 0.7
    });

    const cloudParts = [
        { pos: [0, 0, 0], scale: 1 },
        { pos: [-1, 0, 0], scale: 0.7 },
        { pos: [1, 0, 0], scale: 0.8 },
        { pos: [0.5, 0.3, 0], scale: 0.6 }
    ];

    cloudParts.forEach(part => {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.8 * part.scale, 16, 16),
            cloudMaterial
        );
        sphere.position.set(...part.pos);
        cloudGroup.add(sphere);
    });

    cloudGroup.position.set(-4, 5, 2);
    cloudGroup.userData.isFloating = true;
    group.add(cloudGroup);
}

function createProjectsProps(group) {
    // Gears
    for (let i = 0; i < 2; i++) {
        const gearGeometry = new THREE.TorusGeometry(1.5 - i * 0.5, 0.3, 8, 12);
        const gearMaterial = new THREE.MeshStandardMaterial({
            color: i === 0 ? 0xff9e00 : 0xfee440,
            metalness: 0.8,
            roughness: 0.2
        });
        const gear = new THREE.Mesh(gearGeometry, gearMaterial);
        gear.position.set(-3 + i * 2.5, 4 + i, 0);
        gear.rotation.x = Math.PI / 2;
        gear.userData.isRotating = true;
        gear.userData.rotationSpeed = (i === 0 ? 1 : -1) * 0.02;
        group.add(gear);
    }

    // Code brackets
    const bracketGeometry = new THREE.BoxGeometry(0.5, 3, 0.3);
    const bracketMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f5d4
    });

    const leftBracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
    leftBracket.position.set(2, 4, 0);
    group.add(leftBracket);

    const rightBracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
    rightBracket.position.set(5, 4, 0);
    group.add(rightBracket);

    // Code lines
    for (let i = 0; i < 3; i++) {
        const lineGeometry = new THREE.BoxGeometry(2 - i * 0.3, 0.2, 0.1);
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: 0xc44cff,
            transparent: true,
            opacity: 0.8 - i * 0.2
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(3.5, 4.5 - i * 0.6, 0.2);
        group.add(line);
    }
}

function createSkillsProps(group) {
    // Tech pillars
    const skillColors = [0x4cc9ff, 0xff6b9d, 0x00f5d4, 0xc44cff, 0xfee440];
    const pillarPositions = [
        { x: 0, z: 0, height: 5 },
        { x: -3, z: 2, height: 3.5 },
        { x: 3, z: 2, height: 4 },
        { x: -2, z: -3, height: 3 },
        { x: 2, z: -3, height: 4.5 }
    ];

    pillarPositions.forEach((pos, i) => {
        const pillarGeometry = new THREE.BoxGeometry(1.5, pos.height, 1.5);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: skillColors[i],
            metalness: 0.4,
            roughness: 0.6,
            emissive: skillColors[i],
            emissiveIntensity: 0.2
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(pos.x, 2 + pos.height / 2, pos.z);
        pillar.userData.originalHeight = pos.height;
        pillar.userData.isPulsing = true;
        pillar.userData.pulseOffset = i * 0.5;
        group.add(pillar);
    });
}

function createAchievementsProps(group) {
    // Trophy
    const trophyCupGeometry = new THREE.CylinderGeometry(1, 0.5, 2, 8);
    const trophyMaterial = new THREE.MeshStandardMaterial({
        color: 0xfee440,
        metalness: 0.9,
        roughness: 0.1
    });
    const trophyCup = new THREE.Mesh(trophyCupGeometry, trophyMaterial);
    trophyCup.position.set(0, 5, 0);
    group.add(trophyCup);

    const trophyBaseGeometry = new THREE.CylinderGeometry(0.8, 1, 1, 8);
    const trophyBase = new THREE.Mesh(trophyBaseGeometry, trophyMaterial);
    trophyBase.position.set(0, 3.5, 0);
    group.add(trophyBase);

    // Medals
    const medalColors = [0xfee440, 0xc0c0c0, 0xcd7f32];
    for (let i = 0; i < 3; i++) {
        const medalGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 16);
        const medalMaterial = new THREE.MeshStandardMaterial({
            color: medalColors[i],
            metalness: 0.9,
            roughness: 0.1
        });
        const medal = new THREE.Mesh(medalGeometry, medalMaterial);
        medal.position.set(-3 + i * 3, 4, 4);
        medal.rotation.x = Math.PI / 2;
        medal.userData.isFloating = true;
        medal.userData.floatOffset = i * 1;
        group.add(medal);
    }

    // Stars
    for (let i = 0; i < 5; i++) {
        const starGeometry = new THREE.OctahedronGeometry(0.4, 0);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: 0xfee440
        });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        const angle = (i / 5) * Math.PI * 2;
        star.position.set(
            Math.cos(angle) * 5,
            6 + Math.sin(i) * 0.5,
            Math.sin(angle) * 5
        );
        star.userData.isRotating = true;
        star.userData.rotationSpeed = 0.03;
        group.add(star);
    }
}

function createContactProps(group) {
    // Portal ring
    const portalGeometry = new THREE.TorusGeometry(4, 0.5, 16, 100);
    const portalMaterial = new THREE.MeshBasicMaterial({
        color: 0x4cc9ff,
        transparent: true,
        opacity: 0.8
    });
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.position.y = 6;
    portal.userData.isRotating = true;
    portal.userData.rotationSpeed = 0.01;
    group.add(portal);

    // Inner portal glow
    const innerPortalGeometry = new THREE.CircleGeometry(3.5, 32);
    const innerPortalMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b9d,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const innerPortal = new THREE.Mesh(innerPortalGeometry, innerPortalMaterial);
    innerPortal.position.y = 6;
    innerPortal.userData.isPulsing = true;
    group.add(innerPortal);

    // Floating envelope
    const envelopeGeometry = new THREE.BoxGeometry(2, 1.2, 0.3);
    const envelopeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.8
    });
    const envelope = new THREE.Mesh(envelopeGeometry, envelopeMaterial);
    envelope.position.set(0, 6, 0);
    envelope.userData.isFloating = true;
    group.add(envelope);
}

function createFloatingCrystals(group, config) {
    const crystalCount = 4;
    for (let i = 0; i < crystalCount; i++) {
        const crystalGeometry = new THREE.OctahedronGeometry(0.5, 0);
        const crystalMaterial = new THREE.MeshStandardMaterial({
            color: config.secondaryColor,
            metalness: 0.8,
            roughness: 0.2,
            emissive: config.secondaryColor,
            emissiveIntensity: 0.3
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);

        const angle = (i / crystalCount) * Math.PI * 2;
        crystal.position.set(
            Math.cos(angle) * 8,
            4 + Math.random() * 2,
            Math.sin(angle) * 8
        );

        crystal.userData.isFloating = true;
        crystal.userData.floatOffset = i * 1.5;
        crystal.userData.isRotating = true;
        crystal.userData.rotationSpeed = 0.02;

        group.add(crystal);
    }
}

function createConnectingPaths() {
    // Create glowing paths between islands
    const connections = [
        ['home', 'education'],
        ['home', 'experience'],
        ['home', 'projects'],
        ['home', 'skills'],
        ['home', 'achievements'],
        ['home', 'contact']
    ];

    connections.forEach(([from, to]) => {
        const fromPos = zoneConfigs[from].position;
        const toPos = zoneConfigs[to].position;

        // Create path particles
        const pathGroup = new THREE.Group();
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const t = i / particleCount;
            const particleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x4cc9ff,
                transparent: true,
                opacity: 0.4
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            particle.position.set(
                fromPos.x + (toPos.x - fromPos.x) * t,
                1 + Math.sin(t * Math.PI) * 2,
                fromPos.z + (toPos.z - fromPos.z) * t
            );

            particle.userData.pathT = t;
            particle.userData.isPathParticle = true;

            pathGroup.add(particle);
        }

        scene.add(pathGroup);
    });
}

// =====================================================
// CHARACTER
// =====================================================

function createCharacter() {
    characterGroup = new THREE.Group();

    // Astronaut Suit Material (white)
    const suitMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        metalness: 0.2,
        roughness: 0.6,
        emissive: 0xffffff,
        emissiveIntensity: 0.1
    });

    // Body (astronaut suit torso)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.4, 16);
    const body = new THREE.Mesh(bodyGeometry, suitMaterial);
    body.position.y = 0.7;
    body.castShadow = true;
    characterGroup.add(body);

    // Helmet (sphere with golden visor)
    const helmetGeometry = new THREE.SphereGeometry(0.55, 24, 24);
    const helmetMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.5
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 1.8;
    helmet.castShadow = true;
    characterGroup.add(helmet);

    // Visor (golden reflective)
    const visorGeometry = new THREE.SphereGeometry(0.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const visorMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xffaa00,
        emissiveIntensity: 0.2
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.y = 1.75;
    visor.position.z = 0.15;
    visor.rotation.x = Math.PI / 2;
    characterGroup.add(visor);

    // Oxygen tank (back)
    const tankGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 12);
    const tankMaterial = new THREE.MeshStandardMaterial({
        color: 0xff9933, // Orange (India flag)
        metalness: 0.5,
        roughness: 0.4
    });
    const tank = new THREE.Mesh(tankGeometry, tankMaterial);
    tank.position.set(0, 0.8, -0.45);
    characterGroup.add(tank);

    // Indian flag stripe on suit (saffron, white, green)
    const stripeHeight = 0.08;

    // Saffron stripe
    const saffronGeometry = new THREE.BoxGeometry(0.52, stripeHeight, 0.1);
    const saffronMaterial = new THREE.MeshBasicMaterial({ color: 0xff9933 });
    const saffronStripe = new THREE.Mesh(saffronGeometry, saffronMaterial);
    saffronStripe.position.set(0, 1.0, 0.55);
    characterGroup.add(saffronStripe);

    // White stripe
    const whiteGeometry = new THREE.BoxGeometry(0.52, stripeHeight, 0.1);
    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const whiteStripe = new THREE.Mesh(whiteGeometry, whiteMaterial);
    whiteStripe.position.set(0, 0.9, 0.55);
    characterGroup.add(whiteStripe);

    // Green stripe
    const greenGeometry = new THREE.BoxGeometry(0.52, stripeHeight, 0.1);
    const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x138808 });
    const greenStripe = new THREE.Mesh(greenGeometry, greenMaterial);
    greenStripe.position.set(0, 0.8, 0.55);
    characterGroup.add(greenStripe);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.9, 8);
    const leftArm = new THREE.Mesh(armGeometry, suitMaterial);
    leftArm.position.set(-0.6, 0.7, 0);
    leftArm.rotation.z = Math.PI / 6;
    characterGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, suitMaterial);
    rightArm.position.set(0.6, 0.7, 0);
    rightArm.rotation.z = -Math.PI / 6;
    characterGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.8, 8);
    const leftLeg = new THREE.Mesh(legGeometry, suitMaterial);
    leftLeg.position.set(-0.25, -0.1, 0);
    characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, suitMaterial);
    rightLeg.position.set(0.25, -0.1, 0);
    characterGroup.add(rightLeg);

    // Glow ring (astronaut jetpack effect)
    const glowRingGeometry = new THREE.TorusGeometry(0.9, 0.06, 8, 32);
    const glowRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.7
    });
    const glowRing = new THREE.Mesh(glowRingGeometry, glowRingMaterial);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = -0.3;
    characterGroup.add(glowRing);

    // Point light attached to astronaut
    const characterLight = new THREE.PointLight(0x00d4ff, 1.5, 20);
    characterLight.position.y = 1;
    characterGroup.add(characterLight);

    // Set initial position
    characterGroup.position.set(0, 2.5, 8);
    scene.add(characterGroup);

    character = characterGroup;
    characterProps.position.x = 0;
    characterProps.position.z = 8;

    console.log('Astronaut created!');
}

// Create Indian flag on the moon
function createIndianFlag() {
    const flagGroup = new THREE.Group();

    // Flag pole
    const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 5, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.8,
        roughness: 0.3
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 2.5;
    flagGroup.add(pole);

    // Flag fabric group
    const fabricGroup = new THREE.Group();

    // Saffron band
    const saffronGeometry = new THREE.BoxGeometry(2.5, 0.5, 0.05);
    const saffronMaterial = new THREE.MeshStandardMaterial({ color: 0xff9933 });
    const saffron = new THREE.Mesh(saffronGeometry, saffronMaterial);
    saffron.position.set(1.25, 0.25, 0);
    fabricGroup.add(saffron);

    // White band
    const whiteGeometry = new THREE.BoxGeometry(2.5, 0.5, 0.05);
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const white = new THREE.Mesh(whiteGeometry, whiteMaterial);
    white.position.set(1.25, -0.25, 0);
    fabricGroup.add(white);

    // Green band
    const greenGeometry = new THREE.BoxGeometry(2.5, 0.5, 0.05);
    const greenMaterial = new THREE.MeshStandardMaterial({ color: 0x138808 });
    const green = new THREE.Mesh(greenGeometry, greenMaterial);
    green.position.set(1.25, -0.75, 0);
    fabricGroup.add(green);

    // Ashoka Chakra (simplified as blue circle)
    const chakraGeometry = new THREE.TorusGeometry(0.2, 0.03, 8, 24);
    const chakraMaterial = new THREE.MeshBasicMaterial({ color: 0x000080 });
    const chakra = new THREE.Mesh(chakraGeometry, chakraMaterial);
    chakra.position.set(1.25, -0.25, 0.03);
    fabricGroup.add(chakra);

    fabricGroup.position.y = 4.5;
    flagGroup.add(fabricGroup);

    // Position flag near home island
    flagGroup.position.set(5, 2, -5);
    scene.add(flagGroup);
}

// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {
    // Simple direct keyboard controls
    window.onkeydown = function (e) {
        console.log('KEY DOWN:', e.key);

        // Skip if panel is open
        if (gameState.isPanelOpen) return;

        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                movement.forward = true;
                e.preventDefault();
                break;
            case 's':
            case 'arrowdown':
                movement.backward = true;
                e.preventDefault();
                break;
            case 'a':
            case 'arrowleft':
                movement.left = true;
                e.preventDefault();
                break;
            case 'd':
            case 'arrowright':
                movement.right = true;
                e.preventDefault();
                break;
            case ' ':
                if (gameState.nearZone) {
                    openPanel(gameState.nearZone);
                }
                e.preventDefault();
                break;
            case 'escape':
                if (gameState.isPanelOpen) {
                    closePanel();
                }
                break;
        }
    };

    window.onkeyup = function (e) {
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                movement.forward = false;
                break;
            case 's':
            case 'arrowdown':
                movement.backward = false;
                break;
            case 'a':
            case 'arrowleft':
                movement.left = false;
                break;
            case 'd':
            case 'arrowright':
                movement.right = false;
                break;
        }
    };

    // Window resize
    window.addEventListener('resize', handleResize);

    // Panel close button
    document.getElementById('close-panel').addEventListener('click', closePanel);

    // Mobile joystick
    setupMobileControls();

    console.log('Keyboard controls ready! Press W to move forward.');
}

function handleKeyDown(event) {
    // Not used anymore - using window.onkeydown instead
}

function handleKeyUp(event) {
    // Not used anymore - using window.onkeyup instead
}

function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function setupMobileControls() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickStick = document.getElementById('joystick-stick');
    const interactBtn = document.getElementById('mobile-interact-btn');

    let isDragging = false;
    let startX, startY;

    joystickBase.addEventListener('touchstart', (e) => {
        isDragging = true;
        const touch = e.touches[0];
        const rect = joystickBase.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        const maxDistance = 35;
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxDistance);
        const angle = Math.atan2(deltaY, deltaX);

        const stickX = Math.cos(angle) * distance;
        const stickY = Math.sin(angle) * distance;

        joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;

        // Update movement
        const threshold = 10;
        movement.forward = deltaY < -threshold;
        movement.backward = deltaY > threshold;
        movement.left = deltaX < -threshold;
        movement.right = deltaX > threshold;
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
        joystickStick.style.transform = 'translate(0, 0)';
        movement.forward = false;
        movement.backward = false;
        movement.left = false;
        movement.right = false;
    });

    interactBtn.addEventListener('click', () => {
        if (gameState.nearZone) {
            openPanel(gameState.nearZone);
        }
    });
}

// =====================================================
// PANEL SYSTEM
// =====================================================

function openPanel(zoneKey) {
    const panel = document.getElementById('section-panel');
    const content = document.getElementById('panel-content');

    content.innerHTML = generatePanelContent(zoneKey);
    panel.classList.remove('hidden');
    gameState.isPanelOpen = true;

    // Reset movement
    movement.forward = false;
    movement.backward = false;
    movement.left = false;
    movement.right = false;
}

function closePanel() {
    const panel = document.getElementById('section-panel');
    panel.classList.add('hidden');
    gameState.isPanelOpen = false;
}

function generatePanelContent(zoneKey) {
    const config = zoneConfigs[zoneKey];

    switch (zoneKey) {
        case 'home':
            return generateHomeContent();
        case 'education':
            return generateEducationContent();
        case 'experience':
            return generateExperienceContent();
        case 'projects':
            return generateProjectsContent();
        case 'skills':
            return generateSkillsContent();
        case 'achievements':
            return generateAchievementsContent();
        case 'contact':
            return generateContactContent();
        default:
            return '<p>Content not found</p>';
    }
}

function generateHomeContent() {
    const profile = resumeData.profile;
    const stats = resumeData.stats;
    return `
        <div class="panel-header">
            <div class="panel-icon">👋</div>
            <h2 class="panel-title">Welcome!</h2>
        </div>
        <div class="panel-section">
            <p style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">${profile.name}</p>
            <p style="color: var(--goldman-blue); margin-bottom: 1rem; font-weight: 500;">${profile.title}</p>
            <p style="color: var(--text-secondary); line-height: 1.8;">
                ${profile.summary}
                <br><br>
                🎮 <strong>Navigate around</strong> using WASD or Arrow keys, or use the <strong>Quick Travel</strong> menu on the left!
                <br><br>
                📍 Currently based in <strong>${profile.location}</strong>
            </p>
        </div>
        <div class="panel-section">
            <h3 class="panel-section-title">Quick Stats</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">
                <div style="background: var(--glass-bg); padding: 1rem; border-radius: var(--radius-md);">
                    <div style="font-size: 2rem;">👥</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Users Impacted</div>
                    <div style="font-size: 1.3rem; font-weight: 700; color: var(--goldman-blue);">${stats.usersImpacted}</div>
                </div>
                <div style="background: var(--glass-bg); padding: 1rem; border-radius: var(--radius-md);">
                    <div style="font-size: 2rem;">💼</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Years Exp</div>
                    <div style="font-size: 1.3rem; font-weight: 700;">${stats.yearsExp}</div>
                </div>
                <div style="background: var(--glass-bg); padding: 1rem; border-radius: var(--radius-md);">
                    <div style="font-size: 2rem;">💰</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Cost Saved</div>
                    <div style="font-size: 1.3rem; font-weight: 700; color: var(--neon-cyan);">${stats.costSaved}</div>
                </div>
                <div style="background: var(--glass-bg); padding: 1rem; border-radius: var(--radius-md);">
                    <div style="font-size: 2rem;">📦</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Open Source</div>
                    <div style="font-size: 1.3rem; font-weight: 700;">${stats.openSource}</div>
                </div>
            </div>
        </div>
    `;
}

function generateEducationContent() {
    const edu = resumeData.education[0];
    return `
        <div class="panel-header">
            <div class="panel-icon">🎓</div>
            <h2 class="panel-title">Education</h2>
        </div>
        <div class="education-item">
            <div class="item-header">
                <span class="item-title">${edu.institution}</span>
                <span class="item-date">${edu.duration}</span>
            </div>
            <p class="item-subtitle">${edu.degree}</p>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <div style="background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue)); padding: 1rem; border-radius: var(--radius-md); text-align: center; flex: 1;">
                    <div style="font-size: 0.75rem; opacity: 0.8;">CGPA</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">${edu.cgpa}</div>
                </div>
                <div style="background: var(--glass-bg); padding: 1rem; border-radius: var(--radius-md); text-align: center; flex: 1;">
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Location</div>
                    <div style="font-size: 0.9rem; font-weight: 500;">${edu.location}</div>
                </div>
            </div>
        </div>
    `;
}

function generateExperienceContent() {
    let html = `
        <div class="panel-header">
            <div class="panel-icon">💼</div>
            <h2 class="panel-title">Experience</h2>
        </div>
    `;

    resumeData.experience.forEach((exp, index) => {
        const isFeatured = index === 0; // Goldman Sachs is featured
        html += `
            <div class="experience-item${isFeatured ? ' featured' : ''}">
                <div class="item-header">
                    <span class="item-title">
                        ${exp.icon || '🏢'} ${exp.company}
                        ${isFeatured ? '<span class="company-badge">CURRENT</span>' : ''}
                    </span>
                    <span class="item-date">${exp.duration}</span>
                </div>
                <p class="item-subtitle">${exp.role} • ${exp.location}</p>
                <ul class="item-description">
                    ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
            </div>
        `;
    });

    return html;
}

function generateProjectsContent() {
    let html = `
        <div class="panel-header">
            <div class="panel-icon">🛠️</div>
            <h2 class="panel-title">Projects</h2>
        </div>
    `;

    resumeData.projects.forEach(project => {
        html += `
            <div class="project-item">
                <div class="item-header">
                    <span class="item-title">${project.name}</span>
                    <a href="${project.link}" target="_blank" style="color: var(--neon-cyan); text-decoration: none;">🔗 View</a>
                </div>
                <div class="skill-tags" style="margin: 0.5rem 0;">
                    ${project.tech.map(t => `<span class="skill-tag">${t}</span>`).join('')}
                </div>
                <ul class="item-description">
                    ${project.description.map(d => `<li>${d}</li>`).join('')}
                </ul>
            </div>
        `;
    });

    return html;
}

function generateSkillsContent() {
    let html = `
        <div class="panel-header">
            <div class="panel-icon">⚡</div>
            <h2 class="panel-title">Skills</h2>
        </div>
        <div class="skills-grid">
    `;

    Object.entries(resumeData.skills).forEach(([category, skills]) => {
        html += `
            <div class="skill-category">
                <h3 class="skill-category-title">${category}</h3>
                <div class="skill-tags">
                    ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `;
    });

    html += '</div>';

    // Add certifications
    html += `
        <div class="panel-section" style="margin-top: 1.5rem;">
            <h3 class="panel-section-title">Certifications</h3>
            <div class="achievement-list">
                ${resumeData.certifications.map(cert => `
                    <div class="achievement-item">
                        <span class="achievement-icon">${cert.icon}</span>
                        <span class="achievement-text">${cert.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    return html;
}

function generateAchievementsContent() {
    let html = `
        <div class="panel-header">
            <div class="panel-icon">🏆</div>
            <h2 class="panel-title">Achievements</h2>
        </div>
        <div class="achievement-list">
    `;

    resumeData.achievements.forEach(achievement => {
        html += `
            <div class="achievement-item">
                <span class="achievement-icon">${achievement.icon}</span>
                <div>
                    <div style="font-weight: 600;">${achievement.title}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">${achievement.description}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function generateContactContent() {
    const profile = resumeData.profile;
    return `
        <div class="panel-header">
            <div class="panel-icon">📬</div>
            <h2 class="panel-title">Get in Touch</h2>
        </div>
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Let's connect! Feel free to reach out through any of these channels.
        </p>
        <div class="contact-grid">
            <a href="mailto:${profile.email}" class="contact-item">
                <span class="contact-icon">📧</span>
                <div>
                    <div class="contact-label">Email</div>
                    <div class="contact-value">${profile.email}</div>
                </div>
            </a>
            <a href="tel:${profile.phone}" class="contact-item">
                <span class="contact-icon">📱</span>
                <div>
                    <div class="contact-label">Phone</div>
                    <div class="contact-value">${profile.phone}</div>
                </div>
            </a>
            <a href="${profile.social.linkedin}" target="_blank" class="contact-item">
                <span class="contact-icon">💼</span>
                <div>
                    <div class="contact-label">LinkedIn</div>
                    <div class="contact-value">Connect with me</div>
                </div>
            </a>
            <a href="${profile.social.github}" target="_blank" class="contact-item">
                <span class="contact-icon">💻</span>
                <div>
                    <div class="contact-label">GitHub</div>
                    <div class="contact-value">Check my repos</div>
                </div>
            </a>
            <a href="${profile.social.leetcode}" target="_blank" class="contact-item">
                <span class="contact-icon">🧩</span>
                <div>
                    <div class="contact-label">LeetCode</div>
                    <div class="contact-value">Problem solving</div>
                </div>
            </a>
            <div class="contact-item">
                <span class="contact-icon">📍</span>
                <div>
                    <div class="contact-label">Location</div>
                    <div class="contact-value">${profile.location}</div>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// LOADING
// =====================================================

function simulateLoading() {
    const progressBar = document.getElementById('loader-progress');
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                gameState.isLoading = false;
                gameState.isIntroShown = true; // Skip intro for now

                console.log('Loading complete, character:', character);
                console.log('Character position:', character ? character.position : 'no character');
            }, 500);
        }
        progressBar.style.width = progress + '%';
    }, 200);
}

// =====================================================
// ANIMATION LOOP
// =====================================================

function animate() {
    requestAnimationFrame(animate);

    // Don't run game logic until everything is loaded
    if (!scene || !camera || !renderer) return;

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Update character and game logic
    if (character) {
        updateCharacter(delta, time);
        updateCamera();
        checkZoneProximity();
    }

    updateMiniMap();

    // Animate particles
    if (particles) {
        particles.rotation.y += 0.0002;
    }

    // Animate islands
    animateIslands(time);

    // Update floating labels
    updateIslandLabels();

    // Render scene
    renderer.render(scene, camera);
}

// Create and manage floating labels
const islandLabels = {};

function createIslandLabels() {
    const container = document.getElementById('floating-labels');
    if (!container) return;

    container.innerHTML = ''; // Clear existing

    Object.keys(zoneConfigs).forEach(zoneKey => {
        const config = zoneConfigs[zoneKey];
        const label = document.createElement('div');
        label.className = 'island-label';
        label.innerHTML = `<span>${config.icon}</span> ${config.name}`;

        // Add click listener to teleport
        label.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from passing through
            teleportToZone(zoneKey);
        });

        container.appendChild(label);
        islandLabels[zoneKey] = label;
    });
}

function updateIslandLabels() {
    Object.keys(islandLabels).forEach(zoneKey => {
        const label = islandLabels[zoneKey];
        const config = zoneConfigs[zoneKey];

        // Get island position (target slightly above the island)
        const position = new THREE.Vector3(config.position.x, 6, config.position.z);

        // Project to screen coordinates
        position.project(camera);

        // Check if visible (in front of camera)
        if (position.z < 1) {
            const x = (position.x * .5 + .5) * window.innerWidth;
            const y = (-(position.y * .5) + .5) * window.innerHeight;

            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
            label.classList.remove('hidden');
        } else {
            label.classList.add('hidden');
        }
    });
}

function updateCharacter(delta, time) {
    if (!character) return;

    // Check movement state
    const isMoving = movement.forward || movement.backward || movement.left || movement.right;

    // Simple directional movement (no rotation)
    const moveSpeed = characterProps.speed;

    // W = move up (negative Z in Three.js)
    if (movement.forward) {
        characterProps.position.z -= moveSpeed;
    }
    // S = move down (positive Z)
    if (movement.backward) {
        characterProps.position.z += moveSpeed;
    }
    // A = move left (negative X)
    if (movement.left) {
        characterProps.position.x -= moveSpeed;
    }
    // D = move right (positive X)
    if (movement.right) {
        characterProps.position.x += moveSpeed;
    }

    // Keep character within bounds
    const bounds = 70;
    characterProps.position.x = Math.max(-bounds, Math.min(bounds, characterProps.position.x));
    characterProps.position.z = Math.max(-bounds, Math.min(bounds, characterProps.position.z));

    // Apply to character
    character.position.x = characterProps.position.x;
    character.position.z = characterProps.position.z;

    // Floating animation (astronaut in space)
    if (isMoving) {
        character.position.y = 2.5 + Math.sin(time * 8) * 0.2;
    } else {
        character.position.y = 2.5 + Math.sin(time * 2) * 0.1;
    }

    // Update glow ring
    const glowRing = character.children.find(c => c.geometry && c.geometry.type === 'TorusGeometry');
    if (glowRing) {
        glowRing.rotation.z = time * 2;
        glowRing.material.opacity = isMoving ? 0.8 : 0.5;
    }
}

function updateCamera() {
    const targetX = characterProps.position.x;
    const targetZ = characterProps.position.z + cameraProps.distance;
    const targetY = cameraProps.height;

    camera.position.x += (targetX - camera.position.x) * cameraProps.smoothing;
    camera.position.z += (targetZ - camera.position.z) * cameraProps.smoothing;
    camera.position.y += (targetY - camera.position.y) * cameraProps.smoothing;

    camera.lookAt(
        characterProps.position.x,
        3,
        characterProps.position.z
    );
}

function checkZoneProximity() {
    const interactionPrompt = document.getElementById('interaction-prompt');
    const compassLabel = document.getElementById('compass-label');
    const compassArrow = document.getElementById('compass-arrow');

    let nearestZone = null;
    let nearestDistance = Infinity;
    let nearestAngle = 0;

    Object.keys(islands).forEach(zoneKey => {
        const island = islands[zoneKey];
        const config = zoneConfigs[zoneKey];

        const dx = config.position.x - characterProps.position.x;
        const dz = config.position.z - characterProps.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestZone = zoneKey;
            nearestAngle = Math.atan2(dx, dz);
        }

        // Update island state
        const isNear = distance < 18;
        const ring = island.children.find(c => c.geometry && c.geometry.type === 'TorusGeometry' && c.position.y < 3);
        if (ring) {
            ring.material.opacity = isNear ? 1 : 0.8;
            ring.scale.setScalar(isNear ? 1.1 : 1);
        }
    });

    // Update current zone and UI
    if (nearestDistance < 25) {
        if (gameState.currentZone !== nearestZone) {
            gameState.currentZone = nearestZone;
            updateZoneCard(nearestZone);
            updateNavHighlight(nearestZone);
        }
    }

    // Update compass to point at nearest zone if not very close
    if (compassArrow && compassLabel && nearestDistance > 18) {
        const angleDeg = (nearestAngle * 180 / Math.PI) - (characterProps.rotation * 180 / Math.PI);
        compassArrow.style.transform = `rotate(${angleDeg}deg)`;
        const config = zoneConfigs[nearestZone];
        compassLabel.innerHTML = `Nearest: <strong>${config.name}</strong>`;
    } else if (compassLabel) {
        const config = zoneConfigs[nearestZone];
        compassLabel.innerHTML = `At: <strong>${config.name}</strong>`;
    }

    // Update interaction prompt
    if (nearestDistance < 18) {
        gameState.nearZone = nearestZone;
        if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    } else {
        gameState.nearZone = null;
        if (interactionPrompt) interactionPrompt.classList.add('hidden');
    }

    // Update nav items highlighting
    document.querySelectorAll('.nav-item').forEach(el => {
        const zone = el.dataset.zone;
        el.classList.toggle('active', zone === nearestZone && nearestDistance < 25);
    });
}

function updateMiniMap() {
    const mapPlayer = document.getElementById('map-player');
    if (!mapPlayer) return; // Element doesn't exist

    // Convert world position to map position (map is 150x150px)
    const mapSize = 150;
    const worldSize = 140; // -70 to 70

    const mapX = ((characterProps.position.x + 70) / worldSize) * mapSize;
    const mapY = ((characterProps.position.z + 70) / worldSize) * mapSize;

    mapPlayer.style.left = mapX + 'px';
    mapPlayer.style.top = mapY + 'px';
}

function animateIslands(time) {
    Object.values(islands).forEach(island => {
        const offset = island.userData.floatOffset || 0;
        island.position.y = island.userData.originalY + Math.sin(time + offset) * 0.3;

        // Animate decorations
        island.children.forEach(child => {
            if (child.userData.isHoloRing) {
                child.rotation.z += child.userData.rotationSpeed;
            }
            if (child.userData.isFloating) {
                const floatOffset = child.userData.floatOffset || 0;
                child.position.y += Math.sin(time * 2 + floatOffset) * 0.002;
            }
            if (child.userData.isRotating) {
                child.rotation.y += child.userData.rotationSpeed || 0.01;
                child.rotation.z += (child.userData.rotationSpeed || 0.01) * 0.5;
            }
            if (child.userData.isBlinking) {
                const offset = child.userData.blinkOffset || 0;
                child.material.opacity = 0.5 + Math.sin(time * 3 + offset) * 0.5;
            }
            if (child.userData.isPulsing) {
                const offset = child.userData.pulseOffset || 0;
                const scale = 1 + Math.sin(time * 2 + offset) * 0.05;
                child.scale.y = scale;
            }
        });
    });
}

// =====================================================
// START
// =====================================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
