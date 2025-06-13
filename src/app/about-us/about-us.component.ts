import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AosService } from '../../Services/aos.service';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  fullDescription: string;
  photo: string;
  expertise: string[];
  experience: string;
  education: string;
  achievements: string[];
  color: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados del componente
  isAboutRoute: boolean = false;
  isIndexMode: boolean = false;
  animationsInitialized: boolean = false;
  isMobile: boolean = false;
  isTablet: boolean = false;
  
  // Miembro seleccionado
  selectedMember: TeamMember | null = null;
  
  // Observadores
  private scrollObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  
  // Configuración de animaciones
  private animationConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 150,
    transitionDuration: 600
  };

  // Datos del equipo
  teamMembers: TeamMember[] = [
    {
      id: 'sebastian',
      name: 'Sebastián Torres',
      role: 'Chief Executive Officer',
      fullDescription: 'Ingeniero con MBA en Administración de Empresas y Magister en Publicidad, actualmente doctorando en Administración Gerencial. Experto en desarrollo de modelos de negocio sostenibles, innovación tecnológica y liderazgo estratégico. Con más de 8 años de experiencia dirigiendo equipos multidisciplinarios en proyectos de transformación digital y consultoría empresarial.',
      photo: 'assets/team/sebastian.jpg',
      expertise: ['Liderazgo Estratégico', 'Innovación', 'Modelos de Negocio', 'Transformación Digital'],
      experience: '8+ años',
      education: 'MBA, Magister en Publicidad, Doctorando en Administración',
      achievements: [
        'Dirigió la transformación digital de 15+ empresas',
        'Desarrolló modelos de negocio sostenibles con ROI del 300%',
        'Reconocido como líder innovador por TechLeaders 2023',
        'Mentor en 3 programas de aceleración empresarial'
      ],
      color: '#4F46E5'
    },
    {
      id: 'diego',
      name: 'Diego Rodríguez',
      role: 'Director Científico',
      fullDescription: 'Ph.D. en Probabilidad y Estadística con más de 10 años de experiencia en modelado matemático avanzado. Especialista en aprendizaje automático, optimización financiera y análisis predictivo. Ha publicado más de 15 papers en revistas científicas de alto impacto y dirigido proyectos de investigación multimillonarios en instituciones académicas y corporativas.',
      photo: 'assets/team/diego.jpg',
      expertise: ['Machine Learning', 'Estadística Avanzada', 'Modelado Matemático', 'Investigación Científica'],
      experience: '10+ años',
      education: 'Ph.D. en Probabilidad y Estadística',
      achievements: [
        '15+ publicaciones en revistas de alto impacto',
        'Desarrolló algoritmos predictivos con 98% de precisión',
        'Ganador del Premio Nacional de Investigación 2022',
        'Supervisor de 12 tesis doctorales'
      ],
      color: '#059669'
    },
    {
      id: 'andres',
      name: 'Andrés Gómez',
      role: 'Director de Tecnología',
      fullDescription: 'Estadístico con Maestría en Computación Estadística y más de 7 años de experiencia en machine learning aplicado. Experto en perfilamiento social, análisis financiero y desarrollo de algoritmos avanzados. Especialista en Python, R y tecnologías de Big Data, con certificaciones en AWS y Google Cloud. Ha arquitecturado sistemas de ML para más de 50 empresas.',
      photo: 'assets/team/andres.jpg',
      expertise: ['Python', 'Big Data', 'Algoritmos ML', 'Cloud Computing', 'DevOps'],
      experience: '7+ años',
      education: 'Maestría en Computación Estadística',
      achievements: [
        'Arquitecto de 20+ sistemas de ML en producción',
        'Especialista certificado en AWS y Google Cloud',
        'Creador del framework NEXQ-ML usado por 100+ desarrolladores',
        'Speaker en 15+ conferencias internacionales'
      ],
      color: '#DC2626'
    },
    {
      id: 'esteban',
      name: 'Esteban Martínez',
      role: 'Director de Finanzas',
      fullDescription: 'Economista con Maestría en Finanzas y certificación como analista de riesgos financieros. Con más de 6 años de experiencia en valoración de inversiones, derivados financieros y gestión de riesgos. Experto en modelos econométricos y análisis cuantitativo avanzado, habiendo gestionado portfolios de más de $50M y asesorado a instituciones financieras líderes.',
      photo: 'assets/team/esteban.jpg',
      expertise: ['Finanzas Cuantitativas', 'Gestión de Riesgos', 'Econometría', 'Valuaciones', 'Trading'],
      experience: '6+ años',
      education: 'Maestría en Finanzas, Certificación en Análisis de Riesgos',
      achievements: [
        'Gestionó portfolios de +$50M con retornos del 25%',
        'Desarrolló modelos de riesgo adoptados por 10+ instituciones',
        'Certificado como Risk Manager por GARP',
        'Consultor financiero para 3 bancos internacionales'
      ],
      color: '#7C3AED'
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private aos: AosService,
    private elementRef: ElementRef,
    private router: Router
  ) {
    this.initRouteDetection();
    this.selectedMember = this.teamMembers[0];
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.determineViewMode();
      this.checkScreenSize();
      this.aos.refresh();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeComponent();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupObservers();
  }

  private initRouteDetection(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.updateRouteState(event.url);
      
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          this.reinitializeForRoute();
        }, 200);
      }
    });
  }

  private updateRouteState(url: string): void {
    this.isAboutRoute = url.includes('/about') || url.includes('/quienes-somos') || url.includes('/nosotros');
    this.isIndexMode = !this.isAboutRoute;
  }

  private determineViewMode(): void {
    const currentUrl = this.router.url;
    this.updateRouteState(currentUrl);
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
      this.isTablet = window.innerWidth <= 992 && window.innerWidth > 768;
    }
  }

  private initializeComponent(): void {
    this.checkScreenSize();
    this.fixTitleSpacing();
    this.setupResponsiveLayout();
    
    if (this.isAboutRoute) {
      this.initFullPageMode();
    } else {
      this.initIndexMode();
    }
    
    this.animationsInitialized = true;
  }

  private reinitializeForRoute(): void {
    this.cleanupObservers();
    this.animationsInitialized = false;
    
    setTimeout(() => {
      this.initializeComponent();
    }, 100);
  }

  // =================== SELECCIÓN DE MIEMBROS ===================
  selectMember(member: TeamMember): void {
    if (this.selectedMember?.id !== member.id) {
      this.selectedMember = member;
      this.animateMemberTransition();
      this.updateMemberColors(member);
    }
  }

  private updateMemberColors(member: TeamMember): void {
    const root = document.documentElement;
    root.style.setProperty('--selected-member-color', member.color);
  }

  private animateMemberTransition(): void {
    const photoContainer = this.elementRef.nativeElement.querySelector('.member-photo-display');
    const infoContainer = this.elementRef.nativeElement.querySelector('.member-info-display');
    
    if (photoContainer && infoContainer) {
      // Animación de salida
      photoContainer.style.opacity = '0';
      photoContainer.style.transform = 'scale(0.8) rotateY(15deg)';
      infoContainer.style.opacity = '0';
      infoContainer.style.transform = 'translateX(30px)';
      
      // Animación de entrada
      setTimeout(() => {
        photoContainer.style.opacity = '1';
        photoContainer.style.transform = 'scale(1) rotateY(0deg)';
        infoContainer.style.opacity = '1';
        infoContainer.style.transform = 'translateX(0)';
      }, 250);
    }
  }

  // =================== MODO INDEX ===================
  private initIndexMode(): void {
    this.addIndexModeClasses();
    this.initBasicAnimations();
    this.initIndexSpecificFeatures();
  }

  private addIndexModeClasses(): void {
    const section = this.elementRef.nativeElement.querySelector('.about-section');
    if (section) {
      section.classList.add('index-mode');
      section.classList.remove('full-page-mode');
    }
  }

  private initIndexSpecificFeatures(): void {
    this.initSummaryCards();
    this.initIndexHoverEffects();
  }

  private initSummaryCards(): void {
    const cards = this.elementRef.nativeElement.querySelectorAll('.summary-card');
    cards.forEach((card: HTMLElement, index: number) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `all ${this.animationConfig.transitionDuration}ms ease ${index * this.animationConfig.staggerDelay}ms`;
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 300 + (index * this.animationConfig.staggerDelay));
    });
  }

  // =================== MODO PÁGINA COMPLETA ===================
  private initFullPageMode(): void {
    this.addFullPageModeClasses();
    this.initAdvancedAnimations();
    this.initFullPageFeatures();
  }

  private addFullPageModeClasses(): void {
    const section = this.elementRef.nativeElement.querySelector('.about-section');
    if (section) {
      section.classList.add('full-page-mode');
      section.classList.remove('index-mode');
    }
  }

  private initFullPageFeatures(): void {
    this.initDetailedAnimations();
    this.initParallaxEffect();
    this.initAdvancedHoverEffects();
    this.initTimelineAnimation();
    this.initInteractiveElements();
    this.initTeamSelector();
  }

  private initTeamSelector(): void {
    // Inicializar colores del miembro seleccionado
    if (this.selectedMember) {
      this.updateMemberColors(this.selectedMember);
    }

    const memberButtons = this.elementRef.nativeElement.querySelectorAll('.team-avatar-btn');
    memberButtons.forEach((btn: HTMLElement, index: number) => {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(30px) scale(0.8)';
      btn.style.transition = `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s`;
      
      setTimeout(() => {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0) scale(1)';
      }, 600 + (index * 150));
    });

    // Animar el display inicial
    setTimeout(() => {
      this.animateMemberTransition();
    }, 1000);
  }

  private initTimelineAnimation(): void {
    const timeline = this.elementRef.nativeElement.querySelector('.company-timeline');
    if (timeline) {
      const items = timeline.querySelectorAll('.timeline-item');
      items.forEach((item: HTMLElement, index: number) => {
        item.style.opacity = '0';
        item.style.transform = index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
        item.style.transition = `all 0.8s ease ${index * 0.2}s`;
        
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        }, 500 + (index * 200));
      });
    }
  }

  // =================== ANIMACIONES BÁSICAS ===================
  private initBasicAnimations(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const fadeElements = this.elementRef.nativeElement.querySelectorAll('.fade-in');
    
    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
      this.scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target as HTMLElement);
            this.scrollObserver?.unobserve(entry.target);
          }
        });
      }, {
        threshold: this.animationConfig.threshold,
        rootMargin: this.animationConfig.rootMargin
      });
      
      fadeElements.forEach((element: Element) => {
        this.prepareElementForAnimation(element as HTMLElement);
        this.scrollObserver?.observe(element);
      });
    }
  }

  private initAdvancedAnimations(): void {
    this.initTextAnimations();
    this.initElementAnimations();
    this.initStaggeredAnimations();
  }

  private prepareElementForAnimation(element: HTMLElement): void {
    element.style.opacity = '0';
    element.style.transition = `opacity ${this.animationConfig.transitionDuration}ms ease`;
    
    if (element.classList.contains('slide-up')) {
      element.style.transform = 'translateY(40px)';
      element.style.transition += `, transform ${this.animationConfig.transitionDuration}ms ease`;
    } else if (element.classList.contains('slide-right')) {
      element.style.transform = 'translateX(-40px)';
      element.style.transition += `, transform ${this.animationConfig.transitionDuration}ms ease`;
    } else if (element.classList.contains('scale-in')) {
      element.style.transform = 'scale(0.9)';
      element.style.transition += `, transform ${this.animationConfig.transitionDuration}ms ease`;
    }
  }

  private animateElement(element: HTMLElement): void {
    element.style.opacity = '1';
    
    if (element.classList.contains('slide-up') || 
        element.classList.contains('slide-right') || 
        element.classList.contains('scale-in')) {
      element.style.transform = element.classList.contains('scale-in') ? 'scale(1)' : 'translate(0, 0)';
    }
  }

  // =================== ANIMACIONES ESPECÍFICAS ===================
  private initTextAnimations(): void {
    const sectionTitle = this.elementRef.nativeElement.querySelector('.section-title');
    if (sectionTitle && sectionTitle.textContent && this.isAboutRoute) {
      this.animateTextLetterByLetter(sectionTitle);
    }
    
    const highlights = this.elementRef.nativeElement.querySelectorAll('.highlight');
    highlights.forEach((highlight: HTMLElement) => {
      highlight.classList.add('text-glow');
    });
  }

  private animateTextLetterByLetter(element: HTMLElement): void {
    const text = element.textContent || '';
    element.textContent = '';
    
    Array.from(text).forEach((char: string, index: number) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(20px)';
      span.style.transition = `all 0.5s ease ${index * 0.05}s`;
      
      element.appendChild(span);
      
      setTimeout(() => {
        span.style.opacity = '1';
        span.style.transform = 'translateY(0)';
      }, 100 + (index * 50));
    });
  }

  private initElementAnimations(): void {
    this.animateDifferentiators();
    this.animateServiceCards();
  }

  private animateDifferentiators(): void {
    const items = this.elementRef.nativeElement.querySelectorAll('.differentiators-list li');
    items.forEach((item: HTMLElement, index: number) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-30px)';
      item.style.transition = `all 0.6s ease ${index * 0.1}s`;
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, 400 + (index * 100));
    });
  }

  private animateServiceCards(): void {
    const cards = this.elementRef.nativeElement.querySelectorAll('.service-card');
    cards.forEach((card: HTMLElement, index: number) => {
      card.style.opacity = '0';
      card.style.transform = 'rotateY(15deg) translateZ(-50px)';
      card.style.transition = `all 0.7s ease ${index * 0.1}s`;
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'rotateY(0deg) translateZ(0)';
      }, 300 + (index * 100));
    });
  }

  private initStaggeredAnimations(): void {
    const groups = [
      { selector: '.talent-item', delay: 200 },
      { selector: '.platform-feature', delay: 250 },
      { selector: '.module', delay: 300 }
    ];

    groups.forEach(group => {
      const elements = this.elementRef.nativeElement.querySelectorAll(group.selector);
      elements.forEach((element: HTMLElement, index: number) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(25px)';
        element.style.transition = `all 0.6s ease ${index * 0.1}s`;
        
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, group.delay + (index * 100));
      });
    });
  }

  // =================== EFECTOS AVANZADOS ===================
  private initParallaxEffect(): void {
    if (!isPlatformBrowser(this.platformId) || !this.isAboutRoute) return;
    
    const aboutSection = this.elementRef.nativeElement.querySelector('.about-section');
    
    if (aboutSection && typeof window !== 'undefined') {
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const sectionTop = aboutSection.getBoundingClientRect().top + scrollY;
        const offset = scrollY - sectionTop;
        
        if (offset > -800 && offset < 800) {
          this.applyParallaxEffects(offset);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  }

  private applyParallaxEffects(offset: number): void {
    const effects = [
      { selector: '.section-title', multiplier: 0.03 },
      { selector: '.differentiators', multiplier: 0.02 },
      { selector: '.team-selector-section', multiplier: 0.01 }
    ];

    effects.forEach(effect => {
      const element = this.elementRef.nativeElement.querySelector(effect.selector);
      if (element) {
        element.style.transform = `translateY(${offset * effect.multiplier}px)`;
      }
    });
  }

  private initAdvancedHoverEffects(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.initDifferentiatorHoverEffects();
    this.initCardHoverEffects();
  }

  private initIndexHoverEffects(): void {
    const cards = this.elementRef.nativeElement.querySelectorAll('.summary-card');
    cards.forEach((card: HTMLElement) => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  private initDifferentiatorHoverEffects(): void {
    const diffItems = this.elementRef.nativeElement.querySelectorAll('.differentiators-list li');
    diffItems.forEach((item: HTMLElement) => {
      item.addEventListener('mouseenter', () => {
        const icon = item.querySelector('.icon') as HTMLElement;
        const text = item.querySelector('div') as HTMLElement;
        
        if (icon) icon.classList.add('icon-pulse');
        if (text) text.style.transform = 'translateX(5px)';
      });
      
      item.addEventListener('mouseleave', () => {
        const icon = item.querySelector('.icon') as HTMLElement;
        const text = item.querySelector('div') as HTMLElement;
        
        if (icon) icon.classList.remove('icon-pulse');
        if (text) text.style.transform = 'translateX(0)';
      });
    });
  }

  private initCardHoverEffects(): void {
    const cards = this.elementRef.nativeElement.querySelectorAll('.service-card, .platform-feature');
    cards.forEach((card: HTMLElement) => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) rotateX(2deg)';
        card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateX(0deg)';
        card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
      });
    });
  }

  // =================== INTERACTIVIDAD ===================
  private initInteractiveElements(): void {
    this.initSkillBars();
    this.initProgressRings();
    this.initInteractiveTimeline();
  }

  private initSkillBars(): void {
    const skillBars = this.elementRef.nativeElement.querySelectorAll('.skill-bar');
    skillBars.forEach((bar: HTMLElement) => {
      const fill = bar.querySelector('.skill-fill') as HTMLElement;
      const percentage = bar.dataset['percentage'] || '0';
      
      if (fill) {
        fill.style.width = '0%';
        fill.style.transition = 'width 1.5s ease-in-out';
        
        setTimeout(() => {
          fill.style.width = percentage + '%';
        }, 500);
      }
    });
  }

  private initProgressRings(): void {
    const rings = this.elementRef.nativeElement.querySelectorAll('.progress-ring');
    rings.forEach((ring: HTMLElement) => {
      const circle = ring.querySelector('.progress-ring-circle') as SVGCircleElement;
      const percentage = parseInt(ring.dataset['percentage'] || '0');
      
      if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
        
        setTimeout(() => {
          const offset = circumference - (percentage / 100) * circumference;
          circle.style.strokeDashoffset = offset.toString();
        }, 700);
      }
    });
  }

  private initInteractiveTimeline(): void {
    const timeline = this.elementRef.nativeElement.querySelector('.company-timeline');
    if (timeline) {
      const items = timeline.querySelectorAll('.timeline-item');
      items.forEach((item: HTMLElement) => {
        item.addEventListener('click', () => {
          this.expandTimelineItem(item);
        });
      });
    }
  }

  private expandTimelineItem(item: HTMLElement): void {
    const details = item.querySelector('.timeline-details') as HTMLElement;
    const isExpanded = item.classList.contains('expanded');
    
    const allItems = this.elementRef.nativeElement.querySelectorAll('.timeline-item');
    allItems.forEach((otherItem: HTMLElement) => {
      if (otherItem !== item) {
        otherItem.classList.remove('expanded');
        const otherDetails = otherItem.querySelector('.timeline-details') as HTMLElement;
        if (otherDetails) {
          otherDetails.style.maxHeight = '0';
        }
      }
    });
    
    if (isExpanded) {
      item.classList.remove('expanded');
      if (details) details.style.maxHeight = '0';
    } else {
      item.classList.add('expanded');
      if (details) details.style.maxHeight = details.scrollHeight + 'px';
    }
  }

  // =================== UTILIDADES ===================
  private initDetailedAnimations(): void {
    // Placeholder para animaciones detalladas adicionales
  }

  private fixTitleSpacing(): void {
    const sectionTitles = this.elementRef.nativeElement.querySelectorAll('.section-title');
    sectionTitles.forEach((title: HTMLElement) => {
      if (title && title.textContent) {
        if (title.textContent.trim() === 'QuiénesSomos') {
          title.textContent = 'Quiénes Somos';
        }
      }
    });
  }

  private setupResponsiveLayout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(() => {
        this.handleResize();
      });
    });
    
    const section = this.elementRef.nativeElement.querySelector('.about-section');
    if (section) {
      this.resizeObserver.observe(section);
    }
  }

  private handleResize(): void {
    this.checkScreenSize();
    
    if (this.isMobile) {
      this.adjustForMobile();
    } else if (this.isTablet) {
      this.adjustForTablet();
    } else {
      this.adjustForDesktop();
    }
  }

  private adjustForMobile(): void {
    const elements = this.elementRef.nativeElement.querySelectorAll('.fade-in');
    elements.forEach((element: HTMLElement) => {
      element.style.transitionDuration = '400ms';
    });
  }

  private adjustForTablet(): void {
    const elements = this.elementRef.nativeElement.querySelectorAll('.fade-in');
    elements.forEach((element: HTMLElement) => {
      element.style.transitionDuration = '500ms';
    });
  }

  private adjustForDesktop(): void {
    const elements = this.elementRef.nativeElement.querySelectorAll('.fade-in');
    elements.forEach((element: HTMLElement) => {
      element.style.transitionDuration = '600ms';
    });
  }

  private cleanupObservers(): void {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
      this.scrollObserver = undefined;
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  // =================== MÉTODOS PÚBLICOS ===================
  public refreshAnimations(): void {
    if (this.animationsInitialized) {
      this.reinitializeForRoute();
    }
  }

  public toggleViewMode(): void {
    this.isIndexMode = !this.isIndexMode;
    this.isAboutRoute = !this.isIndexMode;
    this.reinitializeForRoute();
  }
}