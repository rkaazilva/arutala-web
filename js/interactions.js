/**
 * ==========================================================================
 * ARUTALA - Interactive Micro-Interactions & Animations (js/interactions.js)
 * Fitur:
 * 1. Auto-Scroll Video Carousel dengan Jeda (Smooth Loop)
 * 2. Scroll Reveal (Fade In Up on Scroll via IntersectionObserver)
 * 3. Video Carousel Horizontal Scroll Controller
 * 4. Tactile Spring / Bouncy Button & Pill Micro-Interactions
 * 5. Floating Back-to-Top Button
 * ==========================================================================
 */

(function () {
  'use strict';

  /**
   * 1. AUTO-SCROLL VIDEO CAROUSEL DENGAN JEDA
   * Otomatis menggeser carousel video satu per satu dengan jeda waktu teratur,
   * berhenti sejenak saat user melakukan hover atau sentuhan di HP.
   */
  window.initAutoScrollVideoCarousel = function () {
    var targets = [
      document.getElementById('videos-container'),
      document.querySelector('#nuansa-videos-container .video-carousel-track'),
      document.querySelector('#nuansa-videos-container > div'),
      document.getElementById('nuansa-videos-container')
    ];

    targets.forEach(function (container) {
      if (!container) return;
      var track = container.classList.contains('video-carousel-track')
        ? container
        : container.querySelector('.video-carousel-track') || container;

      if (!track || track._autoScrollActive) return;
      track._autoScrollActive = true;

      var isPaused = false;
      var resumeTimeout = null;

      function advance() {
        if (isPaused) return;
        // Jeda jika modal player video sedang terbuka
        if (document.body.classList.contains('has-active-modal')) return;

        var firstCard = track.querySelector('.video-card');
        var step = firstCard ? (firstCard.offsetWidth + 24) : 344;
        var maxScroll = track.scrollWidth - track.clientWidth;

        // Jika sudah di kartu paling ujung, geser kembali ke awal secara halus
        if (track.scrollLeft >= maxScroll - 20) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: step, behavior: 'smooth' });
        }
      }

      // Jeda pergeseran: 3.8 detik
      if (track._autoScrollInterval) {
        clearInterval(track._autoScrollInterval);
      }
      track._autoScrollInterval = setInterval(advance, 3800);

      // Mouse hover di desktop (jeda saat diarahkan kursor)
      track.addEventListener('mouseenter', function () {
        isPaused = true;
      });
      track.addEventListener('mouseleave', function () {
        isPaused = false;
      });

      // Touch / swipe di HP (jeda saat disentuh, mulai lagi setelah selesai)
      track.addEventListener('touchstart', function () {
        isPaused = true;
        if (resumeTimeout) clearTimeout(resumeTimeout);
      }, { passive: true });

      track.addEventListener('touchend', function () {
        resumeTimeout = setTimeout(function () {
          isPaused = false;
        }, 3200);
      }, { passive: true });
    });
  };

  /**
   * 2. VIDEO CAROUSEL HORIZONTAL SCROLL HELPER (Fallback)
   */
  window.scrollVideoCarousel = function (containerId, offset) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var track = container.querySelector('.video-carousel-track') || container;
    track.scrollBy({ left: offset, behavior: 'smooth' });
  };

  /**
   * 3. SCROLL REVEAL (FADE IN UP)
   */
  window.initScrollReveal = function () {
    var selectors = [
      '.reveal',
      '.section-header',
      '.article-card',
      '.uss-clean-card',
      '.uss-featured-card',
      '.video-card',
      '.bento-item',
      '.cycle-box-card',
      '.cycle-card',
      '.value-card',
      '.toolkit-content-card',
      '.donation-card',
      '.hero-content',
      '.pillar-card',
      '.curriculum-card',
      '.action-card'
    ];

    var elements = document.querySelectorAll(selectors.join(', '));
    if (!elements || elements.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) {
        el.classList.add('active');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    elements.forEach(function (el) {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 30) {
        el.classList.add('active');
      } else {
        observer.observe(el);
      }
    });
  };

  /**
   * 4. FLOATING BACK TO TOP BUTTON
   */
  window.setupFloatingBackToTop = function () {
    var btn = document.getElementById('btn-floating-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'btn-floating-top';
      btn.className = 'btn-floating-top';
      btn.setAttribute('aria-label', 'Kembali ke atas');
      btn.setAttribute('type', 'button');
      btn.innerHTML = '&#8593;';
      document.body.appendChild(btn);
    }

    window.addEventListener(
      'scroll',
      function () {
        if (window.scrollY > 380) {
          btn.classList.add('show');
        } else {
          btn.classList.remove('show');
        }
      },
      { passive: true }
    );

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  /**
   * 5. HERO SHOWCASE PHOTO SLIDER (Crossfade + Ken Burns + Controls)
   */
  window.initHeroShowcaseSlider = function () {
    var showcase = document.querySelector('.arutala-hero-showcase');
    if (!showcase) return;

    var slides = showcase.querySelectorAll('.hero-slides-track .hero-slide');
    var dots = showcase.querySelectorAll('#heroIndicators .indicator-dot');
    var btnPrev = document.getElementById('btnHeroPrev');
    var btnNext = document.getElementById('btnHeroNext');

    if (!slides || slides.length === 0) return;

    var currentIdx = 0;
    var timer = null;
    var autoPlayDelay = 5500; // 5.5 detik per slide

    function showSlide(index) {
      slides.forEach(function (slide, idx) {
        if (idx === index) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      dots.forEach(function (dot, idx) {
        if (idx === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      currentIdx = index;
    }

    function nextSlide() {
      var next = (currentIdx + 1) % slides.length;
      showSlide(next);
    }

    function prevSlide() {
      var prev = (currentIdx - 1 + slides.length) % slides.length;
      showSlide(prev);
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = setInterval(nextSlide, autoPlayDelay);
    }

    function stopAutoPlay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Tombol Next & Prev
    if (btnNext) {
      btnNext.addEventListener('click', function (e) {
        e.preventDefault();
        nextSlide();
        startAutoPlay();
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', function (e) {
        e.preventDefault();
        prevSlide();
        startAutoPlay();
      });
    }

    // Indikator Dots
    dots.forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        var targetIndex = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(targetIndex)) {
          showSlide(targetIndex);
          startAutoPlay();
        }
      });
    });

    // Pause on Mouse Hover
    showcase.addEventListener('mouseenter', stopAutoPlay);
    showcase.addEventListener('mouseleave', startAutoPlay);

    // Touch Swipe Support di Perangkat Mobile
    var touchStartX = 0;
    var touchEndX = 0;

    showcase.addEventListener('touchstart', function (e) {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
      stopAutoPlay();
    }, { passive: true });

    showcase.addEventListener('touchend', function (e) {
      if (e.changedTouches && e.changedTouches[0]) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 45) {
          if (diff > 0) {
            nextSlide(); // swipe kiri -> slide selanjutnya
          } else {
            prevSlide(); // swipe kanan -> slide sebelumnya
          }
        }
      }
      startAutoPlay();
    }, { passive: true });

    // Mulai autoplay
    startAutoPlay();
  };

  /**
   * 6. HERO STATS ANIMATED COUNTERS (Smooth Count-Up with easeOutExpo)
   */
  window.initHeroCounterStats = function () {
    var statsBanner = document.querySelector('.hero-docked-stats-banner');
    if (!statsBanner) return;

    var counters = statsBanner.querySelectorAll('.stat-counter');
    if (!counters || counters.length === 0) return;

    var hasAnimated = false;

    function runCounterAnimation() {
      if (hasAnimated) return;
      hasAnimated = true;

      var duration = 2000; // 2 detik

      counters.forEach(function (counter) {
        var target = parseInt(counter.getAttribute('data-target'), 10) || 0;
        var startTime = null;

        function updateNumber(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);

          // Easing: easeOutExpo
          var ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          var current = Math.floor(ease * target);

          counter.textContent = current.toLocaleString('id-ID');

          if (progress < 1) {
            requestAnimationFrame(updateNumber);
          } else {
            counter.textContent = target.toLocaleString('id-ID');
          }
        }

        requestAnimationFrame(updateNumber);
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounterAnimation();
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      observer.observe(statsBanner);
    } else {
      // Fallback langsung jalankan
      setTimeout(runCounterAnimation, 400);
    }
  };

  /**
   * Inisialisasi saat DOM siap
   */
  function startInteractions() {
    window.initScrollReveal();
    window.setupFloatingBackToTop();
    window.initAutoScrollVideoCarousel();
    window.initHeroShowcaseSlider();
    window.initHeroCounterStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInteractions);
  } else {
    startInteractions();
  }
})();
