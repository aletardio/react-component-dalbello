document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('carousel-container');
  const rotatingContainer = document.getElementById('rotating-container');
  const orbitContainer = document.getElementById('orbit-container');
  
  // Selezioniamo i video in ordine di apparizione nel DOM
  // Assumiamo: Primo video = Step 2, Secondo video = Step 3
  const videos = document.querySelectorAll('video');
  const vid1 = videos[0]; // Step 2
  const vid2 = videos[1]; // Step 3
  
  const textStep1 = document.getElementById('text-step-1');
  const textStep2 = document.getElementById('text-step-2');
  const textStep3 = document.getElementById('text-step-3');
  const circles = document.querySelectorAll('.circle-with-elements');

  // Setup Video 1
  let dur1 = 0;
  if (vid1) {
      vid1.addEventListener('loadedmetadata', () => { dur1 = vid1.duration; vid1.currentTime = 0; });
      // Fallback se già caricato
      if (vid1.readyState >= 1) { dur1 = vid1.duration; vid1.currentTime = 0; }
  }
  
  // Setup Video 2
  let dur2 = 0;
  if (vid2) {
      vid2.addEventListener('loadedmetadata', () => { dur2 = vid2.duration; vid2.currentTime = 0; });
      // Fallback se già caricato
      if (vid2.readyState >= 1) { dur2 = vid2.duration; vid2.currentTime = 0; }
  }

  // Inizializzazione rotazioni base
  circles.forEach((circle) => {
    const initialRotation = parseFloat(circle.getAttribute('data-rotation'));
    circle.style.transform = `rotate(${initialRotation}deg)`;
  });

  // --- CONFIGURAZIONE COORDINATE PRODOTTI (Step 1) ---
  
  const circlePositions = [
    { x: -140, y: -280, rot: -60, scale: 1 },  // 1
    { x: 240,  y: -160, rot: 50,  scale: 1 },  // 2
    { x: 20,   y: 320,  rot: 10,  scale: 1 },  // 3
    { x: -260, y: -120, rot: -105, scale: 1 }, // 4 
    { x: 80,   y: -250, rot: 20,  scale: 1 },  // 5
    { x: 220,  y: 220,  rot: -45, scale: 1 },  // 6
    { x: -320, y: 60,   rot: 90,  scale: 1 },  // 7
    { x: 280,  y: 40,   rot: 30,  scale: 1 },  // 8 
    { x: -180, y: 240,  rot: -130, scale: 1 }, // 9
    { x: -60,  y: 20,   rot: -85,  scale: 1 }  // 10
  ];

  const chaosPositions = [
    { x: -110, y: -200, rot: -15, scale: 0.75 }, // 1
    { x: 130,  y: -130, rot: 45,  scale: 0.65 }, // 2
    { x: 0,    y: 225,  rot: 10,  scale: 1 },    // 3
    { x: -170, y: -60,  rot: 10, scale: 1 },     // 4
    { x: 30,   y: -170, rot: 5,   scale: 0.6 },  // 5
    { x: 120,  y: 125,  rot: -30, scale: 0.65 }, // 6
    { x: -170, y: 70,   rot: 80,  scale: 0.7 },  // 7
    { x: 200,  y: 10,   rot: 25,  scale: 0.8 },  // 8
    { x: -70,  y: 130,  rot: -120, scale: 0.75 },// 9
    { x: -15,  y: 15,   rot: -20, scale: 0.9 }   // 10
  ];

  function onScroll() {
    const rect = container.getBoundingClientRect();
    const scrollableDistance = container.offsetHeight - window.innerHeight;
    let progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);

    // --- TIMELINE FASI ---
    
    // 0% - 15%: FASE 1 (Step 1 Implosione prodotti)
    const P1_END = 0.15; 
    
    // 15% - 25%: TRANSITION 1 (Rotazione da 0 a -120. Step 1 esce, Step 2 arriva)
    const T1_END = 0.25;
    
    // 25% - 50%: FASE 2 (Step 2 FERMO. Video 1 Scrubbing)
    const P2_END = 0.50;
    
    // 50% - 60%: TRANSITION 2 (Rotazione da -120 a -240. Step 2 esce, Step 3 arriva)
    const T2_END = 0.60;
    
    // 60% - 95%: FASE 3 (Step 3 FERMO. Video 2 Scrubbing)
    const P3_END = 0.95;
    
    // 95% - 100%: FINALE (Step 3 resta fisso al centro)

    let globalRotation = 0;
    let productMorph = 0;
    let seek1 = 0; // Scrub Video 1
    let seek2 = 0; // Scrub Video 2

    // LOGICA STATI
    if (progress < P1_END) {
        // FASE 1: Step 1 attivo
        globalRotation = 0;
        productMorph = progress / P1_END; // 0 -> 1
        seek1 = 0; seek2 = 0;
    }
    else if (progress < T1_END) {
        // TRANSITION 1: Verso -120
        const loc = (progress - P1_END) / (T1_END - P1_END);
        globalRotation = -120 * loc;
        
        productMorph = 1; // Prodotti restano collassati
        seek1 = 0; seek2 = 0;
    }
    else if (progress < P2_END) {
        // FASE 2: Step 2 Fermo (-120)
        globalRotation = -120;
        
        productMorph = 1;
        seek1 = (progress - T1_END) / (P2_END - T1_END); // 0 -> 1
        seek2 = 0;
    }
    else if (progress < T2_END) {
        // TRANSITION 2: Verso -240
        const loc = (progress - P2_END) / (T2_END - P2_END);
        globalRotation = -120 + (-120 * loc); // Va da -120 a -240
        
        productMorph = 1;
        seek1 = 1; // Video 1 finito
        seek2 = 0;
    }
    else if (progress < P3_END) {
        // FASE 3: Step 3 Fermo (-240)
        globalRotation = -240;
        
        productMorph = 1;
        seek1 = 1;
        seek2 = (progress - T2_END) / (P3_END - T2_END); // 0 -> 1
    }
    else {
        // FINALE: Resta tutto fermo su Step 3
        globalRotation = -240; // Bloccato al centro
        
        productMorph = 1;
        seek1 = 1;
        seek2 = 1; // Video 2 finito
    }

    // --- APPLICAZIONI VISIVE ---

    // 1. ORBITA (Rotazione Globale)
    rotatingContainer.style.transform = `translateX(-50%) rotate(${globalRotation}deg)`;
    if (orbitContainer) {
        orbitContainer.style.transform = `translateX(-50%) rotate(${globalRotation}deg)`;
    }

    // 2. CONTRO-ROTAZIONE (Per tenere dritti i video e i contenuti)
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

    // 4. VIDEO 1 (Scrubbing)
    if (vid1 && Number.isFinite(dur1) && dur1 > 0) {
        vid1.currentTime = dur1 * seek1;
    }

    // 5. VIDEO 2 (Scrubbing)
    if (vid2 && Number.isFinite(dur2) && dur2 > 0) {
        vid2.currentTime = dur2 * seek2;
    }

    // 6. TESTI (Gestione Opacità)
    
    // Text Step 1: Visibile solo all'inizio, sparisce durante Transition 1
    let op1 = (progress < P1_END) ? 1 : 1 - ((progress - P1_END) / (T1_END - P1_END) * 2);
    textStep1.style.opacity = Math.max(0, op1);

    // Text Step 2: Appare in Transition 1, Sparisce in Transition 2
    let op2 = 0;
    if (progress > P1_END && progress < T2_END) {
        if (progress < T1_END) op2 = (progress - P1_END) / (T1_END - P1_END); // Fade IN
        else if (progress < P2_END) op2 = 1; // Full
        else op2 = 1 - (progress - P2_END) / (T2_END - P2_END); // Fade OUT
    }
    textStep2.style.opacity = Math.max(0, Math.min(1, op2));

    // Text Step 3: Appare in Transition 2 e RESTA VISIBILE ALLA FINE
    let op3 = 0;
    if (progress > P2_END) {
        if (progress < T2_END) op3 = (progress - P2_END) / (T2_END - P2_END); // Fade IN
        else op3 = 1; // Full e rimane 1 fino alla fine
    }
    textStep3.style.opacity = Math.max(0, Math.min(1, op3));
  }

  window.addEventListener('scroll', onScroll);
  onScroll();
});
