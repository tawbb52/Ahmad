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
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const cardTitle = this.closest('.card').querySelector('h3').textContent;
        const confirmOpen = confirm(`هل تريد فتح: ${cardTitle}؟\n\nسيتم فتح صفحة البث المباشر`);
        
        if (confirmOpen) {
            // Open streaming link
            const streamingUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            window.open(streamingUrl, '_blank');
            console.log(`✅ تم فتح: ${cardTitle}`);
        }
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

// Live match timer
function updateLiveMatchTimers() {
    const liveCards = document.querySelectorAll('.card.live .time');
    
    liveCards.forEach(timeElement => {
        const text = timeElement.textContent;
        if (text.includes('الآن')) {
            // Update elapsed time
            const currentTime = new Date().toLocaleTimeString('ar-SA');
            timeElement.textContent = '⏰ ' + currentTime;
        }
    });
}

setInterval(updateLiveMatchTimers, 1000);

// Search functionality
function searchContent(query) {
    const cards = document.querySelectorAll('.card');
    const results = [];
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        if (title.includes(query.toLowerCase())) {
            results.push(title);
        }
    });
    
    return results;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Live Sports Website Loaded Successfully!');
    console.log('🎬 Ready to stream!');
    console.log('📺 Click on watch buttons to stream');
    
    // Set first nav link as active
    const firstNavLink = document.querySelector('.navbar a');
    if (firstNavLink) {
        firstNavLink.classList.add('active');
    }
});