document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('carousel-container');
  const rotatingContainer = document.getElementById('rotating-container');
  const orbitContainer = document.getElementById('orbit-container');
  
  const textStep1 = document.getElementById('text-step-1');
  const textStep2 = document.getElementById('text-step-2');
  const textStep3 = document.getElementById('text-step-3');
  const circles = document.querySelectorAll('.circle-with-elements');

  // Inizializzazione rotazioni base
  circles.forEach((circle) => {
    const initialRotation = parseFloat(circle.getAttribute('data-rotation'));
    circle.style.transform = `rotate(${initialRotation}deg)`;
  });

  // --- CONFIGURAZIONE POSIZIONI (Coordinate per immagini da 200px) ---

  // FUORI DAL CERCHIO
  const circlePositions = [
    { x: -140, y: -280, rot: -60,  scale: 1 },  // 1
    { x: 240,  y: -160, rot: 50,   scale: 1 },  // 2
    { x: 20,   y: 320,  rot: 10,   scale: 1 },  // 3
    { x: -260, y: -120, rot: -105,  scale: 1 }, // 4 
    { x: 80,   y: -250, rot: 20,   scale: 1 },  // 5
    { x: 220,  y: 220,  rot: -45,  scale: 1 },  // 6
    { x: -320, y: 60,   rot: 90,   scale: 1 },  // 7
    { x: 280,  y: 40,   rot: 30,   scale: 1 },  // 8 
    { x: -180, y: 240,  rot: -130, scale: 1 },  // 9
    { x: -60,  y: 20,   rot: -85,  scale: 1 }   // 10
  ];

  // DENTRO IL CERCHIO
  const chaosPositions = [
    { x: -110, y: -200, rot: -15, scale: 0.75 },  // 1
    { x: 130,  y: -130, rot: 45,  scale: 0.65 },  // 2
    { x: 0,    y: 225,  rot: 10,  scale: 1 },     // 3
    { x: -170, y: -60,  rot: 10, scale: 1 },      // 4
    { x: 30,   y: -170, rot: 5,   scale: 0.8 },   // 5
    { x: 120,  y: 125,  rot: -30, scale: 0.75 },  // 6
    { x: -170, y: 70,   rot: 80,  scale: 0.9 },   // 7
    { x: 200,  y: 10,   rot: 25,  scale: 0.8 },   // 8
    { x: -70,  y: 130,  rot: -120, scale: 0.75 }, // 9
    { x: -15,  y: 15,   rot: -20, scale: 0.9 }    // 10
  ];


  function onScroll() {
    const rect = container.getBoundingClientRect();
    const scrollableDistance = container.offsetHeight - window.innerHeight;
    let progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);

    const PHASE_1_END = 0.3;
    
    let morphProgress = 0; 
    let rotationProgress = 0; 
    
    if (progress < PHASE_1_END) {
      morphProgress = progress / PHASE_1_END; 
      rotationProgress = 0; 
    } else {
      morphProgress = 1; 
      rotationProgress = (progress - PHASE_1_END) / (1 - PHASE_1_END);
    }

    // Easing
    const ease = 1 - Math.pow(1 - morphProgress, 3); 

    // 1. ANIMAZIONE PRODOTTI (Da Cerchio a Caos)
    const targetCircle = document.querySelector('.product-container').parentElement; 
    
    if (targetCircle) {
        const products = targetCircle.querySelectorAll('.product-item');
        
        products.forEach((prod, index) => {
            if (index >= circlePositions.length) return;

            const start = circlePositions[index];
            const end = chaosPositions[index];

            const currentX = start.x + (end.x - start.x) * ease;
            const currentY = start.y + (end.y - start.y) * ease;
            const currentRot = start.rot + (end.rot - start.rot) * ease;
            const currentScale = start.scale + (end.scale - start.scale) * ease;

            // translate(calc(-50% + X), calc(-50% + Y)) mantiene il centro dell'immagine come punto di riferimento
            prod.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) rotate(${currentRot}deg) scale(${currentScale})`;
            prod.style.opacity = 1; 
        });
    }

    // 2. ROTAZIONE ORBITA
    const totalRotationAngle = -240;
    const currentRotation = totalRotationAngle * rotationProgress;
    
    rotatingContainer.style.transform = `translateX(-50%) rotate(${currentRotation}deg)`;
    if (orbitContainer) {
        orbitContainer.style.transform = `translateX(-50%) rotate(${currentRotation}deg)`;
    }

    // 3. CONTRO-ROTAZIONE
    circles.forEach((circle) => {
        const initialRotation = parseFloat(circle.getAttribute('data-rotation'));
        const currentGlobalRotation = initialRotation + currentRotation;
        
        const largeCircle = circle.querySelector('.large-circle .white-circle');
        if (largeCircle) {
            largeCircle.style.transform = `rotate(${-currentGlobalRotation}deg)`;
        }
    });

    // 4. TESTI
    const r = currentRotation;
    
    // Step 1
    let op1 = 0;
    if (progress < PHASE_1_END) op1 = 1; 
    else op1 = (r > -40) ? 1 - (r / -40) : 0;
    textStep1.style.opacity = op1;
    textStep1.style.pointerEvents = op1 > 0.1 ? 'auto' : 'none';

    // Step 2
    let op2 = 0;
    if (r <= -40 && r > -80) op2 = (r + 40) / -40;
    else if (r <= -80 && r > -120) op2 = 1;
    else if (r <= -120 && r > -160) op2 = 1 - ((r + 120) / -40);
    textStep2.style.opacity = op2;
    
    // Step 3
    let op3 = 0;
    if (r <= -160 && r > -200) op3 = (r + 160) / -40;
    else if (r <= -200) op3 = 1;
    textStep3.style.opacity = op3;
  }

  window.addEventListener('scroll', onScroll);
  onScroll();
});
