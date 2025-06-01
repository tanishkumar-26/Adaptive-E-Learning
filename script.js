// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
    
    // Testimonial slider functionality
    const testimonialSlider = document.querySelector('.testimonials-slider');
    let isDown = false;
    let startX;
    let scrollLeft;
    
    testimonialSlider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - testimonialSlider.offsetLeft;
        scrollLeft = testimonialSlider.scrollLeft;
    });
    
    testimonialSlider.addEventListener('mouseleave', () => {
        isDown = false;
    });
    
    testimonialSlider.addEventListener('mouseup', () => {
        isDown = false;
    });
    
    testimonialSlider.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - testimonialSlider.offsetLeft;
        const walk = (x - startX) * 2;
        testimonialSlider.scrollLeft = scrollLeft - walk;
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form validation for contact form
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            if(name === '' || email === '' || message === '') {
                alert('Please fill in all fields');
                return;
            }
            
            if(!validateEmail(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Here you would typically send the form data to the server
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Login form validation
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            
            if(email === '' || password === '') {
                alert('Please fill in all fields');
                return;
            }
            
            if(!validateEmail(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Here you would typically send the login request to the server
            alert('Login functionality will be implemented in the backend');
        });
    }
    
    // Signup form validation
    const signupForm = document.getElementById('signup-form');
    if(signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value.trim();
            const confirmPassword = document.getElementById('signup-confirm-password').value.trim();
            
            if(name === '' || email === '' || password === '' || confirmPassword === '') {
                alert('Please fill in all fields');
                return;
            }
            
            if(!validateEmail(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            if(password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if(password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }
            
            // Here you would typically send the signup request to the server
            alert('Account created successfully! (This is a demo - backend implementation required)');
            signupForm.reset();
        });
    }
    
    // Email validation helper function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Course filter functionality
    const courseFilter = document.getElementById('course-filter');
    if(courseFilter) {
        courseFilter.addEventListener('change', function() {
            const filterValue = this.value.toLowerCase();
            const courseCards = document.querySelectorAll('.course-card');
            
            courseCards.forEach(card => {
                const category = card.getAttribute('data-category').toLowerCase();
                
                if(filterValue === 'all' || category.includes(filterValue)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});