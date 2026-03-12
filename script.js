// ── Gallery ────────────────────────────────────────
// Photos are read dynamically from media/gallery/manifest.json.
// Whenever you add/remove photos from media/gallery/, run:
//   node generate-gallery.js
// in your terminal to update the manifest, then commit both files.
(function initGallery() {
    const MANIFEST = 'media/gallery/manifest.json';
    const GALLERY_DIR = 'media/gallery/';

    const fallbackPhotos = [
        'media/empty.jpg',
    ];

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

    function buildRow(rowEl, photos) {
        // Repeat photos enough times so the track fills the screen several times over,
        // then duplicate the full set for the seamless -50% loop animation.
        const minRepeat = Math.max(3, Math.ceil(14 / photos.length));
        let set = [];
        for (let i = 0; i < minRepeat; i++) set = set.concat(photos);

        // Duplicate for seamless infinite loop (animation shifts by -50%)
        const items = [...set, ...set];

        items.forEach((src, i) => {
            const card = document.createElement('div');
            card.className = `gallery-photo ${heights[i % heights.length]}`;
            card.style.transform = `rotate(${tilts[i % tilts.length]}deg)`;
            card.style.marginTop = (i % 3 === 1) ? '10px' : '0';

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

    fetch(MANIFEST)
        .then(res => {
            if (!res.ok) throw new Error('no manifest');
            return res.json();
        })
        .then(filenames => {
            const photos = filenames.map(f => GALLERY_DIR + f);
            renderGallery(photos.length ? photos : fallbackPhotos);
        })
        .catch(() => {
            renderGallery(fallbackPhotos);
        });
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