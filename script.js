// script.js – Simple IntersectionObserver for fade‑in animation (currently unused but ready for future sections)

// Add the 'fade-in' class when an element enters the viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
});

// Observe elements with the .observe class
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.observe').forEach(el => observer.observe(el));
});
