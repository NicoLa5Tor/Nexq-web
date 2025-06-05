import { Component, OnInit, ElementRef, Renderer2, ViewChild, AfterViewInit, signal, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceService } from '../../Services/service.service';
import { ParticlesBackgroundComponent } from '../animations/particles-background/particles-background.component';
@Component({
  selector: 'app-services-overview',
  standalone: true,
  imports: [CommonModule, RouterLink,ParticlesBackgroundComponent],
  templateUrl: './services-overview.component.html',
  styleUrls: ['./services-overview.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ServicesOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('titleContainer') titleContainer!: ElementRef;
  mostrarServicio = signal(false);
  particleColors = [
    'rgba(94, 137, 176, 0.6)',  // azul
    'rgba(110, 86, 207, 0.6)',  // morado
    'rgba(158, 119, 224, 0.6)', // lila
    'rgba(94, 137, 176, 0.3)',  // azul claro
    'rgba(255, 255, 255, 0.5)'  // blanco
  ];
  
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
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.setupTitleAnimation(), 100);
      
      // Configurar los nodos neurales si estamos en vista detallada
      if (this.mostrarServicio()) {
        this.setupNeuralNodes();
      }
    }
  }
  
  
  returnToView() {
    this.mostrarServicio.set(!this.mostrarServicio());
    
    // Configurar los nodos neurales después de cambiar la vista
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (this.mostrarServicio()) {
          this.setupNeuralNodes();
        }
      }, 100);
    }
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
    
    // Asegurarse de que las tarjetas estén inicialmente ocultas
    cards.forEach((card: HTMLElement) => {
      this.renderer.setStyle(card, 'opacity', '0');
      this.renderer.setStyle(card, 'visibility', 'hidden');
      this.renderer.setStyle(card, 'transform', 'translateY(40px)');
    });
    
    // Configurar un observador de intersección para activar las animaciones al scroll
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Añadir la clase con un pequeño retraso secuencial
            setTimeout(() => {
              // Asegurarse de que la tarjeta sea visible antes de animar
              this.renderer.setStyle(entry.target, 'visibility', 'visible');
              this.renderer.addClass(entry.target, 'animate-card');
            }, index * 100);
            
            // Dejar de observar después de iniciar la animación
            observer.unobserve(entry.target);
          }
        });
      }, { 
        threshold: 0.2,  // Detecta cuando al menos el 20% de la tarjeta es visible
        rootMargin: '0px 0px -10% 0px'  // Activa un poco antes para mejor experiencia
      });
      
      // Comenzar a observar cada tarjeta
      cards.forEach((card: HTMLElement) => {
        observer.observe(card);
      });
    } else {
      // Fallback para navegadores que no soportan IntersectionObserver
      // Primero ocultar todas, luego mostrar con retardo
      setTimeout(() => {
        cards.forEach((card: HTMLElement, index: number) => {
          setTimeout(() => {
            this.renderer.setStyle(card, 'visibility', 'visible');
            this.renderer.addClass(card, 'animate-card');
          }, index * 150);
        });
      }, 300);
    }
  }

// Método mejorado para las animaciones fade-in
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
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      
      fadeElements.forEach(element => {
        observer.observe(element);
      });
    }
  }
}
// Añadir este método al componente TypeScript

/**
 * Método para manejar la visibilidad del CTA
 * Se llama cuando cambia el estado de mostrarServicio
 */
private handleCTAVisibility(): void {
  if (!isPlatformBrowser(this.platformId)) return;
  
  setTimeout(() => {
    // Buscar el CTA expandido
    const expandedCTA = this.el.nativeElement.querySelector('.cta-container.expanded-cta');
    if (expandedCTA && this.mostrarServicio()) {
      // Asegurar que sea visible
      this.renderer.setStyle(expandedCTA, 'display', 'block');
      this.renderer.setStyle(expandedCTA, 'opacity', '1');
      
      // Encontrar los botones y animarlos
      const buttons = expandedCTA.querySelectorAll('.cta-button');
      buttons.forEach((button: HTMLElement, index: number) => {
        this.renderer.setStyle(button, 'opacity', '0');
        this.renderer.setStyle(button, 'transform', 'translateY(20px)');
        
        // Animar con un ligero retraso secuencial
        setTimeout(() => {
          this.renderer.setStyle(button, 'opacity', '1');
          this.renderer.setStyle(button, 'transform', 'translateY(0)');
          this.renderer.setStyle(button, 'transition', 'all 0.5s ease');
        }, 300 + (index * 150));
      });
    }
  }, 100);
}
private setupNeuralNodes(): void {
  if (!isPlatformBrowser(this.platformId)) return;
  
  const nodesContainer = this.el.nativeElement.querySelector('.neural-nodes-container');
  if (!nodesContainer) return;
  
  // Asegurarse de que los nodos sean visibles
  this.renderer.setStyle(nodesContainer, 'opacity', '1');
  this.renderer.setStyle(nodesContainer, 'visibility', 'visible');
  
  // Ajustar z-index si es necesario
  this.renderer.setStyle(nodesContainer, 'z-index', '1');
  
  // Hacer lo mismo con las líneas de conexión
  const dataFlowSvg = this.el.nativeElement.querySelector('.data-flow-svg');
  if (dataFlowSvg) {
    this.renderer.setStyle(dataFlowSvg, 'opacity', '1');
    this.renderer.setStyle(dataFlowSvg, 'visibility', 'visible');
    this.renderer.setStyle(dataFlowSvg, 'z-index', '1');
  }
}


}