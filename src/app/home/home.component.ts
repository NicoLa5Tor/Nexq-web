// home.component.ts - Enhanced version with improved animations and parallax
import { Component, OnInit, PLATFORM_ID, Inject, HostListener, AfterViewInit, OnDestroy, ViewEncapsulation, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicesOverviewComponent } from '../services-overview/services-overview.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { ContactComponent } from '../contact/contact.component';
import { FeaturesComponent } from '../features/features.component';
import { ViewportScroller } from '@angular/common';
import { ReverseParallaxComponent } from '../animations/reverse-parallax/reverse-parallax.component';
import { gsap } from 'gsap';
import { AosService } from '../../Services/aos.service';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ActivatedRoute } from '@angular/router';
gsap.registerPlugin(ScrollTrigger);
interface ParallaxElement {
  element: HTMLElement;
  speed: number;
  initialPosition: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ServicesOverviewComponent,
    AboutUsComponent,
    ContactComponent,
    FeaturesComponent,
    ReverseParallaxComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef;
  private animationStarted = false;
  private parallaxElements: ParallaxElement[] = [];
  private rafId: number = 0;
  private scrollY = 0;
  private ticking = false;
  private mouseX = 0;
  private mouseY = 0;
  private cursorTrail: HTMLElement[] = [];
  private isReducedMotion = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private scroll: ViewportScroller,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private aos: AosService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check for reduced motion preference
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Initialize scroll position
      this.scroll.scrollToPosition([0, 0]);
      
