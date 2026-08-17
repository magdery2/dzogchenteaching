requestAnimationFrame(() => document.body.classList.add('page-ready'));

window.addEventListener('pageshow', (event) => {
  if (event.persisted) document.body.classList.add('page-ready');
});

const header = document.getElementById('siteHeader');
const toggle = document.getElementById('menuToggle');
const navigation = document.getElementById('navLinks');

const currentFile = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navlinks a[href]').forEach((link) => {
  const href = link.getAttribute('href');
  if (href.includes('#')) return;
  const hrefFile = href.split('/').pop();
  if (hrefFile === currentFile) link.classList.add('is-active');
});

let lastScrollY = window.scrollY;

function updateHeader() {
  const currentY = window.scrollY;
  const isScrolled = header.classList.contains('scrolled');
  if (!isScrolled && currentY > 64) {
    header.classList.add('scrolled');
  } else if (isScrolled && currentY < 32) {
    header.classList.remove('scrolled');
  }

  const delta = currentY - lastScrollY;
  if (currentY < 96) {
    header.classList.remove('header-hidden');
  } else if (delta > 6) {
    header.classList.add('header-hidden');
  } else if (delta < -1) {
    header.classList.remove('header-hidden');
  }
  lastScrollY = currentY;
}

function setMenu(open, returnFocus = false) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navigation.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  if (open) header.classList.remove('header-hidden');

  if (returnFocus) toggle.focus();
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

toggle.addEventListener('click', () => {
  setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false, true);
  }
});

document.addEventListener('click', (event) => {
  if (!header.contains(event.target)) setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 980) setMenu(false);
});

document.querySelectorAll('[data-course-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-course-track]');
  const slides = [...track.children];
  const previous = carousel.querySelector('[data-course-prev]');
  const next = carousel.querySelector('[data-course-next]');
  const position = carousel.querySelector('.course-position');

  function currentSlide() {
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / (slideWidth + gap))));
  }

  function updateCourseControls() {
    const index = currentSlide();
    if (position) position.textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
  }

  function moveCourse(direction) {
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = slideWidth + gap;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (direction > 0 && track.scrollLeft >= maxScroll - 2) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction < 0 && track.scrollLeft <= 2) {
      track.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: direction * step, behavior: 'smooth' });
    }
  }

  if (track.hasAttribute('data-autoscroll') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let paused = false;
    let onScreen = false;
    let rafId = null;
    let resumeTimer = null;

    function pause() {
      paused = true;
      clearTimeout(resumeTimer);
    }
    function resume() {
      paused = false;
    }
    function pauseThenResume() {
      pause();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(resume, 3500);
    }

    ['mouseenter', 'focusin', 'touchstart'].forEach((event) => {
      carousel.addEventListener(event, pause, { passive: true });
    });
    ['mouseleave', 'focusout', 'touchend'].forEach((event) => {
      carousel.addEventListener(event, resume, { passive: true });
    });

    previous.addEventListener('click', () => { moveCourse(-1); pauseThenResume(); });
    next.addEventListener('click', () => { moveCourse(1); pauseThenResume(); });

    function autoScrollStep() {
      if (!paused && !document.hidden && onScreen) {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 1) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollLeft += 0.4;
        }
      }
      rafId = requestAnimationFrame(autoScrollStep);
    }

    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { onScreen = entry.isIntersecting; });
    }, { threshold: 0.01 });
    visibilityObserver.observe(carousel);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!document.hidden && !rafId) {
        rafId = requestAnimationFrame(autoScrollStep);
      }
    });

    rafId = requestAnimationFrame(autoScrollStep);
  } else {
    previous.addEventListener('click', () => moveCourse(-1));
    next.addEventListener('click', () => moveCourse(1));
  }

  track.addEventListener('scroll', updateCourseControls, { passive: true });
  window.addEventListener('resize', updateCourseControls);
  updateCourseControls();
});

const testimonialModal = document.getElementById('testimonialModal');
if (testimonialModal) {
  const modalQuote = document.getElementById('testimonialModalQuote');
  const modalName = document.getElementById('testimonialModalName');
  const modalSource = document.getElementById('testimonialModalSource');
  let lastFocused = null;

  function openTestimonialModal(figure) {
    modalQuote.innerHTML = figure.querySelector('blockquote').innerHTML;
    modalName.textContent = figure.querySelector('figcaption strong').textContent;
    const source = figure.dataset.source;
    if (source) {
      modalSource.href = source;
      modalSource.hidden = false;
    } else {
      modalSource.hidden = true;
    }
    lastFocused = document.activeElement;
    testimonialModal.hidden = false;
    document.body.classList.add('modal-open');
    testimonialModal.querySelector('.testimonial-modal-close').focus();
  }

  function closeTestimonialModal() {
    testimonialModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.testimonial-readmore').forEach((button) => {
    button.addEventListener('click', () => openTestimonialModal(button.closest('figure')));
  });

  testimonialModal.querySelectorAll('[data-modal-close]').forEach((el) => {
    el.addEventListener('click', closeTestimonialModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !testimonialModal.hidden) closeTestimonialModal();
  });
}

const retreatFilters = [...document.querySelectorAll('[data-retreat-filter]')];
const retreatCards = [...document.querySelectorAll('[data-retreat-tags]')];

retreatFilters.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.retreatFilter;

    retreatFilters.forEach((other) => {
      other.classList.toggle('is-active', other === button);
      other.setAttribute('aria-selected', String(other === button));
    });

    retreatCards.forEach((card) => {
      const tags = card.dataset.retreatTags.split(' ');
      card.hidden = !(filter === 'all' || tags.includes(filter));
    });
  });
});

const revealSingles = document.querySelectorAll([
  '.free .split > *',
  '.teacher .split > *',
  '.lineage .center > .eyebrow',
  '.lineage .center > h2',
  '.lineage .center > .lead',
  '.lineage-grid',
  '.path-intro',
  '.path-visual',
  '.steps',
  '.path-note',
  '.schedule-head',
  '.events',
  '.membership > *',
  '.quote .wrap > *',
  '.news-grid > *',
  '.foot-grid',
  '.copy',
  '.retreat-center .split > *',
  '.funnel-hero-copy > *',
  '.funnel-offer',
  '.funnel-section-head > *',
  '.quote-panel > *',
  '.funnel-final-grid > *',
  '.article-title',
  '.article-meta',
  '.article-featured'
].join(','));

const revealGroups = document.querySelectorAll([
  '.benefit-grid',
  '.course-track',
  '.testimonial-track',
  '.level-grid',
  '.join-steps',
  '.calendar-list',
  '.proof-grid',
  '.article-body'
].join(','));

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealSingles.forEach((element) => element.classList.add('is-visible'));
  revealGroups.forEach((group) => {
    [...group.children].forEach((child) => child.classList.add('is-visible'));
  });
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8%'
  });

  revealSingles.forEach((element, index) => {
    element.classList.add('scroll-reveal');
    element.style.setProperty('--reveal-delay', `${(index % 2) * 90}ms`);
    revealObserver.observe(element);
  });

  revealGroups.forEach((group) => {
    [...group.children].forEach((child, index) => {
      child.classList.add('scroll-reveal');
      child.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 80}ms`);
      revealObserver.observe(child);
    });
  });
}
