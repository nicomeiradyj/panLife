let observer = null;

if ('IntersectionObserver' in window) {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 50px 0px' });
}

document.querySelectorAll('.animado').forEach(el => {
  if (observer) {
    observer.observe(el);
  } else {
    el.classList.add('visible');
  }
});

// Stagger para tarjetas de producto (aparecen una tras otra)
document.querySelectorAll('.producto-card').forEach((card, i) => {
  card.classList.add('animado');
  card.style.setProperty('--delay', `${i * 40}ms`);
  if (observer) {
    observer.observe(card);
  } else {
    card.classList.add('visible');
  }
});

// Parallax suave en la imagen hero
const heroImg = document.querySelector('.hero-fondo');
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (heroImg && !reduceMotion) {
  window.addEventListener('scroll', () => {
    const rate = Math.min(window.scrollY * 0.35, 80);
    heroImg.style.transform = `translateY(${rate}px)`;
  }, { passive: true });
}
