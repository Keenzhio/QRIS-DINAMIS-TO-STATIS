// Modern UI micro-interactions
(function(){
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const grid = document.getElementById('featureGrid');

  // Stagger reveal for grid cards
  function revealGrid(){
    const cards = Array.from(grid.querySelectorAll('.card'));
    cards.forEach((c, i) => {
      c.style.animation = `fadeUp .6s ${0.1 + i*0.06}s cubic-bezier(.2,.9,.2,1) forwards`;
    });
  }

  // Theme toggle (light/dark simulation)
  function toggleTheme(){
    if(document.body.classList.contains('light')){
      document.body.classList.remove('light');
      themeToggle.textContent = '🌙';
    }else{
      document.body.classList.add('light');
      themeToggle.textContent = '☀️';
    }
  }

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!prefersReduced) revealGrid();

  // initial theme if user stored preference
  if(localStorage.getItem('qris-theme') === 'light'){
    document.body.classList.add('light');
    themeToggle.textContent = '☀️';
  }

  themeToggle?.addEventListener('click', ()=>{
    toggleTheme();
    localStorage.setItem('qris-theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });

  // small accessibility: allow keyboard "Enter" on cards to mimic click
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && document.activeElement?.classList.contains('card')){
      document.activeElement.click();
    }
  });
})();
