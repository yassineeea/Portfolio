// Script principal pour le portfolio

// Fonction pour gérer le préchargeur
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(function() {
            preloader.classList.add('loaded');
        }, 500);
    }
});

// Fonction pour gérer le défilement fluide
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter le préchargeur au DOM
    if (!document.querySelector('.preloader')) {
        const preloader = document.createElement('div');
        preloader.className = 'preloader';
        preloader.innerHTML = '<div class="loader"></div>';
        document.body.appendChild(preloader);
    }
    
    // Ajouter le bouton de retour en haut
    const backToTopButton = document.createElement('div');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
    document.body.appendChild(backToTopButton);
    
    // Sélectionner tous les liens internes
    const links = document.querySelectorAll('a[href^="#"]');
    
    // Ajouter un gestionnaire d'événements à chaque lien
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtenir l'ID de la cible
            const targetId = this.getAttribute('href');
            
            // Si l'ID est juste "#", ne rien faire
            if (targetId === '#') return;
            
            // Sélectionner l'élément cible
            const target = document.querySelector(targetId);
            
            // Si la cible existe, faire défiler jusqu'à elle
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Ajuster pour la barre de navigation fixe
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Ajouter une classe active à la barre de navigation lors du défilement
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Afficher/masquer le bouton de retour en haut
        const backToTop = document.querySelector('.back-to-top');
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
        
        // Mettre à jour le lien actif dans la navigation
        updateActiveNavLink();
        
        // Animer les barres de compétences
        animateSkillBars();
        
        // Animer les cartes de projets et certifications
        animateOnScroll();
    });
    
    // Fonction pour mettre à jour le lien actif dans la navigation
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 200)) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href === '#' + currentSection || 
                (href === 'index.html' && currentSection === 'home') ||
                (href.includes(currentSection + '.html'))) {
                link.classList.add('active');
            }
        });
    }
    
    // Gérer le clic sur le bouton de retour en haut
    const backToTop = document.querySelector('.back-to-top');
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Initialiser la mise à jour du lien actif
    updateActiveNavLink();
    
    // Initialiser les animations
    setTimeout(function() {
        animateSkillBars();
        animateOnScroll();
    }, 1000);
});

// Animation des barres de compétences
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-level');
    
    skillBars.forEach(bar => {
        const barPosition = bar.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (barPosition < screenPosition) {
            const dataLevel = bar.getAttribute('data-level');
            if (dataLevel && bar.style.width === '0px') {
                bar.style.width = dataLevel;
            }
        }
    });
}

// Animation des cartes de projets et certifications
function animateOnScroll() {
    const cards = document.querySelectorAll('.project-card, .certification-card, .timeline-content');
    
    cards.forEach(card => {
        const cardPosition = card.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (cardPosition < screenPosition) {
            card.classList.add('animate');
        }
    });
}

// Optimisation des images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach(img => {
        img.setAttribute('src', img.getAttribute('data-src'));
        img.onload = function() {
            img.removeAttribute('data-src');
        };
    });
}

// Exécuter le chargement différé des images
window.addEventListener('load', lazyLoadImages);

// Fonction pour initialiser le calculateur d'émissions carbone (sera implémentée dans la page d'analyse de durabilité)
function initCarbonCalculator() {
    // Cette fonction sera implémentée lors de la création de la page d'analyse de durabilité
    console.log("Calculateur d'émissions carbone initialisé");
}
