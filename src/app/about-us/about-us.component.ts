import { Component,ViewChild, OnInit, Inject, PLATFORM_ID, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AosService } from '../../services/aos.service';
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
  isAboutRoute: boolean = false;
  isIndexMode: boolean = false;
  isMobile: boolean = false;
  
  // Miembro seleccionado
  selectedMember: TeamMember | null = null;
  
  // Observadores
  private scrollObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;

  // Datos del equipo
  teamMembers: TeamMember[] = [
    {
      id: 'sebastian',
      name: 'Sebastián Torres',
      role: 'Chief Executive Officer',
      fullDescription: 'Ingeniero con MBA en Administración de Empresas y Magister en Publicidad, actualmente doctorando en Administración Gerencial. Experto en desarrollo de modelos de negocio sostenibles, innovación tecnológica y liderazgo estratégico. Con más de 8 años de experiencia dirigiendo equipos multidisciplinarios en proyectos de transformación digital y consultoría empresarial.',
      photo: 'assets/sebastian2.png',
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
      name: 'Dr. Diego Leonardo Hernández Bustos',
      role: 'Director Científico',
      fullDescription: 'Matemático de profesión y Doctor en Ciencias con orientación en Probabilidad y Estadística, con amplia experiencia en control estocástico, modelamiento matemático y optimización de portafolios financieros. Ha liderado proyectos de investigación aplicada y consultoría en matemáticas, estadística y machine learning. Su trayectoria combina docencia universitaria, publicaciones internacionales y la creación de soluciones innovadoras para el sector financiero, tecnológico, ambiental y de la educación. En NexQ-AI, impulsa el desarrollo de herramientas analíticas y soluciones fundamentadas en herramientas cuantitativas.',
      photo: 'assets/diego.png',
      expertise: [
        'Control Estocástico',
        'Modelamiento Matemático',
        'Optimización de Portafolios Financieros',
        'Matemáticas',
        'Estadística',
        'Machine Learning'
      ],
      experience: '10+ años',
      education: 'Doctor en Ciencias con orientación en Probabilidad y Estadística',
      achievements: [],
      color: '#059669'
    }, 
    {
      id: 'andres',
      name: 'Andrés Gómez',
      role: 'Director de Tecnología',
      fullDescription: 'Economista con Magíster en Finanzas. Analista de riesgos financieros SARM, SARL, SARC y Mercado de Capitales. Cuenta con una amplia experiencia profesional como auditor, consultor y supervisor, con énfasis en valoración de inversiones en títulos, bonos, derivados y valoración actuarial de pasivos pensionales.',
      photo: 'assets/andres.png',
      expertise: [
        'Riesgos Financieros',
        'Mercado de Capitales',
        'Valoración de Inversiones',
        'Derivados Financieros',
        'Valoración Actuarial'
      ],
      experience: '10+ años',
      education: 'Magíster en Finanzas',
      achievements: [],
      color: '#DC2626'
    },
    {
      id: 'nicolas',
      name: 'Nicolás Rodríguez Torres',
      role: 'Desarrollador',
      fullDescription: 'Ingeniero de Sistemas y Computación, con experiencia en desarrollo full stack, ciencia de datos e integración de inteligencia artificial. Ha trabajado en el diseño e implementación de soluciones web, agentes inteligentes para ventas y automatización de procesos con herramientas modernas. Enfocado en construir software innovador, funcional y escalable.',
      photo: 'assets/nicolas.png', 
      expertise: ['Ciencia de datos', 'Integración IA', 'Power BI', 'Desarrollo web', 'DevOps'],
      experience: '2+ años',
      education: 'Ingeniería en Sistemas y Computación',
      achievements: [
        'Desarrollo de un software para fine-tuning de modelos de IA',
        'Agente conversacional con OpenAI para ventas de motos YAMAHA',
        'Aplicaciones web full stack con integración de Tailwind, GSAP y Animate.js',
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
    }
  }

  private initializeComponent(): void {
    this.checkScreenSize();
    this.setupResponsiveLayout();
    
    if (this.isAboutRoute) {
      this.initFullPageMode();
    } else {
      this.initIndexMode();
    }
  }

  private reinitializeForRoute(): void {
    this.cleanupObservers();
    
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
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      root.style.setProperty('--selected-member-color', member.color);
    }
  }

  private animateMemberTransition(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const photoContainer = this.elementRef.nativeElement.querySelector('.member-photo-display');
    const infoContainer = this.elementRef.nativeElement.querySelector('.member-info-display');
    
    if (photoContainer && infoContainer) {
      // Animación de salida
      photoContainer.style.opacity = '0';
      photoContainer.style.transform = 'scale(0.9)';
      infoContainer.style.opacity = '0';
      infoContainer.style.transform = 'translateY(20px)';
      
      // Animación de entrada
      setTimeout(() => {
        photoContainer.style.opacity = '1';
        photoContainer.style.transform = 'scale(1)';
        infoContainer.style.opacity = '1';
        infoContainer.style.transform = 'translateY(0)';
      }, 200);
    }
  }

  // =================== MODO INDEX ===================
  private initIndexMode(): void {
    this.addIndexModeClasses();
    this.initBasicAnimations();
  }

  private addIndexModeClasses(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const section = this.elementRef.nativeElement.querySelector('.about-section');
    if (section) {
      section.classList.add('index-mode');
      section.classList.remove('full-page-mode');
    }
  }

  // =================== MODO PÁGINA COMPLETA ===================
  private initFullPageMode(): void {
    this.addFullPageModeClasses();
    this.initAdvancedAnimations();
    this.initTeamSelector();
    this.initInteractiveElements();
  }

  private addFullPageModeClasses(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const section = this.elementRef.nativeElement.querySelector('.about-section');
    if (section) {
      section.classList.add('full-page-mode');
      section.classList.remove('index-mode');
    }
  }

  private initTeamSelector(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Inicializar colores del miembro seleccionado
    if (this.selectedMember) {
      this.updateMemberColors(this.selectedMember);
    }

    // Animar el display inicial
    setTimeout(() => {
      this.animateMemberTransition();
    }, 500);
  }

  // =================== ANIMACIONES ===================
  private initBasicAnimations(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const animatedElements = this.elementRef.nativeElement.querySelectorAll('.summary-card');
    
    animatedElements.forEach((element: HTMLElement, index: number) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = `all 0.6s ease ${index * 0.2}s`;
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 300 + (index * 200));
    });
  }

  private initAdvancedAnimations(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const fadeElements = this.elementRef.nativeElement.querySelectorAll('.about-description, .differentiators, .service-card, .timeline-item');
    
    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
      this.scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target as HTMLElement);
            this.scrollObserver?.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      fadeElements.forEach((element: Element, index: number) => {
        this.prepareElementForAnimation(element as HTMLElement, index);
        this.scrollObserver?.observe(element);
      });
    }
  }

  private prepareElementForAnimation(element: HTMLElement, index: number): void {
    element.style.opacity = '0';
    element.style.transform = 'translateY(40px)';
    element.style.transition = `all 0.8s ease ${index * 0.1}s`;
  }

  private animateElement(element: HTMLElement): void {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }

  // =================== INTERACTIVIDAD ===================
  private initInteractiveElements(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.initSkillBars();
    this.initTimelineInteraction();
  }

  private initSkillBars(): void {
    const skillBars = this.elementRef.nativeElement.querySelectorAll('.skill-fill');
    
    skillBars.forEach((bar: HTMLElement) => {
      bar.style.width = '0%';
      
      setTimeout(() => {
        const parentBar = bar.closest('.skill-item');
        if (parentBar) {
          const skillName = parentBar.querySelector('.skill-name span:first-child')?.textContent;
          let width = '0%';
          
          switch(skillName) {
            case 'Machine Learning & IA':
              width = '95%';
              break;
            case 'Análisis Estadístico':
              width = '98%';
              break;
            case 'Desarrollo de Software':
              width = '90%';
              break;
            case 'Consultoría Empresarial':
              width = '92%';
              break;
            case 'Finanzas Cuantitativas':
              width = '88%';
              break;
            default:
              width = '85%';
          }
          
          bar.style.width = width;
        }
      }, 1000);
    });
  }

  private initTimelineInteraction(): void {
    const timelineItems = this.elementRef.nativeElement.querySelectorAll('.timeline-item');
    
    timelineItems.forEach((item: HTMLElement) => {
      item.addEventListener('click', () => {
        const isExpanded = item.classList.contains('expanded');
        
        // Cerrar otros items
        timelineItems.forEach((otherItem: HTMLElement) => {
          if (otherItem !== item) {
            otherItem.classList.remove('expanded');
          }
        });
        
        // Toggle actual item
        if (isExpanded) {
          item.classList.remove('expanded');
        } else {
          item.classList.add('expanded');
        }
      });
    });
  }

  // =================== UTILIDADES ===================
  private setupResponsiveLayout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    
    const section = this.elementRef.nativeElement.querySelector('.about-section');
    if (section) {
      this.resizeObserver.observe(section);
    }
  }

  private handleResize(): void {
    this.checkScreenSize();
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
    this.reinitializeForRoute();
  }

  public toggleViewMode(): void {
    this.isIndexMode = !this.isIndexMode;
    this.isAboutRoute = !this.isIndexMode;
    this.reinitializeForRoute();
  }
}