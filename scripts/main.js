// import Gallery from './Gallery.js'
"use strict"

class Navigation {
    constructor () {
        this.screenHeight =  window.innerHeight;

        this.navigationContainer = document.getElementById('navigation_container');

        this.aboutUsNavItem = document.getElementById('about_us');
        this.deployNavItem = document.getElementById('deploy');
        this.activitiesNavItem  = document.getElementById('activities');

        this.allNavItems = document.getElementsByClassName('js_navigation_item');

        this.aboutUsSectionBottomGap = this.aboutUsNavItem.offsetTop;
        this.deploySectionBottomGap = this.deployNavItem.offsetTop;
        this.activitiesSectionBottomGap  = this.activitiesNavItem.offsetTop;

        this.oldScroll = 0;
        this.scrollY = 0;
        this.delta = 110; //px for scroll reacting

        this.addEventListeners()

    }

    addEventListeners = () => {
        window.addEventListener('scroll', this.scrollHandler)
    };

    scrollHandler = event => {
        this.scrollY = pageYOffset;
        let diff = this.oldScroll - this.scrollY;

        // If scolled too little - do nothing
        if (Math.abs(diff) <= this.delta) return;

        // menu types switcher
        if (this.scrollY > this.aboutUsSectionBottomGap -200) this.navigationContainer.classList.add('scrolled');
        if (this.scrollY <= this.aboutUsSectionBottomGap) this.navigationContainer.classList.remove('scrolled');


        this.oldScroll = this.scrollY;
    }

    activateNavItem = item => {
        allNavItems.forEach(item => item.classList.remove('active'));
        item.classList.add('active');
    };
}



class GallerySeo {
//todo font color as prop, add flag for description position (vertical and horisontal) and text-align
    constructor(containerSelector, delay) {
        this.container = document.getElementsByClassName(containerSelector)[0];
        if (!this.container) return;

        this.slidesArray = this.container.querySelectorAll('.js_gallery_card');

        if (this.slidesArray.length === 0) return;

        this.galleryLength = this.slidesArray.length;
        this.currentTopSlideIndex = 0;
        this.zIndex = this.galleryLength - 1;
        this.delay = delay;

        this.galleryItems = [];
        this.galleryPoints = [];
        this.galleryControls = null;

        this.init();

        // Для галереи с одним изображением таймер и точки навигации не нужны.
        if (this.galleryLength > 1) {
            this.timer = setInterval(this.nextSlide, this.delay);
        }
    }

//todo handle swipe;

    init = () => {

        //defining z-index of slides
        this.slidesArray.forEach((slide, index) => {
            slide.style.zIndex = this.zIndex;
            this.galleryItems.push(slide);

            this.zIndex--;
        });


        if (this.galleryLength === 1) {
            this.zIndex = 1;
            return;
        }

        // Создание точек навигации для существующих HTML-слайдов.
        this.galleryControls = document.createElement('div');
        this.galleryControls.setAttribute('class', 'gallery-controls');
        this.container.appendChild(this.galleryControls);

        this.slidesArray.forEach((point, index) => {
            const slidePoint = document.createElement('div');
            slidePoint.setAttribute('class', 'gallery-point');
            slidePoint.dataset.index = index;

            if (index === this.currentTopSlideIndex) slidePoint.classList.add('active');
            slidePoint.addEventListener('click', () => this.setCustomSlide(index));

            this.galleryPoints.push(slidePoint);
            this.galleryControls.appendChild(slidePoint);
        });

        this.zIndex = this.slidesArray.length;
    };

    nextSlide = () => {
        if (this.currentTopSlideIndex === this.galleryLength - 1) this.currentTopSlideIndex = 0;
        else this.currentTopSlideIndex++;

        this.zIndex++;
        this.galleryItems.forEach(item => item.classList.remove('fade-in-block'));
        this.galleryItems[this.currentTopSlideIndex].classList.add('fade-in-block');
        this.galleryItems[this.currentTopSlideIndex].style.zIndex = this.zIndex;

        this.galleryPoints.forEach(point => {
            point.classList.remove('active');
        });
        this.galleryPoints[this.currentTopSlideIndex].classList.add('active')
    };

    setCustomSlide = index => {
        this.zIndex++;
        this.currentTopSlideIndex = index;

        this.galleryItems.forEach(item => item.classList.remove('fade-in-block'));
        this.galleryItems[index].classList.add('fade-in-block');
        this.galleryItems[index].style.zIndex = this.zIndex;

        this.galleryPoints.forEach((point, pointIndex) => {
            point.classList.remove('active');
            if (index === pointIndex) point.classList.add('active')
        });
        clearInterval(this.timer);

        this.timer = setInterval(this.nextSlide, this.delay);
    };

}

new Navigation();

new GallerySeo('js_about_us_gallery', 10000);
new GallerySeo('js_deploy_1_gallery', 10000);
new GallerySeo('js_deploy_2_gallery', 10000);
new GallerySeo('js_deploy_3_gallery', 10000);
new GallerySeo('js_deploy_4_gallery', 10000);



const navToggle = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.navigation');

if (navToggle && navigation) {
    const closeMenu = () => {
        navigation.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Открыть меню');
    };

    navToggle.addEventListener('click', () => {
        const isOpen = navigation.classList.toggle('is-open');
        navToggle.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 767) closeMenu();
    });
}
