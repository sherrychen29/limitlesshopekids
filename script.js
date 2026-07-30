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
        if (!lb || !img) return;
        lb.classList.remove('open', 'loading');
        img.onload = null;
        img.onerror = null;
        img.src = '';
        document.body.style.overflow = '';
    }

    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxBackdrop = document.getElementById('lightboxBackdrop');
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    const galleryRow1 = document.getElementById('galleryRow1');
    const galleryRow2 = document.getElementById('galleryRow2');
    if (!galleryRow1 && !galleryRow2) return;

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
            card.className = `gallery-photo ${heights[i % heights.length]} loading`;
            card.style.transform = `rotate(${tilts[i % tilts.length]}deg)`;
            card.style.marginTop = (i % 3 === 1) ? '10px' : '0';
            card.addEventListener('click', () => openLightbox(src));

            const loader = document.createElement('div');
            loader.className = 'gallery-photo-loader';
            loader.setAttribute('aria-hidden', 'true');

            const img = document.createElement('img');
            img.alt = 'Gallery moment';
            const isVisible = i < eagerCount;
            img.loading = isVisible ? 'eager' : 'lazy';
            img.setAttribute('fetchpriority', isVisible ? 'high' : 'low');
            img.decoding = 'async';

            function markLoaded() {
                card.classList.remove('loading');
                card.classList.add('loaded');
            }

            img.onload = markLoaded;
            img.onerror = () => { card.style.display = 'none'; };
            img.src = optimized(src, 640);
            if (img.complete && img.naturalWidth) markLoaded();

            card.appendChild(loader);
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

    function getScrollStep() {
        const card = track.querySelector('.team-member-secondary-wrapper');
        if (!card) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 22;
        return card.offsetWidth + gap;
    }

    function updateButtons() {
        const maxScroll = track.scrollWidth - track.clientWidth;
        const canScroll = maxScroll > 1;
        prev.disabled = !canScroll || track.scrollLeft <= 1;
        next.disabled = !canScroll || track.scrollLeft >= maxScroll - 1;
    }

    prev.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
        track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
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
// ── Events list ───────────────────────────────────
// Add new events to SITE_EVENTS. Homepage shows the 5 most recent; events.html shows all.
(function initEventsList() {
    const SITE_EVENTS = [
        {
            date: '2026-07-28',
            label: 'July 28 2026',
            text: 'Dropped off <b>114 handmade donations</b> (57 cards and 57 crafts) to Variety Village to be distrubuted to kids in theirAdventure Partners program.'
        },
        {
            date: '2026-07-19',
            label: 'July 19 2026',
            text: 'Hosted bake sale collab event with Cookies 4 Care at Eglinton Park, <b>raising $176</b> for Holland Bloorview Kids Rehabilitation Hospital.'
        },
        {
            date: '2026-07-11',
            label: 'July 11 2026',
            text: 'Hosted Cards & Crafts event at North York Library with 53 volunteers, creating <b>114 handmade creations</b> (57 cards and 57 crafts).'
        },
        {
            date: '2026-07-09',
            label: 'July 9 2026',
            text: 'Interviewed <b>Kingston Chui</b>, Founder of Toronto IBI for Spotlight Series #5.'
        },
        {
            date: '2026-06-19',
            label: 'June 19 2026',
            text: 'Dropped off <b>110 handmade donations</b> (50 cards and 50 cards) to The Autism Centre of Toronto (TACT) to be distrubuted to kids in their programs.'
        },
        {
            date: '2026-06-06',
            label: 'June 6 2026',
            text: 'Hosted Cards & Crafts event at North York Library with <b>42 volunteers</b>, creating <b>100 handmade creations</b> (50 cards and 50 crafts).'
        },
        {
            date: '2026-03-27',
            label: 'February 27 2026',
            text: 'Interviewed <b>Ashlyn Turco</b>, volunteer Holland Bloorview Kids Rehabilitation Hospital for Spotlight Series #4.'
        },
        {
            date: '2026-03-26',
            label: 'February 26 2026',
            text: 'Interviewed <b>Shannon Crossman</b>, Artist & Program coordinator at Holland Bloorview Kids Rehabilitation Hospital for Spotlight Series #3.'
        },
        {
            date: '2026-03-17',
            label: 'February 17 2026',
            text: 'Interviewed <b>Sherry Chen</b>, our co-founder for Spotlight Series #1. Interviewed <b>Emma Kolada</b>, our Events Executive and Summer Camp Counselor at UCC Camps for Spotlight Series #2.'
        }, 
        {
            date: '2026-03-11',
            label: 'March 11 2026',
            text: 'Launched <b>Spotlight Series</b> interview initiative to spread awareness about experiences and strategies that help caregivers and individuals support neurodivergent children.'
        },
        {
            date: '2026-02-12',
            label: 'February 12 2026',
            text: 'Dropped off <b>10 carebasket donations</b> to Holland Bloorview Kids Rehabilitation Hosptial to be distrubuted to staff for our collab with Caring 4 Caregivers.'
        },
        {
            date: '2026-02-09',
            label: 'February 9 2026',
            text: 'Received baked goods donation of $50+ value from <b>Circles and Squares Bakery</b> to support our carebaskets for Holland Bloorview Kids Rehabilitation Hospital for our collab with Caring 4 Caregivers.'
        },
        {
            date: '2026-01-31',
            label: 'January 31 2026',
            text: 'Hosted Carebasket Making event at North York Library with <b>77 volunteers</b>, creating <b>83 cards and 10 carebaskets</b> for Holland Bloorview Kids Rehabilitation Hospital.'
        },
        {
            date: '2025-12-31',
            label: 'December 31 2025',
            text: 'Received donation of items of <b>$100+ value</b> from <b>PawsNatural Pet Store</b> to support our carebaskets for Holland Bloorview Kids Rehabilitation Hospital.'
        },
        {
            date: '2025-10-24',
            label: 'October 24 2025',
            text: 'Hosted bake sale event at Eglinton Park, <b>fundraised $215</b> for Holland Bloorview Kids Rehabilitation Hospital.'
        },
        {
            date: '2025-10-19',
            label: 'October 19 2025',
            text: 'Partnered <b>Caring 4 Caregivers</b> (California-based organization), to donate carebaskets to staff supporting neurodivergent children.'
        },
        {
            date: '2025-10-10',
            label: 'October 10 2025',
            text: 'Hosted bake sale event at Eglinton Park, <b>fundraised $195</b> for Holland Bloorview Kids Rehabilitation Hospital.'
        },
        {
            date: '2025-04-27',
            label: 'April 27 2025',
            text: 'Hosted our first ever bake sale and scavenger hunt event at Eglinton Park, <b>fundraised $136</b> for Holland Bloorview Kids Rehabilitation Hospital.'
        },
        {
            date: '2025-03-08',
            label: 'March 8 2025',
            text: '<b>Sherry Chen</b> and <b>Paige Wanniappa</b> founded Limitless Hope Kids to support kids experiencing disabilities! For Sherry, she wanted to help children like her brother, and partnered with Paige to bring this vision to life.'
        },


    ];

    const sorted = [...SITE_EVENTS].sort((a, b) => b.date.localeCompare(a.date));

    function renderEvents(listEl, events) {
        if (!listEl) return;
        listEl.innerHTML = events.map((event) =>
            `<li><strong>${event.label}:</strong> ${event.text}</li>`
        ).join('');
    }

    renderEvents(document.getElementById('eventsListPreview'), sorted.slice(0, 5));
    renderEvents(document.getElementById('eventsListFull'), sorted);
})();
