/**
 * Shine Cafe & Restaurant (Banquet Hall) · Zamania
 * Interactivity: Dynamic IST Hours, Dual-Category Slideshow & WhatsApp Reservation
 */

(function () {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    whatsappNumber: '918887766554', // Business WhatsApp
    openHour: 10,     // 10:00 AM IST
    openMinute: 0,
    closeHour: 22,    // 10:30 PM IST
    closeMinute: 30,
    autoplayInterval: 4500
  };

  // --- Dynamic IST Status Calculation ---
  function updateBusinessStatus() {
    const statusPill = document.getElementById('status-pill');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    if (!statusText || !statusDot) return;

    // Calculate current Indian Standard Time (UTC + 5:30)
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 3600000 * 5.5);

    const currentMinutes = istTime.getHours() * 60 + istTime.getMinutes();
    const openMinutes = CONFIG.openHour * 60 + CONFIG.openMinute;
    const closeMinutes = CONFIG.closeHour * 60 + CONFIG.closeMinute;

    const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    if (isOpen) {
      statusDot.style.background = '#16A34A';
      statusDot.style.boxShadow = '0 0 0 2px rgba(22, 163, 74, 0.2)';
      statusText.textContent = 'Open Now · Closes 10:30 PM';
    } else {
      statusDot.style.background = '#D31A26';
      statusDot.style.boxShadow = '0 0 0 2px rgba(211, 26, 38, 0.2)';
      statusText.textContent = 'Closed Now · Opens 10:00 AM';
    }
  }

  // --- Slideshow Controller ---
  class DualSlideshow {
    constructor() {
      this.frame = document.getElementById('hero-slideshow');
      this.track = document.getElementById('slideshow-track');
      this.prevBtn = document.getElementById('slide-prev');
      this.nextBtn = document.getElementById('slide-next');
      this.dotsContainer = document.getElementById('slide-dots');
      this.categoryTabs = document.querySelectorAll('.switch-tab');
      this.allSlides = Array.from(document.querySelectorAll('.slide-item'));

      if (!this.frame || !this.allSlides.length) return;

      this.currentCategory = 'sitting';
      this.currentCategoryIndex = 0;
      this.filteredSlides = [];
      this.timer = null;
      this.touchStartX = 0;
      this.touchEndX = 0;

      this.init();
    }

    init() {
      this.applyCategoryFilter(this.currentCategory, 0);

      // Category tab click listeners
      this.categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const cat = tab.getAttribute('data-category');
          if (cat === this.currentCategory) return;

          this.categoryTabs.forEach(t => {
            const isActive = t === tab;
            t.classList.toggle('active', isActive);
            t.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });

          this.currentCategory = cat;
          this.currentCategoryIndex = 0;
          this.applyCategoryFilter(this.currentCategory, 0);
          this.resetTimer();
        });
      });

      // Navigation buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => {
          this.prevSlide();
          this.resetTimer();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => {
          this.nextSlide();
          this.resetTimer();
        });
      }

      // Autoplay setup
      this.startTimer();

      // Pause on hover
      this.frame.addEventListener('mouseenter', () => this.stopTimer());
      this.frame.addEventListener('mouseleave', () => this.startTimer());

      // Pause when tab hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopTimer();
        } else {
          this.startTimer();
        }
      });

      // Touch swipe support
      this.frame.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.frame.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });
    }

    handleSwipe() {
      const swipeDistance = this.touchEndX - this.touchStartX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
        this.resetTimer();
      }
    }

    applyCategoryFilter(category, targetIndex) {
      this.filteredSlides = this.allSlides.filter(
        slide => slide.getAttribute('data-category') === category
      );

      this.renderDots();
      this.showSlide(targetIndex);
    }

    renderDots() {
      if (!this.dotsContainer) return;
      this.dotsContainer.innerHTML = '';

      this.filteredSlides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `slide-dot ${idx === this.currentCategoryIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          this.showSlide(idx);
          this.resetTimer();
        });
        this.dotsContainer.appendChild(dot);
      });
    }

    showSlide(index) {
      if (!this.filteredSlides.length) return;

      if (index >= this.filteredSlides.length) {
        this.currentCategoryIndex = 0;
      } else if (index < 0) {
        this.currentCategoryIndex = this.filteredSlides.length - 1;
      } else {
        this.currentCategoryIndex = index;
      }

      // Hide all slides
      this.allSlides.forEach(slide => slide.classList.remove('active'));

      // Show the selected slide in current category
      const targetSlide = this.filteredSlides[this.currentCategoryIndex];
      if (targetSlide) {
        targetSlide.classList.add('active');
      }

      // Update dots
      if (this.dotsContainer) {
        const dots = this.dotsContainer.querySelectorAll('.slide-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === this.currentCategoryIndex);
        });
      }
    }

    nextSlide() {
      this.showSlide(this.currentCategoryIndex + 1);
    }

    prevSlide() {
      this.showSlide(this.currentCategoryIndex - 1);
    }

    startTimer() {
      // Respect prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      this.stopTimer();
      this.timer = setInterval(() => this.nextSlide(), CONFIG.autoplayInterval);
    }

    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    resetTimer() {
      this.stopTimer();
      this.startTimer();
    }
  }

  // --- WhatsApp Reservation Submission ---
  window.handleReservationSubmit = function (event) {
    event.preventDefault();

    const type = document.getElementById('res-type').value.trim();
    const name = document.getElementById('res-name').value.trim();
    const phone = document.getElementById('res-phone').value.trim();
    const guests = document.getElementById('res-guests').value.trim();

    if (!name || !phone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    let message = `*Shine Cafe & Restaurant (Banquet Hall) Reservation Inquiry*\n`;
    message += `──────────────────────\n`;
    message += `• *Type:* ${type}\n`;
    message += `• *Name:* ${name}\n`;
    message += `• *Phone:* ${phone}\n`;
    if (guests) {
      message += `• *Guests / Details:* ${guests}\n`;
    }
    message += `──────────────────────\n`;
    message += `_Sent via Shine Cafe Website_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // --- Initialise on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    updateBusinessStatus();
    setInterval(updateBusinessStatus, 60000); // Check every minute

    new DualSlideshow();
  });

})();
