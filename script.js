document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('carousel-container');
  const rotatingContainer = document.getElementById('rotating-container');
  // NUOVO: Selezioniamo anche l'orbita
  const orbitContainer = document.getElementById('orbit-container'); 
  
  const textStep1 = document.getElementById('text-step-1');
  const textStep2 = document.getElementById('text-step-2');
  const textStep3 = document.getElementById('text-step-3');
  const circles = document.querySelectorAll('.circle-with-elements');

  // Configurazione iniziale cerchi prodotti
  circles.forEach((circle) => {
    const initialRotation = parseFloat(circle.getAttribute('data-rotation'));
    circle.style.transform = `rotate(${initialRotation}deg)`;
  });

  function onScroll() {
    const rect = container.getBoundingClientRect();
    const scrollableDistance = container.offsetHeight - window.innerHeight;
    let progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);

    // Calcolo rotazione (da 0 a -240 gradi)
    const totalRotation = -240 * progress;
    
    // 1. Ruota il contenitore dei PRODOTTI
    rotatingContainer.style.transform = `translateX(-50%) rotate(${totalRotation}deg)`;

    // 2. Ruota l'ORBITA TRATTEGGIATA (Stessa rotazione!)
    // Così i trattini e i cerchi piccoli fissi sugli angoli si muovono insieme ai prodotti
    if (orbitContainer) {
      orbitContainer.style.transform = `translateX(-50%) rotate(${totalRotation}deg)`;
    }

    // 3. Contro-rotazione (Logica esistente per tenere dritti gli elementi interni)
    circles.forEach((circle) => {
      const initialRotation = parseFloat(circle.getAttribute('data-rotation'));
      const currentGlobalRotation = initialRotation + totalRotation;
      
      // Tieni dritto il cerchio bianco
      const largeCircle = circle.querySelector('.large-circle .white-circle');
      if (largeCircle) {
        largeCircle.style.transform = `rotate(${-currentGlobalRotation}deg)`;
      }
      
      // Tieni dritti anche i prodotti (Decommenta se necessario)
      /*
      const productContainer = circle.querySelector('.product-container');
      if (productContainer) {
         productContainer.style.transform = `rotate(${-currentGlobalRotation}deg)`;
      }
      */
    });

    // 4. Gestione Opacity Testi (uguale a prima)
    const r = totalRotation;
    
    // Step 1
    let op1 = (r > -40) ? 1 : (r > -80 ? (r + 80) / 40 : 0);
    textStep1.style.opacity = op1;
    textStep1.style.pointerEvents = op1 > 0.1 ? 'auto' : 'none';

    // Step 2
    let op2 = 0;
    if (r <= -80 && r > -120) op2 = (r + 80) / -40;
    else if (r <= -120 && r > -160) op2 = (r + 160) / 40;
    textStep2.style.opacity = op2;
    textStep2.style.pointerEvents = op2 > 0.1 ? 'auto' : 'none';

    // Step 3
    let op3 = (r <= -160 && r > -200) ? (r + 160) / -40 : (r <= -200 ? 1 : 0);
    textStep3.style.opacity = op3;
    textStep3.style.pointerEvents = op3 > 0.1 ? 'auto' : 'none';
  }

  window.addEventListener('scroll', onScroll);
  onScroll();
});
