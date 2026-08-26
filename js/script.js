const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Navegación responsive
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

function setMenuOpen(open) {
    hamburger.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
}

hamburger.addEventListener('click', () => {
    setMenuOpen(!navMenu.classList.contains('active'));
});

navLinks.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        setMenuOpen(false);
        hamburger.focus();
    }
});

document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
        setMenuOpen(false);
    }
});

// Fondo del navbar al hacer scroll: un sentinel evita escuchar 'scroll' continuamente
const scrollSentinel = document.getElementById('scrollSentinel');
if (scrollSentinel && navbar) {
    new IntersectionObserver(([entry]) => {
        navbar.classList.toggle('scrolled', !entry.isIntersecting);
    }).observe(scrollSentinel);
}

// Scrollspy: resalta el enlace de la sección visible sin listeners de scroll
const sections = document.querySelectorAll('section[id]');
if (sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(section => sectionObserver.observe(section));
}

// Scroll suave a secciones, compensando la altura real (variable) del navbar fijo
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight + 12 : 0;
        window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.pageYOffset - offset,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });
});

// Revelado suave al hacer scroll (una sola vez por elemento)
const revealTargets = document.querySelectorAll('.reveal');
if (revealTargets.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach(el => el.classList.add('is-visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        revealTargets.forEach(el => revealObserver.observe(el));
    }
}

// Filtrado de proyectos
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');

        const filterValue = button.getAttribute('data-filter');

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const matches = filterValue === 'all' || category === filterValue;

            if (matches) {
                card.style.display = 'block';
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, prefersReducedMotion ? 0 : 300);
            }
        });
    });
});

// Modal para visualización de proyectos
const modal = document.getElementById('projectModal');
const modalContent = modal.querySelector('.modal-content');
const closeModalBtn = modal.querySelector('.close-modal');
const viewButtons = document.querySelectorAll('.view-btn');
const modalBody = document.getElementById('modalBody');
let lastFocusedElement = null;

function openModal(triggerButton, content) {
    lastFocusedElement = triggerButton;
    modalBody.innerHTML = content;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    closeModalBtn.focus();
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    if (lastFocusedElement) lastFocusedElement.focus();
}

viewButtons.forEach(button => {
    button.addEventListener('click', () => {
        const src = button.getAttribute('data-src');
        const type = button.getAttribute('data-type');

        let content = '';

        if (type === 'image') {
            content = `
                <h2>Vista Previa del Proyecto</h2>
                <div class="modal-image">
                    <img src="${src}" alt="Vista previa del proyecto">
                </div>
                <div class="modal-details">
                    <p>Para descargar el proyecto completo, haz clic en el botón "Descargar" en la tarjeta del proyecto.</p>
                    <div class="modal-actions">
                        <a href="${src}" download class="btn btn-primary">
                            <i class="fas fa-download" aria-hidden="true"></i> Descargar Imagen
                        </a>
                    </div>
                </div>
            `;
        } else if (type === 'pdf') {
            content = `
                <h2>Documento PDF</h2>
                <div class="modal-details">
                    <p>Este es un documento PDF. Para verlo completo, haz clic en el botón "Descargar" en la tarjeta del proyecto.</p>
                    <div class="modal-actions">
                        <a href="${src}" download class="btn btn-primary">
                            <i class="fas fa-download" aria-hidden="true"></i> Descargar PDF
                        </a>
                    </div>
                </div>
            `;
        }

        openModal(button, content);
    });
});

closeModalBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (modal.style.display !== 'flex') return;

    if (e.key === 'Escape') {
        closeModal();
        return;
    }

    // Foco atrapado dentro del modal mientras está abierto
    if (e.key === 'Tab') {
        const focusable = modalContent.querySelectorAll('a[href], button, input, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

// Formulario de contacto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    function showFormMessage(kind, title, text) {
        const existing = contactForm.parentNode.querySelector('.form-message');
        if (existing) existing.remove();

        const message = document.createElement('div');
        message.className = 'form-message';
        message.setAttribute('role', 'status');
        message.innerHTML = `
            <i class="fas ${kind === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}" aria-hidden="true"></i>
            <h4>${title}</h4>
            <p>${text}</p>
        `;

        message.style.cssText = `
            background: rgba(35, 66, 114, 0.35);
            border: 1px solid rgba(205, 137, 158, 0.3);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            text-align: center;
            margin-top: 1.5rem;
        `;

        message.querySelector('h4').style.cssText = `
            color: var(--orchid-smoke);
            margin-bottom: 0.5rem;
        `;

        message.querySelector('p').style.cssText = `
            color: var(--sakura);
            margin-bottom: 0;
        `;

        message.querySelector('i').style.cssText = `
            font-size: 2rem;
            color: var(--orchid-smoke);
            margin-bottom: 1rem;
        `;

        contactForm.parentNode.insertBefore(message, contactForm.nextSibling);

        setTimeout(() => {
            message.remove();
        }, 6000);
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validación básica (excluye el honeypot anti-spam "_gotcha": es type="text"
        // oculto por CSS, no type="hidden", así que hay que descartarlo por nombre)
        const inputs = contactForm.querySelectorAll('input:not([type="hidden"]):not([name="_gotcha"]), textarea');
        let valid = true;

        inputs.forEach(input => {
            const fieldValid = Boolean(input.value.trim());
            input.classList.toggle('input-error', !fieldValid);
            if (!fieldValid) valid = false;
        });

        if (!valid) {
            showFormMessage('error', 'Faltan datos', 'Por favor, completa todos los campos del formulario.');
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Enviando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showFormMessage('success', '¡Mensaje enviado con éxito!', 'Te contactaré pronto. Gracias por tu mensaje.');
                contactForm.reset();
            } else {
                showFormMessage('error', 'No se pudo enviar el mensaje', 'Por favor, inténtalo de nuevo o escríbeme directamente por correo.');
            }
        } catch (error) {
            showFormMessage('error', 'No se pudo enviar el mensaje', 'Revisa tu conexión a internet e inténtalo de nuevo.');
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    });
}

// Enlace activo inicial en la navegación (antes de que el scrollspy reaccione)
const currentSection = document.querySelector('section[id]');
if (currentSection) {
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentSection.id}`);
    });
}
