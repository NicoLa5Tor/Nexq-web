import { Component, OnInit, ElementRef, Renderer2, ViewChild, AfterViewInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceService } from '../../Services/service.service';
import { ReverseParallaxComponent } from '../animations/reverse-parallax/reverse-parallax.component';
@Component({
  selector: 'app-services-overview',
  standalone: true,
  imports: [CommonModule, RouterLink,ReverseParallaxComponent],
  templateUrl: './services-overview.component.html',
  styleUrls: ['./services-overview.component.scss']
})
export class ServicesOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('titleContainer') titleContainer!: ElementRef;
  mostrarServicio = signal(false);
  
  constructor(
    private el: ElementRef, 
    private renderer: Renderer2, 
    private serviceEstatus: ServiceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // Inicializar animaciones solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initFadeInAnimations();
    }
    this.mostrarServicio.set(this.serviceEstatus.getActivate());
    this.serviceEstatus.setActivate();
  }
  
  ngAfterViewInit(): void {
    // Iniciar la animación del título después de que la vista se haya inicializado
    // Solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.setupTitleAnimation(), 100);
    }
  }
  
  returnToView() {
    this.mostrarServicio.set(!this.mostrarServicio());
  }
  
  private setupTitleAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const titleElement = this.titleContainer.nativeElement;
    // Dividir el título en dos palabras
    const words = ["Nuestros", "Servicios"];
    
    // Limpiar cualquier contenido existente
    titleElement.innerHTML = '';
    
    // Crear un contenedor para cada palabra
    words.forEach((word, wordIndex) => {
      const wordContainer = this.renderer.createElement('div');
      this.renderer.addClass(wordContainer, 'word-container');
      
      // Para la segunda palabra, añadir margen a la izquierda
      if (wordIndex > 0) {
        this.renderer.setStyle(wordContainer, 'margin-left', '15px');
      }
      
      // Crear elementos span para cada letra de la palabra
      [...word].forEach((char, charIndex) => {
        const span = this.renderer.createElement('span');
        const textNode = this.renderer.createText(char);
        
        this.renderer.appendChild(span, textNode);
        this.renderer.addClass(span, 'title-letter');
        
        // Ocultar inicialmente cada letra
        this.renderer.setStyle(span, 'opacity', '0');
        this.renderer.setStyle(span, 'transform', 'translateY(30px)');
        
        this.renderer.appendChild(wordContainer, span);
      });
      
      this.renderer.appendChild(titleElement, wordContainer);
    });
    
    // Configurar el observador de intersección para detectar cuando el título es visible
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Cuando el elemento sea visible, iniciar la animación secuencial
            const letters = titleElement.querySelectorAll('.title-letter');
            
            letters.forEach((letterElement: HTMLElement, letterIndex: number) => {
              setTimeout(() => {
                this.renderer.setStyle(letterElement, 'opacity', '1');
                this.renderer.setStyle(letterElement, 'transform', 'translateY(0)');
              }, letterIndex * 100); // 100ms de retardo entre cada letra
            });
            
            // Activar la animación de las tarjetas después de que el título termine de animarse
            setTimeout(() => {
              this.activateCardAnimations();
            }, letters.length * 100 + 500);
            
            // Dejar de observar después de iniciar la animación
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      // Comenzar a observar el elemento del título
      observer.observe(titleElement);
    }
  }
  
  private activateCardAnimations(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const cards = this.el.nativeElement.querySelectorAll('.service-card');
    cards.forEach((card: HTMLElement, index: number) => {
      this.renderer.addClass(card, 'animate-card');
      this.renderer.setStyle(card, 'animation-delay', `${index * 0.15}s`);
    });
  }

  private initFadeInAnimations(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Verificar que estamos en el navegador y que document está disponible
    if (typeof document !== 'undefined') {
      // Animación de entrada para elementos cuando son visibles
      const fadeElements = document.querySelectorAll('.services-section .fade-in');
      if (fadeElements.length > 0 && typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).style.opacity = '1';
              (entry.target as HTMLElement).style.transform = 'translateY(0)';
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        
        fadeElements.forEach(element => {
          observer.observe(element);
        });
      }
    }
  }
}