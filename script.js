// ── Gallery ────────────────────────────────────────
// Reads media/gallery/ directly from GitHub — no scripts, no manifests.
// Just push photos into media/gallery/ and they appear automatically.
(function initGallery() {
    const GITHUB_API = 'https://api.github.com/repos/sherrychen29/limitlesshopekids/contents/media/gallery';
    const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|gif|avif)$/i;

    const fallbackPhotos = ['media/empty.jpg'];

    const heights = ['h-medium', 'h-tall', 'h-short', 'h-medium', 'h-short', 'h-tall', 'h-medium', 'h-tall', 'h-short', 'h-medium', 'h-tall', 'h-short'];
    const tilts   = [-1.8, 1.2, -0.8, 2, -1.5, 0.9, -2, 1.5, -0.5, 1.8, -1.2, 0.6];

    // The original photos are full-resolution (often 6000px / 10MB+). Route them
    // through a free image-resizing CDN so the browser only downloads a small,
    // web-optimized WebP instead of the multi-megabyte original.
    function optimized(url, height) {
        if (!/^https?:\/\//i.test(url)) return url; // local fallbacks: leave as-is
        return 'https://wsrv.nl/?url=' + encodeURIComponent(url) +
               '&h=' + height + '&q=78&output=webp&we';
    }

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
        lb.classList.add('open', 'loading');
        document.body.style.overflow = 'hidden';

        // Show the spinner until the (larger) image has finished downloading.
        img.onload = () => lb.classList.remove('loading');
        img.onerror = () => lb.classList.remove('loading');
        img.src = optimized(src, 1400);
        if (img.complete && img.naturalWidth) lb.classList.remove('loading');
    }

    function closeLightbox() {
        const lb  = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        lb.classList.remove('open', 'loading');
        img.onload = null;
        img.onerror = null;
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

        // Eagerly load the photos that are visible on first paint so they
        // appear immediately; everything off-screen stays lazy.
        const approxPhotoWidth = 240;
        const eagerCount = Math.ceil(window.innerWidth / approxPhotoWidth) + 2;

        items.forEach((src, i) => {
            const card = document.createElement('div');
            card.className = `gallery-photo ${heights[i % heights.length]}`;
            card.style.transform = `rotate(${tilts[i % tilts.length]}deg)`;
            card.style.marginTop = (i % 3 === 1) ? '10px' : '0';
            card.addEventListener('click', () => openLightbox(src));

            const img = document.createElement('img');
            img.alt = 'Gallery moment';
            const isVisible = i < eagerCount;
            img.loading = isVisible ? 'eager' : 'lazy';
            img.setAttribute('fetchpriority', isVisible ? 'high' : 'low');
            img.decoding = 'async';
            img.onerror = () => { card.style.display = 'none'; };
            img.src = optimized(src, 640);

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
        { name: 'The Autism Centre of Toronto', url: 'https://www.autismtoronto.ca/', image: 'media/partners/tact.png' },
        { name: 'PawsNatural', url: 'https://pawsnatural.ca/', image: 'media/partners/pawsnatural.avif' },
        { name: 'Holland Bloorview', url: 'https://hollandbloorview.ca/', image: 'media/partners/hollandbloorview.png' },
        { name: 'Circles & Squares', url: 'https://www.circlesandsquares.ca/', image: 'media/partners/circlesandsquares.jpg' },
        { name: 'Caring 4 Caregivers', url: 'https://www.instagram.com/caring.forcaregivers/', image: 'media/partners/caring4caregivers.jpg' },
        { name: 'Toronto High Park FC', url: 'https://www.thpfc.ca/', image: 'media/partners/highparkfc.png' },
        { name: 'Variety Village', url: 'https://www.varietyvillage.ca/', image: 'media/partners/varietyvillage.png' },
        { name: 'Autism Ontario', url: 'https://www.autismontario.com/', image: 'media/partners/autismontario.png' },
        { name: 'Cookies 4 Care', url: 'https://www.instagram.com/cookies_4care/', image: 'media/partners/cookies4care.jpg' }
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

// ── Team carousel ─────────────────────────────────
(function initTeamCarousel() {
    const track = document.getElementById('teamCarouselTrack');
    const prev = document.getElementById('teamCarouselPrev');
    const next = document.getElementById('teamCarouselNext');
    if (!track || !prev || !next) return;

    function updateButtons() {
        const maxScroll = track.scrollWidth - track.clientWidth;
        const canScroll = maxScroll > 1;
        prev.disabled = !canScroll || track.scrollLeft <= 1;
        next.disabled = !canScroll || track.scrollLeft >= maxScroll - 1;
    }

    prev.addEventListener('click', () => {
        track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
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

// ── SnapWidget: recalc iframe height when container width changes ──
(function initSnapWidgetResize() {
    const iframe = document.querySelector('.snapwidget-widget');
    if (!iframe) return;

    function resizeWidget() {
        if (iframe.iFrameResizer) {
            iframe.iFrameResizer.resize();
        }
    }

    window.addEventListener('load', () => setTimeout(resizeWidget, 600));
    window.addEventListener('resize', resizeWidget);
})();