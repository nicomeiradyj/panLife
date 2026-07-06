const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px 50px 0px' });

document.querySelectorAll('.animado').forEach(el => observer.observe(el));

// Stagger para tarjetas de producto (aparecen una tras otra)
document.querySelectorAll('.producto-card').forEach((card, i) => {
  card.classList.add('animado');
  card.style.setProperty('--delay', `${i * 40}ms`);
  observer.observe(card);
});

// Parallax suave en la imagen hero
const heroImg = document.querySelector('.hero-fondo');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const rate = scrolled * 0.35;
    heroImg.style.transform = `translateY(${rate}px)`;
  });
}
