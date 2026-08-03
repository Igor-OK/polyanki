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

        // console.log(this.aboutUsSectionBottomGap, this.deploySectionBottomGap, this.activitiesSectionBottomGap)


        this.oldScroll = 0;
        this.scrollY = 0;
        this.delta = 110; //px for scroll reacting

        this.gapFromTop = 200; //for switching between menu items

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


        if (window.scrollY > this.aboutUsSectionBottomGap - this.gapFromTop && window.scrollY < this.deploySectionBottomGap - this.gapFromTop) console.log('about us');
        if (window.scrollY > this.deploySectionBottomGap - this.gapFromTop && window.scrollY < this.activitiesSectionBottomGap - this.gapFromTop) console.log('deploy');
        if (window.scrollY > this.activitiesSectionBottomGap - this.gapFromTop) console.log('activities');

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

        this.timer = setInterval(this.nextSlide, this.delay);
    }

//todo handle swipe;

    init = () => {

        //defining z-index of slides
        this.slidesArray.forEach((slide, index) => {
            slide.style.zIndex = this.zIndex;
            this.galleryItems.push(slide);

            this.zIndex--;
        });


        //creating controls
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

class Gallery {
    constructor(galleryName, container, namesDescriptionsArray, delay) { //todo font color as prop, add flag for description position (vertical and horisontal) and text-align
        this.container = document.getElementsByClassName(container)[0];
        if (!this.container) return;

        this.galleryLength = namesDescriptionsArray.length;
        this.namesDescriptionsArray = namesDescriptionsArray;
        this.currentTopSlideIndex = 0;
        this.zIndex = this.galleryLength - 1;
        this.delay = delay;

        this.galleryItems = [];
        this.galleryPoints = [];
        this.galleryControls = null;

        this.init();

        this.timer = setInterval(this.nextSlide, this.delay);
    }
//todo handle swipe;
    init = () => {

        this.container.classList.add('gallery-container');

        //creating gallery
        this.namesDescriptionsArray.forEach((slide, index) => {
            const slideNode = document.createElement('div');
            slideNode.setAttribute('class', 'gallery-cover');

            slideNode.style.position = 'absolute';
            slideNode.style.zIndex = this.zIndex;
            slideNode.style.backgroundImage = `url("${slide.backgroundUrl}")`;

            slideNode.innerHTML = `<div class="gallery-slide-description"><h3 class="font-carmo f-size-30">${slide.header}</h3><p class="font-nunito f-size-16">${slide.text}</p></div>`;

            this.galleryItems.push(slideNode);
            this.container.appendChild(slideNode);

            this.zIndex--;
        });


        //creating controls
        this.galleryControls = document.createElement('div');
        this.galleryControls.setAttribute('class', 'gallery-controls');
        this.container.appendChild(this.galleryControls);

        this.namesDescriptionsArray.forEach((point, index) => {
            const slidePoint = document.createElement('div');
            slidePoint.setAttribute('class', 'gallery-point');
            slidePoint.dataset.index = index;

            if (index === this.currentTopSlideIndex) slidePoint.classList.add('active');
            slidePoint.addEventListener('click', () => this.setCustomSlide(index));

            this.galleryPoints.push(slidePoint);
            this.galleryControls.appendChild(slidePoint);
        });

        this.zIndex = this.namesDescriptionsArray.length;
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
        })
        clearInterval(this.timer);

        this.timer = setInterval(this.nextSlide, this.delay);
    };

}


const aboutUsGalleryData = [
    {
        backgroundUrl: './img/about_us.jpg',
        header: 'Домик в деревне',
        text: 'Если вы хотите радикально сменить обстановку, расслабиться, вернуть пошатнувшееся душевное равновесие и отлично провести время всей семьёй – то вам сюда.'
    },
    {
        backgroundUrl: './img/about_us_2.png',
        header: 'Белый берег и курортное настроение',
        text: 'Шикарный мягкий белый песочек и на берегу и в воде, сосновый воздух, атмосфера безмятежности создают неповторимые впечатления от нахождения здесь. По личным ощущениям и отзывам гостей – тут проживает то самое курортное настроение.'
    },
    {
        backgroundUrl: './img/about_us_3.jpg',
        header: 'Атмосфера праздника',
        text: 'Интересному и веселому времяпроводжению нужны интересные декорации.'
    },
];

const deploy1GalleryData = [
    {
        backgroundUrl: './img/deploy-1-1.jpg',
        header: 'Спальня',
        text: 'Сонное царство 1',
    },
    {
        backgroundUrl: './img/deploy-1-2.jpg',
        header: 'Спальня',
        text: 'Сонное царство 2',
    },
    {
        backgroundUrl: './img/deploy-1-3.jpg',
        header: 'Спальня',
        text: 'Сонное царство 2',
    },
];

const deploy2GalleryData = [
    {
        backgroundUrl: './img/deploy-2-1.jpg',
        header: 'Место для застолий',
        text: 'Для застолий и настольных игр',
    },
    {
        backgroundUrl: './img/deploy-2-2.jpg',
        header: 'Вкусная еда из печки',
        text: 'Неповторимый вкус блюд из печи, попробуйте приготовить сами. Пицца, пирожки, блины, жаркое, каши',
    },
];

const deploy3GalleryData = [
    {
        backgroundUrl: './img/deploy-3-1.jpg',
        header: 'Просторная кухня с прекрасным видом',
        text: 'Все необходимое для готовки с хорошим настроением',
    },
    {
        backgroundUrl: './img/deploy-3-2.jpg',
        header: 'Душ, туалет в доме',
        text: 'Не типичный для деревни комфорт',
    },
    {
        backgroundUrl: './img/deploy-3-3.jpg',
        header: 'Настроение праздника',
        text: 'Неповторимый вкус блюд из печи, попробуйте приготовить сами. Пицца, пирожки, блины, жаркое, каши',
    },
];

const deploy4GalleryData = [
    {
        backgroundUrl: './img/deploy-4.jpg',
        header: 'Домик на дереве',
        text: 'Не только приключение, но и 2 спальных места',
    }
];



new Navigation();

new GallerySeo('jjs_about_us_gallery', 10000);


new Gallery('aboutUs', 'js_about_us_gallery', aboutUsGalleryData, 10000);
new Gallery('deploy1', 'js_deploy_1_gallery', deploy1GalleryData, 15000);
new Gallery('deploy2', 'js_deploy_2_gallery', deploy2GalleryData, 15000);
new Gallery('deploy3', 'js_deploy_3_gallery', deploy3GalleryData, 15000);
new Gallery('deploy4', 'js_deploy_4_gallery', deploy4GalleryData, 15000);



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
