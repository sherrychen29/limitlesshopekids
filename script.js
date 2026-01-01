function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ 
        behavior: 'smooth' 
    });
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