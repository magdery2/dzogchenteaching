(function(){
  var modal = document.getElementById('videoModal');
  if(!modal) return;
  var body = document.getElementById('videoModalBody');
  var closeBtn = document.getElementById('videoModalClose');

  function openVideo(id){
    body.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="Lama Michael Gregory teaching video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeVideo(){
    modal.classList.remove('open');
    body.innerHTML = '';
    document.body.style.overflow = '';
  }
  document.querySelectorAll('[data-video-open]').forEach(function(btn){
    btn.addEventListener('click', function(){ openVideo(btn.getAttribute('data-video-open')); });
  });
  closeBtn.addEventListener('click', closeVideo);
  modal.addEventListener('click', function(e){ if(e.target === modal) closeVideo(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeVideo(); });
})();

// scroll reveal
(function(){
  var groups = [
    ['.entry-photo, .entry-grid > div:last-child', 0],
    ['.about-photo, .about-grid > div:last-child', 0],
    ['.lineage .section-head', 0],
    ['.lineage-card', 90],
    ['.path .section-head', 0],
    ['.path-banner', 0],
    ['.path-step', 70],
    ['#schedule .section-head', 0],
    ['.schedule-row', 60],
    ['.member-grid > div', 0],
    ['.quote-inner', 0],
    ['.signup .section-head, .signup-form', 0],
    ['.page-content .section-head', 0],
    ['.prose', 0],
    ['.cards-grid > .card', 80],
    ['.plan-grid > .plan-card', 90],
    ['.stat-row', 0],
    ['.cta-band .section-head, .cta-band .btn', 0]
  ];
  groups.forEach(function(g){
    var els = document.querySelectorAll(g[0]);
    els.forEach(function(el, i){
      el.classList.add('reveal');
      if(g[1]) el.style.transitionDelay = (i * g[1]) + 'ms';
    });
  });

  if(!('IntersectionObserver' in window)){
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.15, rootMargin:'0px 0px -60px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
})();
