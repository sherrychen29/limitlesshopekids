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