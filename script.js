(function() {
  'use strict';

  if (!window.__app) {
    window.__app = {};
  }

  const app = window.__app;

  const CONFIG = {
    BREAKPOINTS: {
      MOBILE: 480,
      TABLET: 768,
      DESKTOP: 1024
    },
    ANIMATION: {
      DURATION: 600,
      EASING: 'ease-out',
      OFFSET: 120
    },
    VALIDATION: {
      NAME: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
      EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      PHONE: /^[\d+\-\s()]{10,20}$/,
      MESSAGE_MIN_LENGTH: 10
    }
  };

  class FormValidator {
    constructor(form) {
      this.form = form;
      this.fields = this.form.querySelectorAll('[required]');
    }

    validateField(field) {
      const value = field.value.trim();
      const fieldType = field.type || field.tagName.toLowerCase();
      const fieldId = field.id;
      let isValid = true;
      let errorMessage = '';

      if (!value && field.hasAttribute('required')) {
        isValid = false;
        errorMessage = 'Dit veld is verplicht';
      } else if (value) {
        switch (fieldType) {
          case 'email':
            if (!CONFIG.VALIDATION.EMAIL.test(value)) {
              isValid = false;
              errorMessage = 'Voer een geldig e-mailadres in';
            }
            break;
          case 'tel':
            if (!CONFIG.VALIDATION.PHONE.test(value)) {
              isValid = false;
              errorMessage = 'Voer een geldig telefoonnummer in';
            }
            break;
          case 'text':
            if (fieldId === 'firstName' || fieldId === 'lastName') {
              if (!CONFIG.VALIDATION.NAME.test(value)) {
                isValid = false;
                errorMessage = 'Voer een geldige naam in (2-50 tekens)';
              }
            }
            break;
          case 'textarea':
            if (value.length < CONFIG.VALIDATION.MESSAGE_MIN_LENGTH) {
              isValid = false;
              errorMessage = `Voer minimaal ${CONFIG.VALIDATION.MESSAGE_MIN_LENGTH} tekens in`;
            }
            break;
          case 'checkbox':
            if (!field.checked) {
              isValid = false;
              errorMessage = 'U moet akkoord gaan met de voorwaarden';
            }
            break;
        }
      }

      this.toggleError(field, isValid, errorMessage);
      return isValid;
    }

    toggleError(field, isValid, message) {
      const wrapper = field.closest('.c-form__group') || field.closest('.form-check') || field.parentElement;
      let errorElement = wrapper.querySelector('.invalid-feedback, .c-form__error');

      if (!isValid) {
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'invalid-feedback c-form__error';
          wrapper.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        field.setAttribute('aria-invalid', 'true');
        wrapper.classList.add('has-error');
      } else {
        if (errorElement) {
          errorElement.style.display = 'none';
        }
        field.removeAttribute('aria-invalid');
        wrapper.classList.remove('has-error');
      }
    }

    validateAll() {
      let isFormValid = true;
      this.fields.forEach(field => {
        const isFieldValid = this.validateField(field);
        if (!isFieldValid) {
          isFormValid = false;
        }
      });
      return isFormValid;
    }

    attachListeners() {
      this.fields.forEach(field => {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => {
          if (field.getAttribute('aria-invalid') === 'true') {
            this.validateField(field);
          }
        });
      });
    }
  }

  class NotificationManager {
    constructor() {
      this.container = this.createContainer();
    }

    createContainer() {
      const container = document.createElement('div');
      container.className = 'c-notification-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:350px;';
      document.body.appendChild(container);
      return container;
    }

    show(message, type = 'info') {
      const alert = document.createElement('div');
      alert.className = `alert alert-${type} alert-dismissible fade`;
      alert.setAttribute('role', 'alert');
      alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

      this.container.appendChild(alert);
      
      requestAnimationFrame(() => {
        alert.classList.add('show');
      });

      const closeBtn = alert.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide(alert));
      }

      setTimeout(() => this.hide(alert), 5000);
    }

    hide(alert) {
      alert.classList.remove('show');
      setTimeout(() => {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      }, 300);
    }
  }

  class BurgerMenu {
    constructor() {
      this.nav = document.querySelector('.c-nav#main-nav, .navbar');
      this.toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
      this.collapse = document.querySelector('.c-nav__list, .navbar-collapse');
      this.body = document.body;
      this.isOpen = false;

      if (!this.toggle || !this.collapse) return;
      
      this.init();
    }

    init() {
      this.toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
          this.toggle.focus();
        }
      });

      document.addEventListener('click', (e) => {
        if (this.isOpen && this.nav && !this.nav.contains(e.target)) {
          this.close();
        }
      });

      const links = this.collapse.querySelectorAll('.c-nav__link, .nav-link');
      links.forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (window.innerWidth >= CONFIG.BREAKPOINTS.DESKTOP && this.isOpen) {
            this.close();
          }
        }, 150);
      });
    }

    toggleMenu() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.isOpen = true;
      if (this.nav) this.nav.classList.add('is-open');
      this.collapse.classList.add('show');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.body.classList.add('u-no-scroll');
      this.collapse.style.height = `calc(100vh - var(--header-h))`;
    }

    close() {
      this.isOpen = false;
      if (this.nav) this.nav.classList.remove('is-open');
      this.collapse.classList.remove('show');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.body.classList.remove('u-no-scroll');
    }
  }

  class SmoothScroll {
    constructor() {
      this.init();
    }

    init() {
      const isHomepage = location.pathname === '/' || location.pathname.endsWith('/index.html');

      if (!isHomepage) {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
          const href = link.getAttribute('href');
          if (href && href !== '#' && href !== '#!' && href.startsWith('#section-')) {
            link.setAttribute('href', '/' + href);
          }
        });
      }

      document.addEventListener('click', (e) => {
        let target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }

        if (!target || target.tagName !== 'A') return;

        const href = target.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;

        if (href.startsWith('#')) {
          const section = document.querySelector(href);
          if (section) {
            e.preventDefault();
            const header = document.querySelector('.l-header, .navbar');
            const offset = header ? header.offsetHeight : 80;
            const top = section.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
              top: top,
              behavior: 'smooth'
            });
          }
        }
      });
    }
  }

  class ScrollSpy {
    constructor() {
      this.navLinks = document.querySelectorAll('.c-nav__link, .nav-link');
      this.sections = [];
      this.init();
    }

    init() {
      this.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const section = document.querySelector(href);
          if (section) {
            this.sections.push({ link, section });
          }
        }
      });

      if (this.sections.length > 0) {
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        this.onScroll();
      }
    }

    onScroll() {
      const scrollPosition = window.pageYOffset + 100;

      let currentSection = null;
      this.sections.forEach(({ section }) => {
        if (section.offsetTop <= scrollPosition) {
          currentSection = section;
        }
      });

      this.sections.forEach(({ link, section }) => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        
        if (currentSection === section) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  }

  class IntersectionAnimations {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(
          (entries) => this.handleIntersection(entries),
          {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
          }
        );

        this.observeElements();
      }
    }

    observeElements() {
      const selectors = [
        '.card', '.c-card',
        '.btn', '.c-button',
        'img:not(.c-logo__img)',
        '.c-process-card',
        '.c-support-card',
        '.c-testimonial',
        '.alert'
      ];

      document.querySelectorAll(selectors.join(',')).forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        this.observer.observe(el);
      });
    }

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          this.observer.unobserve(entry.target);
        }
      });
    }
  }

  class HoverEffects {
    constructor() {
      this.init();
    }

    init() {
      this.addRippleEffect();
      this.addButtonHoverEffects();
      this.addCardHoverEffects();
    }

    addRippleEffect() {
      document.querySelectorAll('.btn, .c-button, .nav-link').forEach(element => {
        element.addEventListener('click', function(e) {
          const ripple = document.createElement('span');
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
          `;

          this.style.position = 'relative';
          this.style.overflow = 'hidden';
          this.appendChild(ripple);

          setTimeout(() => ripple.remove(), 600);
        });
      });

      const style = document.createElement('style');
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    addButtonHoverEffects() {
      document.querySelectorAll('.btn, .c-button').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = 'var(--shadow-lg)';
        });

        btn.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '';
        });
      });
    }

    addCardHoverEffects() {
      document.querySelectorAll('.card, .c-card').forEach(card => {
        card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
      });
    }
  }

  class CountUpAnimation {
    constructor() {
      this.init();
    }

    init() {
      const counters = document.querySelectorAll('[data-count]');
      if (counters.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };

      updateCounter();
    }
  }

  class FormManager {
    constructor() {
      this.notificationManager = new NotificationManager();
      this.init();
    }

    init() {
      document.querySelectorAll('.c-form, form').forEach(form => {
        const validator = new FormValidator(form);
        validator.attachListeners();

        form.addEventListener('submit', (e) => this.handleSubmit(e, validator));
      });
    }

    async handleSubmit(e, validator) {
      e.preventDefault();
      e.stopPropagation();

      const form = e.target;
      const isValid = validator.validateAll();

      if (!isValid) {
        this.notificationManager.show('Vul alle verplichte velden correct in', 'danger');
        return;
      }

      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) {
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';
      }

      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      try {
        const response = await fetch('process.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          this.notificationManager.show('Bedankt! Uw bericht is verzonden.', 'success');
          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1500);
        } else {
          this.notificationManager.show(result.message || 'Er is een fout opgetreden', 'danger');
        }
      } catch (error) {
        this.notificationManager.show('Netwerkfout. Controleer uw internetverbinding.', 'danger');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    }
  }

  class ImageOptimizer {
    constructor() {
      this.init();
    }

    init() {
      document.querySelectorAll('img').forEach(img => {
        if (!img.classList.contains('img-fluid')) {
          img.classList.add('img-fluid');
        }

        const isLogo = img.classList.contains('c-logo__img');
        const isCritical = img.hasAttribute('data-critical');

        if (!img.hasAttribute('loading') && !isLogo && !isCritical) {
          img.setAttribute('loading', 'lazy');
        }

        img.addEventListener('error', this.handleImageError);
      });

      document.querySelectorAll('video').forEach(video => {
        if (!video.hasAttribute('loading')) {
          video.setAttribute('loading', 'lazy');
        }
      });
    }

    handleImageError(e) {
      const img = e.target;
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="#e9ecef" width="200" height="200"/><text x="50%" y="50%" fill="#6c757d" font-size="14" text-anchor="middle" dy=".3em">Image</text></svg>';
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
      img.style.objectFit = 'contain';
    }
  }

  class HeaderScroll {
    constructor() {
      this.header = document.querySelector('.l-header, .navbar');
      if (!this.header) return;
      
      this.init();
    }

    init() {
      let lastScroll = 0;

      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
          this.header.classList.add('is-scrolled');
        } else {
          this.header.classList.remove('is-scrolled');
        }

        lastScroll = currentScroll;
      }, { passive: true });
    }
  }

  class ScrollToTop {
    constructor() {
      this.createButton();
    }

    createButton() {
      const btn = document.createElement('button');
      btn.className = 'c-scroll-to-top';
      btn.setAttribute('aria-label', 'Scroll naar boven');
      btn.innerHTML = '↑';
      btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--color-accent);
        color: var(--color-primary);
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
        z-index: 999;
        box-shadow: var(--shadow-lg);
      `;

      btn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1)';
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
      });

      document.body.appendChild(btn);

      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          btn.style.opacity = '1';
          btn.style.visibility = 'visible';
        } else {
          btn.style.opacity = '0';
          btn.style.visibility = 'hidden';
        }
      }, { passive: true });
    }
  }

  class ActiveMenu {
    constructor() {
      this.init();
    }

    init() {
      const navLinks = document.querySelectorAll('.c-nav__link, .nav-link');
      const currentPath = location.pathname;

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        link.removeAttribute('aria-current');

        if (href === currentPath || 
            (currentPath === '/' && href === '/index.html') ||
            (currentPath === '/index.html' && href === '/')) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else if (href && href !== '#' && currentPath.indexOf(href) === 0 && href.length > 1) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    new BurgerMenu();
    new SmoothScroll();
    new ScrollSpy();
    new IntersectionAnimations();
    new HoverEffects();
    new CountUpAnimation();
    new FormManager();
    new ImageOptimizer();
    new HeaderScroll();
    new ScrollToTop();
    new ActiveMenu();

    if (typeof AOS !== 'undefined') {
      AOS.init({
        once: false,
        duration: CONFIG.ANIMATION.DURATION,
        easing: CONFIG.ANIMATION.EASING,
        offset: CONFIG.ANIMATION.OFFSET,
        mirror: false,
        disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();