      // Setup performance optimizations
      this.setupPerformanceOptimizations();
    }
  }
  
  ngAfterViewInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100); // Pequeño retardo para asegurar que el DOM esté listo
      }
    });
  
    if (isPlatformBrowser(this.platformId)) {
      // Initialize all animations with proper timing
      setTimeout(() => {
        this.initializeHeroAnimations();
        this.setupAdvancedCursor();
        this.setupFloatingElements();
        this.aos.refresh();
      }, 100);
    }
    
  }
  
  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Clean up animations
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      // Clean up cursor trail
      this.cursorTrail.forEach(element => element.remove());
      
      // Clean up scroll listeners
      if (this.scrollListeners) {
        this.scrollListeners.forEach(cleanup => cleanup());
        this.scrollListeners = [];
      }
      
      // Remove event listeners
      document.removeEventListener('mousemove', this.handleMouseMove);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId) || this.isReducedMotion) return;
    
    this.scrollY = window.pageYOffset;
    
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateFloatingElements();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }


  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId) || this.isReducedMotion) return;
    
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    
    // Update 3D tilt effects
    this.update3DTilt();
    
    // Update cursor trail
    this.updateCursorTrail(event);
  }

  private setupPerformanceOptimizations(): void {
    // Enable hardware acceleration for key elements
    const heroContent = this.elementRef.nativeElement.querySelector('.hero-content');
    if (heroContent) {
      this.renderer.setStyle(heroContent, 'transform', 'translateZ(0)');
      this.renderer.setStyle(heroContent, 'will-change', 'transform');
    }

    // Optimize images and heavy elements
    const neuralNetwork = this.elementRef.nativeElement.querySelector('.neural-network-container');
    if (neuralNetwork) {
      this.renderer.setStyle(neuralNetwork, 'will-change', 'transform, opacity');
    }
  }

  private initializeHeroAnimations(): void {
    if (this.animationStarted) return;
    
    const heroContent = this.elementRef.nativeElement.querySelector('.hero-content');
    if (heroContent) {
      heroContent.classList.add('revealed');
      this.startEnhancedHeroSequence();
    }
    
    this.animationStarted = true;
  }

  private startEnhancedHeroSequence(): void {
    this.animateHeroWithGsap();
    // Enhanced logo animation with particle burst
    this.animateLogoWithParticles();
    
    // Enhanced typewriter effect
    setTimeout(() => {
      this.startEnhancedTypewriter();
    }, 800);
    
    // Staggered content reveal
    setTimeout(() => {
      this.revealContentWithStagger();
    }, 2500);
    
    // Neural network with advanced effects
    setTimeout(() => {
      this.startAdvancedNeuralNetwork();
    }, 3500);
  }

  private animateHeroWithGsap(): void {
    const header = this.elementRef.nativeElement.querySelector('.hero-header');
    if (header) {
      gsap.from(header, { opacity: 0, y: -50, duration: 1, ease: 'power2.out' });
    }
  }

  private animateLogoWithParticles(): void {
    const logo = this.elementRef.nativeElement.querySelector('.hero-logo');
    if (!logo) return;

    // Create particle burst effect
    this.createParticleBurst(logo);
    
    // Enhanced logo animation
    logo.style.transform = 'scale(0.5) rotate(-180deg)';
    logo.style.opacity = '0';
    
    setTimeout(() => {
      logo.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      logo.style.transform = 'scale(1) rotate(0deg)';
      logo.style.opacity = '1';
    }, 100);
  }

  private createParticleBurst(centerElement: HTMLElement): void {
    const rect = centerElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
      const particle = this.renderer.createElement('div');
      this.renderer.setStyle(particle, 'position', 'fixed');
      this.renderer.setStyle(particle, 'width', '4px');
      this.renderer.setStyle(particle, 'height', '4px');
      this.renderer.setStyle(particle, 'background', `hsl(${220 + Math.random() * 60}, 100%, 70%)`);
      this.renderer.setStyle(particle, 'border-radius', '50%');
      this.renderer.setStyle(particle, 'pointer-events', 'none');
      this.renderer.setStyle(particle, 'z-index', '1000');
      this.renderer.setStyle(particle, 'left', `${centerX}px`);
      this.renderer.setStyle(particle, 'top', `${centerY}px`);
      
      document.body.appendChild(particle);

      const angle = (i / 20) * Math.PI * 2;
      const velocity = 100 + Math.random() * 100;
      const endX = centerX + Math.cos(angle) * velocity;
      const endY = centerY + Math.sin(angle) * velocity;

      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: '1' },
        { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`, opacity: '0' }
      ], {
        duration: 1000 + Math.random() * 500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => particle.remove();
    }
  }
  scrollTo(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  private startEnhancedTypewriter(): void {
    const titleElement = this.elementRef.nativeElement.querySelector('.hero-title');
    if (!titleElement) return;

    const text = 'Transforma Tus Datos En\nDecisiones Estratégicas';
    const lines = text.split('\n');
    
    titleElement.innerHTML = '';
    titleElement.classList.add('typewriter-effect');

    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentContent = '';

    const typeChar = () => {
      if (currentLineIndex >= lines.length) {
        titleElement.classList.add('typing-complete');
        return;
      }

      const currentLine = lines[currentLineIndex];
      
      if (currentCharIndex < currentLine.length) {
        currentContent += currentLine[currentCharIndex];
        
        // Add glitch effect occasionally
        if (Math.random() < 0.1) {
          const glitchChar = String.fromCharCode(65 + Math.random() * 26);
          titleElement.innerHTML = currentContent.slice(0, -1) + glitchChar + 
                                  '<span class="cursor">|</span>';
          
          setTimeout(() => {
            titleElement.innerHTML = currentContent + '<span class="cursor">|</span>';
          }, 50);
        } else {
          titleElement.innerHTML = currentContent + '<span class="cursor">|</span>';
        }
        
        currentCharIndex++;
        setTimeout(typeChar, 50 + Math.random() * 100);
      } else {
        // Move to next line
        currentLineIndex++;
        currentCharIndex = 0;
        
        if (currentLineIndex < lines.length) {
          currentContent += '<br>';
          setTimeout(typeChar, 300);
        } else {
          setTimeout(typeChar, 100);
        }
      }
    };

    typeChar();
  }

  private revealContentWithStagger(): void {
    const elements = [
      '.hero-description',
      '.hero-buttons'
    ];

    elements.forEach((selector, index) => {
      const element = this.elementRef.nativeElement.querySelector(selector);
      if (element) {
        // Hacer visible inmediatamente pero con transformación inicial
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.display = 'block';
        
        setTimeout(() => {
          element.style.transform = 'translateY(30px) scale(0.95)';
          element.style.filter = 'blur(5px)';
          element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          
          setTimeout(() => {
            element.style.transform = 'translateY(0) scale(1)';
            element.style.filter = 'blur(0px)';
            element.classList.add('show');
          }, 50);
        }, index * 400);
      }
    });
  }

  private startAdvancedNeuralNetwork(): void {
    const networkContainer = this.elementRef.nativeElement.querySelector('.neural-network-container');
    if (!networkContainer) return;

    // Asegurar que los elementos anteriores estén visibles
    this.ensureElementsVisible();

    // El contenedor aparece normalmente (sin animaciones especiales)
    networkContainer.style.opacity = '1';
    networkContainer.style.transform = 'translateY(0) scale(1)';
    networkContainer.style.filter = 'blur(0px)';

    // Configurar el parallax de los elementos internos DESPUÉS de que el contenedor sea visible
    setTimeout(() => {
      this.setupNeuralElementsScrollAssembly(networkContainer);
    }, 100);
  }

  private setupNeuralElementsScrollAssembly(networkContainer: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Obtener todos los elementos de la red neuronal
    const leftNodes = networkContainer.querySelectorAll('.input-layer circle');
    const centerNodes = networkContainer.querySelectorAll('.hidden-layer-1 circle');
    const rightNodes = networkContainer.querySelectorAll('.hidden-layer-2 circle, .output-layer circle');
    const connections = networkContainer.querySelectorAll('.connection');
    const centerText = networkContainer.querySelector('.network-title');
    const metrics = networkContainer.querySelector('.metrics-overlay');

    // Estado para controlar si la animación ya se completó
    let animationCompleted = false;
    let lastProgress = -1; // Para evitar actualizaciones innecesarias
    let animationStarted = false; // Para saber si la animación ya comenzó

    const handleNeuralAssembly = () => {
      // Si la animación ya se completó, no hacer nada más
      if (animationCompleted) return;

      const containerRect = networkContainer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Verificar si el contenedor es visible (al menos un 20% visible)
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      const containerHeight = containerRect.height;
      
      // El contenedor es visible si su parte inferior está arriba del viewport
      // y su parte superior está debajo del viewport
      const isVisible = containerBottom > windowHeight * 0.2 && containerTop < windowHeight * 0.8;
      
      if (!isVisible) {
        // Si no es visible, no hacer nada
        return;
      }
      
      // Si es la primera vez que es visible, marcar como iniciado
      if (!animationStarted) {
        animationStarted = true;
      }
      
      // Calcular el progreso basado en la posición del contenedor
      let progress = 0;
      
      // Punto donde empieza la animación (cuando el contenedor está 80% abajo en la pantalla)
      const startPoint = windowHeight * 0.8;
      // Punto donde termina (cuando el contenedor está 30% desde arriba)
      const endPoint = windowHeight * 0.3;
      
      if (containerTop > startPoint) {
        // Aún no empezamos
        progress = 0;
      } else if (containerTop < endPoint) {
        // Ya terminamos
        progress = 1;
      } else {
        // Estamos en medio de la animación
        const totalDistance = startPoint - endPoint;
        const currentDistance = startPoint - containerTop;
        progress = currentDistance / totalDistance;
      }
      
      // Aplicar una curva de aceleración para que se vea más natural
      progress = this.easeInOutQuad(progress);
      
      // Clamp progress between 0 and 1
      progress = Math.max(0, Math.min(1, progress));

      // Solo actualizar si el progreso cambió significativamente
      if (Math.abs(progress - lastProgress) < 0.005) return;
      lastProgress = progress;

      // Si llegamos al 100%, marcar como completado
      if (progress >= 0.99 && !animationCompleted) {
        animationCompleted = true;
        progress = 1; // Asegurar que sea exactamente 1
        
        // Aplicar estado final
        this.applyFinalState(leftNodes, centerNodes, rightNodes, connections, centerText, metrics);
        
        // Remover el listener de scroll después de un delay
        setTimeout(() => {
          window.removeEventListener('scroll', throttledScroll);
        }, 500);
        
        return;
      }

      // Aplicar las transformaciones basadas en el progreso
      this.updateNeuralAssembly(leftNodes, centerNodes, rightNodes, connections, centerText, metrics, progress);
    };

    // Event listener optimizado para scroll
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleNeuralAssembly();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // También verificar al inicio por si ya está visible
    setTimeout(() => {
      handleNeuralAssembly();
    }, 100);

    // Limpiar el listener cuando el componente se destruya
    this.scrollListeners = this.scrollListeners || [];
    this.scrollListeners.push(() => {
      window.removeEventListener('scroll', throttledScroll);
    });
  }

  // Nueva función de easing más suave
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  private applyFinalState(leftNodes: NodeListOf<Element>, centerNodes: NodeListOf<Element>, rightNodes: NodeListOf<Element>, connections: NodeListOf<Element>, centerText: Element | null, metrics: Element | null): void {
    // Aplicar estado final a todos los elementos
    leftNodes.forEach((node) => {
      const htmlNode = node as HTMLElement;
      htmlNode.style.transform = 'translateX(0) translateY(0) rotate(0deg) scale(1)';
      htmlNode.style.opacity = '1';
      htmlNode.style.transition = 'none';
    });

    centerNodes.forEach((node) => {
      const htmlNode = node as HTMLElement;
      htmlNode.style.transform = 'translateX(0) translateY(0) rotate(0deg) scale(1)';
      htmlNode.style.opacity = '1';
      htmlNode.style.transition = 'none';
    });

    rightNodes.forEach((node) => {
      const htmlNode = node as HTMLElement;
      htmlNode.style.transform = 'translateX(0) translateY(0) rotate(0deg) scale(1)';
      htmlNode.style.opacity = '1';
      htmlNode.style.transition = 'none';
    });

    connections.forEach((connection) => {
      const htmlConnection = connection as HTMLElement;
      htmlConnection.style.opacity = '0.8';
      htmlConnection.style.transform = 'scaleX(1) scaleY(1)';
      htmlConnection.style.strokeDashoffset = '0';
      htmlConnection.style.transition = 'none';
      if (!htmlConnection.style.animation) {
        htmlConnection.style.animation = 'dataFlow 2s linear infinite';
      }
    });

    if (centerText) {
      (centerText as HTMLElement).style.transform = 'translateY(0) scale(1) rotate(0deg)';
      (centerText as HTMLElement).style.opacity = '1';
      (centerText as HTMLElement).style.filter = 'blur(0px)';
      (centerText as HTMLElement).style.transition = 'none';
    }

    if (metrics) {
      (metrics as HTMLElement).style.transform = 'translateY(0) scale(1) rotate(0deg)';
      (metrics as HTMLElement).style.opacity = '0.7';
      (metrics as HTMLElement).style.filter = 'blur(0px)';
      (metrics as HTMLElement).style.transition = 'none';
    }
  }



  private setDisassembledPositions(leftNodes: NodeListOf<Element>, centerNodes: NodeListOf<Element>, rightNodes: NodeListOf<Element>, connections: NodeListOf<Element>, centerText: Element | null, metrics: Element | null): void {
    // Nodos izquierdos - muy lejos a la izquierda
    leftNodes.forEach((node, index) => {
      const htmlNode = node as HTMLElement;
      htmlNode.style.transform = `translateX(-400px) translateY(${-100 + index * 50}px) rotate(${Math.random() * 360}deg) scale(0.3)`;
      htmlNode.style.opacity = '0.2';
      htmlNode.style.transition = 'all 0.1s ease-out';
    });

    // Nodos centrales - dispersos arriba y abajo
    centerNodes.forEach((node, index) => {
      const htmlNode = node as HTMLElement;
      const randomY = index % 2 === 0 ? -200 : 200;
      const randomX = (Math.random() - 0.5) * 300;
      htmlNode.style.transform = `translateX(${randomX}px) translateY(${randomY}px) rotate(${Math.random() * 360}deg) scale(0.2)`;
      htmlNode.style.opacity = '0.1';
      htmlNode.style.transition = 'all 0.1s ease-out';
    });

    // Nodos derechos - muy lejos a la derecha
    rightNodes.forEach((node, index) => {
      const htmlNode = node as HTMLElement;
      htmlNode.style.transform = `translateX(400px) translateY(${-80 + index * 60}px) rotate(${Math.random() * 360}deg) scale(0.4)`;
      htmlNode.style.opacity = '0.3';
      htmlNode.style.transition = 'all 0.1s ease-out';
    });

    // Conexiones - invisibles y deformadas
    connections.forEach((connection, index) => {
      const htmlConnection = connection as HTMLElement;
      htmlConnection.style.opacity = '0';
      htmlConnection.style.strokeDasharray = '20 10';
      htmlConnection.style.strokeDashoffset = '50';
      htmlConnection.style.transform = `scaleX(0.1) scaleY(${0.1 + Math.random() * 0.5})`;
      htmlConnection.style.transition = 'all 0.1s ease-out';
    });

    // Texto central - fragmentado
    if (centerText) {
      (centerText as HTMLElement).style.transform = 'translateY(-150px) scale(0) rotate(90deg)';
      (centerText as HTMLElement).style.opacity = '0';
      (centerText as HTMLElement).style.filter = 'blur(10px)';
      (centerText as HTMLElement).style.transition = 'all 0.1s ease-out';
    }

    // Métricas - esparcidas
    if (metrics) {
      (metrics as HTMLElement).style.transform = 'translateY(200px) scale(0.1) rotate(-45deg)';
      (metrics as HTMLElement).style.opacity = '0';
      (metrics as HTMLElement).style.filter = 'blur(8px)';
      (metrics as HTMLElement).style.transition = 'all 0.1s ease-out';
    }
  }

  private updateNeuralAssembly(leftNodes: NodeListOf<Element>, centerNodes: NodeListOf<Element>, rightNodes: NodeListOf<Element>, connections: NodeListOf<Element>, centerText: Element | null, metrics: Element | null, progress: number): void {
  
    // Animar nodos izquierdos hacia sus posiciones finales
    leftNodes.forEach((node, index) => {
      const htmlNode = node as HTMLElement;
        htmlNode.style.transform = 'translateX(0) translateY(0) rotate(0deg) scale(1)';
        htmlNode.style.opacity = '1';
      
    });
  
    // Similar para los demás nodos... (el resto del código con los mismos cambios)
  }


  private scrollListeners: (() => void)[] = [];

  private ensureElementsVisible(): void {
    // Asegurar que descripción y botones sean visibles
    const description = this.elementRef.nativeElement.querySelector('.hero-description');
    const buttons = this.elementRef.nativeElement.querySelector('.hero-buttons');
    
    if (description) {
      description.style.opacity = '1';
      description.style.visibility = 'visible';
      description.style.display = 'block';
      description.classList.add('show');
    }
    
    if (buttons) {
      buttons.style.opacity = '1';
      buttons.style.visibility = 'visible';
      buttons.style.display = 'flex';
      buttons.classList.add('show');
    }
  }

 

  private setupAdvancedCursor(): void {
    if (!isPlatformBrowser(this.platformId) || this.isReducedMotion) return;

    const cursor = this.elementRef.nativeElement.querySelector('.glow-cursor');
    if (!cursor) return;

    // Enhanced cursor with trail
    cursor.style.width = '30px';
    cursor.style.height = '30px';
    cursor.style.background = 'radial-gradient(circle, rgba(94, 137, 176, 0.8) 0%, rgba(94, 137, 176, 0.2) 70%, transparent 100%)';
    cursor.style.filter = 'blur(2px)';
    cursor.style.transition = 'transform 0.1s ease-out';
  }

  private updateCursorTrail(event: MouseEvent): void {
    // Update main cursor
    const cursor = this.elementRef.nativeElement.querySelector('.glow-cursor');
    if (cursor) {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    }

    // Create trail particles
    if (this.cursorTrail.length > 15) {
      const oldParticle = this.cursorTrail.shift();
      if (oldParticle) oldParticle.remove();
    }

    const particle = this.renderer.createElement('div');
    this.renderer.setStyle(particle, 'position', 'fixed');
    this.renderer.setStyle(particle, 'width', '8px');
    this.renderer.setStyle(particle, 'height', '8px');
    this.renderer.setStyle(particle, 'background', 'rgba(94, 137, 176, 0.6)');
    this.renderer.setStyle(particle, 'border-radius', '50%');
    this.renderer.setStyle(particle, 'pointer-events', 'none');
    this.renderer.setStyle(particle, 'z-index', '9998');
    this.renderer.setStyle(particle, 'left', `${event.clientX}px`);
    this.renderer.setStyle(particle, 'top', `${event.clientY}px`);
    this.renderer.setStyle(particle, 'transform', 'translate(-50%, -50%)');
    
    document.body.appendChild(particle);
    this.cursorTrail.push(particle);

    // Animate trail particle
    particle.animate([
      { opacity: '0.8', transform: 'translate(-50%, -50%) scale(1)' },
      { opacity: '0', transform: 'translate(-50%, -50%) scale(0.2)' }
    ], {
      duration: 800,
      easing: 'ease-out'
    }).onfinish = () => {
      const index = this.cursorTrail.indexOf(particle);
      if (index > -1) {
        this.cursorTrail.splice(index, 1);
      }
      particle.remove();
    };
  }

  private update3DTilt(): void {
    const heroContent = this.elementRef.nativeElement.querySelector('.hero-content');
    if (!heroContent) return;

    const rect = heroContent.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (this.mouseX - centerX) / (rect.width / 2);
    const deltaY = (this.mouseY - centerY) / (rect.height / 2);

    const tiltX = deltaY * 5;
    const tiltY = deltaX * -5;

    heroContent.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(0)`;
  }

  private setupFloatingElements(): void {
    if (!isPlatformBrowser(this.platformId) || this.isReducedMotion) return;

    // Create floating geometric shapes
    for (let i = 0; i < 5; i++) {
      this.createFloatingShape();
    }
  }

  private createFloatingShape(): void {
    const shape = this.renderer.createElement('div');
    const shapes = ['circle', 'triangle', 'square'];
    const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
    
    this.renderer.setStyle(shape, 'position', 'fixed');
    this.renderer.setStyle(shape, 'pointer-events', 'none');
    this.renderer.setStyle(shape, 'z-index', '1');
    this.renderer.setStyle(shape, 'opacity', '0.1');
    
    const size = 20 + Math.random() * 40;
    this.renderer.setStyle(shape, 'width', `${size}px`);
    this.renderer.setStyle(shape, 'height', `${size}px`);
    
    if (shapeType === 'circle') {
      this.renderer.setStyle(shape, 'border-radius', '50%');
      this.renderer.setStyle(shape, 'background', 'linear-gradient(45deg, rgba(94, 137, 176, 0.3), rgba(110, 86, 207, 0.3))');
    } else if (shapeType === 'triangle') {
      this.renderer.setStyle(shape, 'width', '0');
      this.renderer.setStyle(shape, 'height', '0');
      this.renderer.setStyle(shape, 'border-left', `${size/2}px solid transparent`);
      this.renderer.setStyle(shape, 'border-right', `${size/2}px solid transparent`);
      this.renderer.setStyle(shape, 'border-bottom', `${size}px solid rgba(94, 137, 176, 0.2)`);
    } else {
      this.renderer.setStyle(shape, 'background', 'rgba(110, 86, 207, 0.2)');
      this.renderer.setStyle(shape, 'transform', 'rotate(45deg)');
    }
    
    this.renderer.setStyle(shape, 'left', `${Math.random() * window.innerWidth}px`);
    this.renderer.setStyle(shape, 'top', `${Math.random() * window.innerHeight}px`);
    
    document.body.appendChild(shape);

    // Animate floating
    const duration = 10000 + Math.random() * 10000;
    shape.animate([
      { transform: `translateY(0) rotate(0deg)`, opacity: '0.1' },
      { transform: `translateY(-100px) rotate(360deg)`, opacity: '0.05' },
      { transform: `translateY(0) rotate(720deg)`, opacity: '0.1' }
    ], {
      duration,
      iterations: Infinity,
      easing: 'ease-in-out'
    });

    // Remove after some time
    setTimeout(() => shape.remove(), duration * 3);
  }

  private updateFloatingElements(): void {
    // This could be used to adjust floating elements based on scroll
    // Currently handled by CSS animations
  }



  private handleMouseMove = (event: MouseEvent): void => {
    this.onMouseMove(event);
  }

  scrollToTop(): void {
    this.scroll.scrollToPosition([0, 0]);
  }
}