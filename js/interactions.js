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
   * Inisialisasi saat DOM siap
   */
  function startInteractions() {
    window.initScrollReveal();
    window.setupFloatingBackToTop();
    window.initAutoScrollVideoCarousel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInteractions);
  } else {
    startInteractions();
  }
})();
