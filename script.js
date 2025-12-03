document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('carousel-container');
  const rotatingContainer = document.getElementById('rotating-container');
  const orbitContainer = document.getElementById('orbit-container');
  
  // Elementi Video (selezionato dentro lo Step 2 o ovunque sia nell'HTML)
  const videoContainer = document.getElementById('video-container');
  const video = document.getElementById('scroll-video');
  
  const textStep1 = document.getElementById('text-step-1');
  const textStep2 = document.getElementById('text-step-2');
  const textStep3 = document.getElementById('text-step-3');
  const circles = document.querySelectorAll('.circle-with-elements');

  // Setup Video
  let videoDuration = 0;
  if (video) {
      video.addEventListener('loadedmetadata', () => {
        videoDuration = video.duration;
        video.currentTime = 0;
      });
      // Fallback nel caso i metadati siano già caricati
      if (video.readyState >= 1) {
          videoDuration = video.duration;
          video.currentTime = 0;
      }
  }

  // Inizializzazione rotazioni cerchi
  circles.forEach((circle) => {
    const initialRotation = parseFloat(circle.getAttribute('data-rotation'));
    circle.style.transform = `rotate(${initialRotation}deg)`;
  });

  // --- COORDINATE PRODOTTI (Definite UNA sola volta qui) ---
  
  // Posizioni CERCHIO (Iniziali - Wide/Alternate)
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

  // Posizioni CAOS (Finali - Bilanciate)
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

    // --- DEFINIZIONE FASI SCROLL ---
    // FASE 1 (0% - 25%): Step 1 (Prodotti) al centro. Animazione implosione.
    const P1_END = 0.25; 
    
    // TRANSITION (25% - 35%): Rotazione veloce dell'orbita (-120°). Step 1 esce, Step 2 arriva.
    const TRANSITION_END = 0.35;
    
    // FASE 2 (35% - 85%): Step 2 (Video) FERMO al centro. Scrubbing del video.
    const P2_END = 0.85;
    
    // FASE 3 (85% - 100%): Step 2 esce. Rotazione orbita verso Step 3.

    let globalRotation = 0;
    let productMorph = 0;
    let videoSeek = 0;

    if (progress < P1_END) {
        // FASE 1: STEP 1 ATTIVO
        globalRotation = 0; 
        productMorph = progress / P1_END; // Da 0 a 1
        videoSeek = 0;
    } 
    else if (progress < TRANSITION_END) {
        // TRANSIZIONE: RUOTA ORBITA (-120)
        const localProgress = (progress - P1_END) / (TRANSITION_END - P1_END);
        globalRotation = -120 * localProgress;
        
        productMorph = 1; // Prodotti finiti
        videoSeek = 0;
    }
    else if (progress < P2_END) {
        // FASE 2: STEP 2 FERMO (VIDEO)
        globalRotation = -120; // Bloccato su Step 2
        
        productMorph = 1;
        // Mappa lo scroll (lungo) al tempo del video
        videoSeek = (progress - TRANSITION_END) / (P2_END - TRANSITION_END);
    }
    else {
        // FASE 3: USCITA
        const localProgress = (progress - P2_END) / (1 - P2_END);
        globalRotation = -120 + (-120 * localProgress); // Va verso -240
        
        productMorph = 1;
        videoSeek = 1; // Video finito
    }

    // --- APPLICAZIONI ---

    // 1. ORBITA
    rotatingContainer.style.transform = `translateX(-50%) rotate(${globalRotation}deg)`;
    if (orbitContainer) {
        orbitContainer.style.transform = `translateX(-50%) rotate(${globalRotation}deg)`;
    }

    // 2. CONTRO-ROTAZIONE (Cruciale per tenere il video dritto)
    circles.forEach((circle) => {
        const initialRotation = parseFloat(circle.getAttribute('data-rotation'));
        const currentGlobalRotation = initialRotation + globalRotation;
        const largeCircle = circle.querySelector('.large-circle .white-circle');
        if (largeCircle) {
            largeCircle.style.transform = `rotate(${-currentGlobalRotation}deg)`;
        }
    });

    // 3. ANIMAZIONE PRODOTTI (Step 1)
    const products = document.querySelectorAll('.product-item');
    const ease = 1 - Math.pow(1 - productMorph, 3); 
    
    products.forEach((prod, index) => {
        if (index < circlePositions.length) {
            const start = circlePositions[index];
            const end = chaosPositions[index];
            
            const currentX = start.x + (end.x - start.x) * ease;
            const currentY = start.y + (end.y - start.y) * ease;
            const currentRot = start.rot + (end.rot - start.rot) * ease;
            const currentScale = start.scale + (end.scale - start.scale) * ease;
            
            prod.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) rotate(${currentRot}deg) scale(${currentScale})`;
        }
    });

    // 4. VIDEO
    if (video) {
        if (Number.isFinite(videoDuration) && videoDuration > 0) {
             video.currentTime = videoDuration * videoSeek;
        }
    }

    // 5. TESTI
    // Step 1: Visibile Fase 1
    let op1 = (progress < P1_END) ? 1 : 1 - ((progress - P1_END) / (TRANSITION_END - P1_END) * 2);
    textStep1.style.opacity = Math.max(0, op1);

    // Step 2: Visibile Fase 2
    let op2 = 0;
    if (progress > P1_END && progress < P2_END) {
        if (progress < TRANSITION_END) op2 = (progress - P1_END) / (TRANSITION_END - P1_END);
        else op2 = 1;
        // Fade out finale
        if (progress > P2_END - 0.05) op2 = 1 - (progress - (P2_END - 0.05)) / 0.05;
    }
    textStep2.style.opacity = Math.max(0, Math.min(1, op2));

    // Step 3: Visibile Fase 3
    let op3 = (progress > P2_END) ? (progress - P2_END) / (1 - P2_END) * 2 : 0;
    textStep3.style.opacity = Math.min(1, op3);
  }

  window.addEventListener('scroll', onScroll);
  onScroll();
});
