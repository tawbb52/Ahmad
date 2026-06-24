// Navigation functionality
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links
        document.querySelectorAll('.navbar a').forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Scroll to section
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Watch button functionality
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function() {
        const cardTitle = this.closest('.card').querySelector('h3').textContent;
        alert(`🎬 يتم فتح: ${cardTitle}\n\nشكراً لاستخدام Live Sports!`);
    });
});

// Update active nav on scroll
window.addEventListener('scroll', () => {
    let current = '';
    
    document.querySelectorAll('.section').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.navbar a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Live Sports Website Loaded Successfully!');
    console.log('🎬 Ready to stream!');
    
    // Set first nav link as active
    document.querySelector('.navbar a').classList.add('active');
});