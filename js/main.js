/* ========================================
   AVENTURA GLOBAL - Main JavaScript
   ======================================== */

(function () {
    'use strict';

    /* ---------- Scroll Progress Bar ---------- */
    var progressBar = document.getElementById('progressBar');

    function updateProgressBar() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }

    window.addEventListener('scroll', updateProgressBar, { passive: true });

    /* ---------- Cursor Glow ---------- */
    var cursorGlow = document.getElementById('cursorGlow');

    if (cursorGlow) {
        document.addEventListener('mousemove', function (e) {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    /* ---------- 3D Card Tilt ---------- */
    var tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(function (card) {
        var glowEl = card.querySelector('.destino-card__glow, .paquete-card__glow, .review-card__glow, .contacto__form-glow');

        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;

            var rotateX = ((y - centerY) / centerY) * -6;
            var rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-10px)';

            if (glowEl) {
                var angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 180;
                card.style.setProperty('--glow-angle', angle + 'deg');
            }
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
            card.style.removeProperty('--glow-angle');
        });
    });

    /* ---------- Carrusel Hero ---------- */
    var slidesContainer = document.querySelector('.hero__slides');
    var slides = document.querySelectorAll('.hero__slide');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    var dotsContainer = document.getElementById('heroDots');

    var currentSlide = 0;
    var autoPlayInterval = null;
    var totalSlides = slides.length;
    var AUTOPLAY_DELAY = 5000;

    function setActiveSlide(index) {
        slides.forEach(function (s) { s.classList.remove('hero__slide--active'); });
        if (slides[index]) {
            slides[index].classList.add('hero__slide--active');
        }
    }

    function createDots() {
        for (var i = 0; i < totalSlides; i++) {
            var dot = document.createElement('button');
            dot.classList.add('hero__dot');
            dot.setAttribute('aria-label', 'Ir a slide ' + (i + 1));
            if (i === 0) dot.classList.add('hero__dot--active');
            dot.addEventListener('click', (function (index) {
                return function () {
                    goToSlide(index);
                    resetAutoPlay();
                };
            })(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        var dots = document.querySelectorAll('.hero__dot');
        dots.forEach(function (dot, index) {
            dot.classList.toggle('hero__dot--active', index === currentSlide);
        });
    }

    function goToSlide(index) {
        currentSlide = index;
        slidesContainer.style.transform = 'translateX(-' + (currentSlide * 100 / totalSlides) + '%)';
        updateDots();
        setActiveSlide(currentSlide);
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(currentSlide);
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    if (slidesContainer && slides.length > 0) {
        createDots();
        setActiveSlide(0);

        prevBtn.addEventListener('click', function () {
            prevSlide();
            resetAutoPlay();
        });

        nextBtn.addEventListener('click', function () {
            nextSlide();
            resetAutoPlay();
        });

        startAutoPlay();

        var heroSection = document.querySelector('.hero');
        heroSection.addEventListener('mouseenter', stopAutoPlay);
        heroSection.addEventListener('mouseleave', startAutoPlay);

        var touchStartX = 0;
        var touchEndX = 0;

        heroSection.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        }, { passive: true });

        heroSection.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
            startAutoPlay();
        }, { passive: true });
    }

    /* ---------- Animated Stat Counters ---------- */
    var statNumbers = document.querySelectorAll('.stat-card__number[data-target]');
    var statsAnimated = false;

    function animateCounters() {
        if (statsAnimated) return;
        statsAnimated = true;

        statNumbers.forEach(function (el) {
            var target = parseFloat(el.getAttribute('data-target'));
            var isDecimal = el.hasAttribute('data-decimal');
            var duration = 2000;
            var startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = eased * target;

                if (isDecimal) {
                    el.textContent = current.toFixed(1);
                } else {
                    el.textContent = Math.floor(current).toLocaleString('es-CO');
                }

                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }

            requestAnimationFrame(step);
        });
    }

    var statsSection = document.querySelector('.stats');
    if (statsSection) {
        var statsObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }

    /* ---------- FAQ Accordion ---------- */
    var faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
        var trigger = item.querySelector('.faq-item__trigger');
        if (!trigger) return;

        trigger.addEventListener('click', function () {
            var isActive = item.classList.contains('faq-item--active');

            faqItems.forEach(function (other) {
                other.classList.remove('faq-item--active');
            });

            if (!isActive) {
                item.classList.add('faq-item--active');
            }
        });
    });

    /* ---------- Navegación Móvil ---------- */
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('header__nav--active');
            navToggle.classList.toggle('header__toggle--active');
        });

        var navLinks = navMenu.querySelectorAll('.header__link');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('header__nav--active');
                navToggle.classList.remove('header__toggle--active');
            });
        });

        document.addEventListener('click', function (e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('header__nav--active');
                navToggle.classList.remove('header__toggle--active');
            }
        });
    }

    /* ---------- Header Scroll Effect ---------- */
    var header = document.querySelector('.header');

    window.addEventListener('scroll', function () {
        var currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.background = 'rgba(6, 6, 14, 0.95)';
            header.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
        } else {
            header.style.background = 'rgba(6, 6, 14, 0.8)';
            header.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
        }
    }, { passive: true });

    /* ---------- Scroll Reveal Animation ---------- */
    var observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    };

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var delay = entry.target.dataset.delay || 0;
                setTimeout(function () {
                    entry.target.classList.add('revealed');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    var revealElements = document.querySelectorAll('.destino-card, .paquete-card, .review-card, .galeria__item, .contacto__form, .contacto__info-item');
    revealElements.forEach(function (el, index) {
        var baseDelay = 0;
        if (el.classList.contains('destino-card') || el.classList.contains('paquete-card') || el.classList.contains('review-card') || el.classList.contains('galeria__item')) {
            baseDelay = (index % 3) * 120;
        }
        el.dataset.delay = baseDelay;
        revealObserver.observe(el);
    });

    /* ---------- Formulario de Contacto ---------- */
    var contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var nombre = document.getElementById('nombre').value.trim();
            var email = document.getElementById('email').value.trim();
            var mensaje = document.getElementById('mensaje').value.trim();

            if (!nombre || !email || !mensaje) {
                alert('Por favor, completa todos los campos obligatorios.');
                return;
            }

            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, ingresa un correo electrónico válido.');
                return;
            }

            alert('¡Gracias, ' + nombre + '! Hemos recibido tu mensaje. Nos pondremos en contacto contigo pronto.');
            contactForm.reset();
        });
    }

    /* ---------- Active Nav Link on Scroll ---------- */
    var sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        var scrollPosition = window.pageYOffset + 120;

        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                var navLinksAll = document.querySelectorAll('.header__link');
                navLinksAll.forEach(function (link) {
                    link.style.color = '';
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.style.color = 'var(--color-neon)';
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

})();
