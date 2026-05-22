// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.animado').forEach(el => observer.observe(el));

// Stagger para tarjetas de producto (aparecen una tras otra)
document.querySelectorAll('.producto-card').forEach((card, i) => {
  card.classList.add('animado');
  card.style.setProperty('--delay', `${i * 60}ms`);
  observer.observe(card);
});
