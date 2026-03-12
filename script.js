// ── Gallery ────────────────────────────────────────
// Reads media/gallery/ directly from GitHub — no scripts, no manifests.
// Just push photos into media/gallery/ and they appear automatically.
(function initGallery() {
    const GITHUB_API = 'https://api.github.com/repos/sherrychen29/limitlesshopekids/contents/media/gallery';
    const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|gif|avif)$/i;

    const fallbackPhotos = ['media/empty.jpg'];

    const heights = ['h-medium', 'h-tall', 'h-short', 'h-medium', 'h-short', 'h-tall', 'h-medium', 'h-tall', 'h-short', 'h-medium', 'h-tall', 'h-short'];
    const tilts   = [-1.8, 1.2, -0.8, 2, -1.5, 0.9, -2, 1.5, -0.5, 1.8, -1.2, 0.6];

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function openLightbox(src) {
        const lb  = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        img.src = src;
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lb  = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        lb.classList.remove('open');
        img.src = '';
        document.body.style.overflow = '';
    }

    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxBackdrop').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    function buildRow(rowEl, photos) {
        const minRepeat = Math.max(3, Math.ceil(14 / photos.length));
        let set = [];
        for (let i = 0; i < minRepeat; i++) set = set.concat(photos);
        const items = [...set, ...set];

        items.forEach((src, i) => {
            const card = document.createElement('div');
            card.className = `gallery-photo ${heights[i % heights.length]}`;
            card.style.transform = `rotate(${tilts[i % tilts.length]}deg)`;
            card.style.marginTop = (i % 3 === 1) ? '10px' : '0';
            card.addEventListener('click', () => openLightbox(src));

            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Gallery moment';
            img.loading = 'lazy';
            img.onerror = () => { card.style.display = 'none'; };

            card.appendChild(img);
            rowEl.appendChild(card);
        });
    }

    function renderGallery(photos) {
        const row1 = document.getElementById('galleryRow1');
        const row2 = document.getElementById('galleryRow2');
        if (row1) buildRow(row1, shuffle(photos));
        if (row2) buildRow(row2, shuffle(photos));
    }

    fetch(GITHUB_API)
        .then(res => {
            if (!res.ok) throw new Error('API error');
            return res.json();
        })
        .then(files => {
            const photos = files
                .filter(f => f.type === 'file' && IMAGE_EXTS.test(f.name))
                .map(f => f.download_url);
            renderGallery(photos.length ? photos : fallbackPhotos);
        })
        .catch(() => renderGallery(fallbackPhotos));
})();
// ── End Gallery ────────────────────────────────────

// ── Local Supporters (dynamic list: add entries + image in media/localsupporters to show more) ──
(function initLocalSupporters() {
    const LOCAL_SUPPORTERS = [
        { name: 'PawsNatural', url: 'https://pawsnatural.ca/', image: 'media/localsupporters/pawsnatural.avif' },
        { name: 'Holland Bloorview', url: 'https://hollandbloorview.ca/', image: 'media/localsupporters/hollandbloorview.png' },
        { name: 'Circles & Squares', url: 'https://www.circlesandsquares.ca/', image: 'media/localsupporters/circlesandsquares.jpg' }
    ];

    const container = document.getElementById('local-supporters-logos');
    if (!container) return;

    LOCAL_SUPPORTERS.forEach(function (s) {
        const a = document.createElement('a');
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'local-supporter-link';
        a.setAttribute('aria-label', 'Visit ' + s.name);

        const img = document.createElement('img');
        img.src = s.image;
        img.alt = s.name;
        img.loading = 'lazy';
        img.className = 'local-supporter-logo';

        a.appendChild(img);
        container.appendChild(a);
    });
})();
// ── End Local Supporters ────────────────────────────

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 100;
        const sectionTop = section.offsetTop;

        window.scrollTo({
            top: sectionTop - navbarHeight - 20,
            behavior: 'smooth'
        });
    }
}

// Update active nav link based on scroll position
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    let current = '';
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 100;
    const scrollPosition = window.pageYOffset + navbarHeight + 50;

    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const nextSection = sections[index + 1];
        const nextSectionTop = nextSection ? nextSection.offsetTop : Infinity;

        // For short sections (like impact), use a larger buffer zone
        const isShortSection = sectionHeight < 150;
        const buffer = isShortSection ? 150 : 50;

        // Check if we're in this section
        if (scrollPosition >= sectionTop - buffer && scrollPosition < nextSectionTop - buffer) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// Run on scroll and on page load
window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// ── Navbar compact on scroll ──────────────────────
(function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    function onScroll() {
        navbar.classList.toggle('scrolled', window.pageYOffset > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// ── Hamburger menu ────────────────────────────────
(function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', e => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
})();

// ── Scroll-reveal animations ──────────────────────
(function initReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ── Impact counter animation ──────────────────────
(function initCounters() {
    function animateCounter(el) {
        const original = el.textContent.trim();
        const numStr   = original.replace(/[^0-9]/g, '');
        const target   = parseInt(numStr, 10);
        if (!target) return;

        const prefix = original.startsWith('$') ? '$' : '';
        const suffix = original.endsWith('+')   ? '+' : '';
        const duration = 1800;
        const startTime = performance.now();

        function tick(now) {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = Math.round(eased * target);
            el.textContent = prefix + current.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = original;
        }

        requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.impact-number').forEach(animateCounter);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const impactSection = document.querySelector('.impact-section');
    if (impactSection) observer.observe(impactSection);
})();

// ── Back to top ───────────────────────────────────
(function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.pageYOffset > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();