// home.component.ts - Enhanced version with improved animations and parallax
import { Component, OnInit, PLATFORM_ID, Inject, HostListener, AfterViewInit, OnDestroy, ViewEncapsulation, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicesOverviewComponent } from '../services-overview/services-overview.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { ContactComponent } from '../contact/contact.component';
import { FeaturesComponent } from '../features/features.component';
import { ScrollService } from '../../Services/scroll.service';
import { ViewportScroller } from '@angular/common';
import { ReverseParallaxComponent } from '../animations/reverse-parallax/reverse-parallax.component';

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
  private animationStarted = false;
  private elementsToAnimate: Array<Element> = [];
  private observer: IntersectionObserver | null = null;
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
    private scrollService: ScrollService,
    private elementRef: ElementRef,
    private renderer: Renderer2
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
    if (isPlatformBrowser(this.platformId)) {
      // Initialize all animations with proper timing
      setTimeout(() => {
        this.initializeHeroAnimations();
        this.setupParallaxEffects();
        this.setupAdvancedCursor();
        this.setupFloatingElements();
        this.setupScrollObserver();
      }, 100);
    }
  }
  
  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Clean up observers and animations
      if (this.observer) {
        this.observer.disconnect();
      }
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
      window.removeEventListener('resize', this.handleResize);
      document.removeEventListener('mousemove', this.handleMouseMove);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId) || this.isReducedMotion) return;
    
    this.scrollY = window.pageYOffset;
    
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateParallax();
        this.updateFloatingElements();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupParallaxEffects();
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

    // Posiciones iniciales - elementos completamente desarmados
    this.setDisassembledPositions(leftNodes, centerNodes, rightNodes, connections, centerText, metrics);

    const handleNeuralAssembly = () => {
      const containerRect = networkContainer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calcular el progreso basado en qué tan visible está el contenedor
      // 0 = apenas empieza a verse, 1 = completamente visible
      const startPoint = windowHeight * 0.8; // Comienza cuando está 80% visible
      const endPoint = windowHeight * 0.2;   // Termina cuando está 20% de la parte superior
      
      let progress = 0;
      if (containerRect.top <= startPoint) {
        progress = Math.min(1, (startPoint - containerRect.top) / (startPoint - endPoint));
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

    // Ejecutar una vez al inicio para establecer posiciones
    handleNeuralAssembly();

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Limpiar el listener cuando el componente se destruya
    this.scrollListeners = this.scrollListeners || [];
    this.scrollListeners.push(() => {
      window.removeEventListener('scroll', throttledScroll);
    });
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
    const easeProgress = this.easeInOutCubic(progress);

    // Animar nodos izquierdos hacia sus posiciones finales
    leftNodes.forEach((node, index) => {
      const htmlNode = node as HTMLElement;
      const nodeProgress = Math.max(0, Math.min(1, (progress - index * 0.1) / 0.8));
      const easedNodeProgress = this.easeInOutCubic(nodeProgress);
      
      const finalX = 0;
      const finalY = 0;
      const currentX = -400 * (1 - easedNodeProgress);
      const currentY = (-100 + index * 50) * (1 - easedNodeProgress);
      const currentRotation = 360 * (1 - easedNodeProgress);
      const currentScale = 0.3 + (0.7 * easedNodeProgress);
      const currentOpacity = 0.2 + (0.8 * easedNodeProgress);

      htmlNode.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${currentRotation}deg) scale(${currentScale})`;
      htmlNode.style.opacity = currentOpacity.toString();
    });

    // Animar nodos centrales desde posiciones dispersas
    centerNodes.forEach((node, index) => {
      const htmlNode = node as HTMLElement;
      const nodeProgress = Math.max(0, Math.min(1, (progress - 0.2 - index * 0.1) / 0.6));
      const easedNodeProgress = this.easeInOutCubic(nodeProgress);
      
      const startY = index % 2 === 0 ? -200 : 200;
      const startX = (Math.random() - 0.5) * 300;
      const currentX = startX * (1 - easedNodeProgress);
      const currentY = startY * (1 - easedNodeProgress);
      const currentRotation = 360 * (1 - easedNodeProgress);
      const currentScale = 0.2 + (0.8 * easedNodeProgress);
      const currentOpacity = 0.1 + (0.9 * easedNodeProgress);

      htmlNode.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${currentRotation}deg) scale(${currentScale})`;
      htmlNode.style.opacity = currentOpacity.toString();
    });

    // Animar nodos derechos
    rightNodes.forEach((node, index) => {
      const htmlNode = node as HTMLElement;
      const nodeProgress = Math.max(0, Math.min(1, (progress - 0.3 - index * 0.1) / 0.7));
      const easedNodeProgress = this.easeInOutCubic(nodeProgress);
      
      const currentX = 400 * (1 - easedNodeProgress);
      const currentY = (-80 + index * 60) * (1 - easedNodeProgress);
      const currentRotation = 360 * (1 - easedNodeProgress);
      const currentScale = 0.4 + (0.6 * easedNodeProgress);
      const currentOpacity = 0.3 + (0.7 * easedNodeProgress);

      htmlNode.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${currentRotation}deg) scale(${currentScale})`;
      htmlNode.style.opacity = currentOpacity.toString();
    });

    // Animar conexiones
    connections.forEach((connection, index) => {
      const htmlConnection = connection as HTMLElement;
      const connectionProgress = Math.max(0, Math.min(1, (progress - 0.5) / 0.5));
      const easedConnectionProgress = this.easeInOutCubic(connectionProgress);
      
      const currentOpacity = easedConnectionProgress * 0.8;
      const currentScaleX = 0.1 + (0.9 * easedConnectionProgress);
      const currentScaleY = (0.1 + Math.random() * 0.5) + ((1 - (0.1 + Math.random() * 0.5)) * easedConnectionProgress);
      const currentDashOffset = 50 * (1 - easedConnectionProgress);

      htmlConnection.style.opacity = currentOpacity.toString();
      htmlConnection.style.transform = `scaleX(${currentScaleX}) scaleY(${currentScaleY})`;
      htmlConnection.style.strokeDashoffset = currentDashOffset.toString();

      // Activar animación de flujo cuando esté completamente formada
      if (connectionProgress >= 0.9) {
        htmlConnection.style.animation = 'dataFlow 2s linear infinite';
      }
    });

    // Animar texto central
    if (centerText) {
      const textProgress = Math.max(0, Math.min(1, (progress - 0.6) / 0.4));
      const easedTextProgress = this.easeInOutCubic(textProgress);
      
      const currentY = -150 * (1 - easedTextProgress);
      const currentScale = easedTextProgress;
      const currentRotation = 90 * (1 - easedTextProgress);
      const currentOpacity = easedTextProgress;
      const currentBlur = 10 * (1 - easedTextProgress);

      (centerText as HTMLElement).style.transform = `translateY(${currentY}px) scale(${currentScale}) rotate(${currentRotation}deg)`;
      (centerText as HTMLElement).style.opacity = currentOpacity.toString();
      (centerText as HTMLElement).style.filter = `blur(${currentBlur}px)`;
    }

    // Animar métricas
    if (metrics) {
      const metricsProgress = Math.max(0, Math.min(1, (progress - 0.8) / 0.2));
      const easedMetricsProgress = this.easeInOutCubic(metricsProgress);
      
      const currentY = 200 * (1 - easedMetricsProgress);
      const currentScale = 0.1 + (0.9 * easedMetricsProgress);
      const currentRotation = -45 * (1 - easedMetricsProgress);
      const currentOpacity = 0.7 * easedMetricsProgress;
      const currentBlur = 8 * (1 - easedMetricsProgress);

      (metrics as HTMLElement).style.transform = `translateY(${currentY}px) scale(${currentScale}) rotate(${currentRotation}deg)`;
      (metrics as HTMLElement).style.opacity = currentOpacity.toString();
      (metrics as HTMLElement).style.filter = `blur(${currentBlur}px)`;
    }
  }

  // Función de easing para transiciones más suaves
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Array para almacenar listeners de scroll para limpieza
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

  private animateNeuralElements(): void {
    const nodes = this.elementRef.nativeElement.querySelectorAll('.node');
    const connections = this.elementRef.nativeElement.querySelectorAll('.connection');

    // Animate nodes with ripple effect
    nodes.forEach((node: HTMLElement, index: number) => {
      setTimeout(() => {
        node.style.transform = 'scale(0)';
        node.style.opacity = '0';
        node.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        setTimeout(() => {
          node.style.transform = 'scale(1)';
          node.style.opacity = '1';
          
          // Add ripple effect
          this.createRippleEffect(node);
        }, 50);
      }, index * 150);
    });

    // Animate connections with flow effect
    connections.forEach((connection: HTMLElement, index: number) => {
      setTimeout(() => {
        connection.style.strokeDasharray = '5 5';
        connection.style.strokeDashoffset = '10';
        connection.style.opacity = '1';
        connection.style.animation = 'dataFlow 2s linear infinite';
      }, 500 + index * 100);
    });
  }

  private createRippleEffect(element: HTMLElement): void {
    const ripple = this.renderer.createElement('div');
    const rect = element.getBoundingClientRect();
    
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'border-radius', '50%');
    this.renderer.setStyle(ripple, 'background', 'rgba(94, 137, 176, 0.3)');
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.setStyle(ripple, 'pointer-events', 'none');
    this.renderer.setStyle(ripple, 'left', '50%');
    this.renderer.setStyle(ripple, 'top', '50%');
    this.renderer.setStyle(ripple, 'width', '20px');
    this.renderer.setStyle(ripple, 'height', '20px');
    this.renderer.setStyle(ripple, 'margin-left', '-10px');
    this.renderer.setStyle(ripple, 'margin-top', '-10px');
    
    element.style.position = 'relative';
    element.appendChild(ripple);

    ripple.animate([
      { transform: 'scale(0)', opacity: '0.6' },
      { transform: 'scale(3)', opacity: '0' }
    ], {
      duration: 800,
      easing: 'ease-out'
    }).onfinish = () => ripple.remove();
  }

  private setupParallaxEffects(): void {
    if (!isPlatformBrowser(this.platformId) || this.isReducedMotion) return;

    this.parallaxElements = [];

    // Hero background elements
    const glowElements = this.elementRef.nativeElement.querySelectorAll('.glow');
    glowElements.forEach((element: HTMLElement, index: number) => {
      this.parallaxElements.push({
        element,
        speed: 0.3 + (index * 0.1),
        initialPosition: 0
      });
    });

    // Hero radial background
    const radialBg = this.elementRef.nativeElement.querySelector('.hero-radial-bg');
    if (radialBg) {
      this.parallaxElements.push({
        element: radialBg,
        speed: 0.5,
        initialPosition: 0
      });
    }

    // Neural network with depth
    const neuralNetwork = this.elementRef.nativeElement.querySelector('.neural-network-container');
    if (neuralNetwork) {
      this.parallaxElements.push({
        element: neuralNetwork,
        speed: 0.8,
        initialPosition: 0
      });
    }

    // Component sections with different depths
    const sections = this.elementRef.nativeElement.querySelectorAll('app-services-overview, app-about-us, app-contact, app-features');
    sections.forEach((section: HTMLElement, index: number) => {
      this.parallaxElements.push({
        element: section,
        speed: 0.9 + (index * 0.02),
        initialPosition: 0
      });
    });
  }

  private updateParallax(): void {
    if (!this.parallaxElements.length) return;

    this.parallaxElements.forEach(({ element, speed }) => {
      const yPos = -(this.scrollY * speed);
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
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

  private setupScrollObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const options = {
      root: null,
      rootMargin: '0px 0px -20% 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Agregar transición inmersiva
          this.addImmersiveTransition(entry.target as HTMLElement);
          
          entry.target.classList.add('revealed');
          
          // Efectos especiales para componentes específicos
          this.enhanceComponentReveal(entry.target as HTMLElement);
          
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    // Observar elementos immersivos
    const elements = this.elementRef.nativeElement.querySelectorAll('.scroll-reveal, .immersive-element');
    elements.forEach((element: HTMLElement) => {
      this.observer?.observe(element);
    });
  }

  private addImmersiveTransition(element: HTMLElement): void {
    const section = element.closest('.immersive-section') as HTMLElement;
    if (section) {
      section.classList.add('transitioning');
      
      // Crear efecto de partículas durante la transición
      this.createTransitionParticles(element);
      
      // Remover la clase después de la transición
      setTimeout(() => {
        section.classList.remove('transitioning');
      }, 1500);
    }
  }

  private createTransitionParticles(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const particle = this.renderer.createElement('div');
        this.renderer.setStyle(particle, 'position', 'fixed');
        this.renderer.setStyle(particle, 'width', '4px');
        this.renderer.setStyle(particle, 'height', '4px');
        this.renderer.setStyle(particle, 'background', `hsl(${220 + Math.random() * 60}, 80%, 70%)`);
        this.renderer.setStyle(particle, 'border-radius', '50%');
        this.renderer.setStyle(particle, 'pointer-events', 'none');
        this.renderer.setStyle(particle, 'z-index', '1000');
        this.renderer.setStyle(particle, 'opacity', '0.8');
        
        const startX = rect.left + Math.random() * rect.width;
        const startY = rect.top + rect.height;
        const endX = startX + (Math.random() - 0.5) * 200;
        const endY = startY - 100 - Math.random() * 100;
        
        this.renderer.setStyle(particle, 'left', `${startX}px`);
        this.renderer.setStyle(particle, 'top', `${startY}px`);
        
        document.body.appendChild(particle);

        particle.animate([
          { 
            transform: 'translate(0, 0) scale(1)', 
            opacity: '0.8' 
          },
          { 
            transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0)`, 
            opacity: '0' 
          }
        ], {
          duration: 1000 + Math.random() * 500,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
      }, i * 50);
    }
  }

  private enhanceComponentReveal(element: HTMLElement): void {
    // Add particle effects when components are revealed
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.createRevealParticle(rect);
      }, i * 100);
    }
  }

  private createRevealParticle(rect: DOMRect): void {
    const particle = this.renderer.createElement('div');
    this.renderer.setStyle(particle, 'position', 'fixed');
    this.renderer.setStyle(particle, 'width', '6px');
    this.renderer.setStyle(particle, 'height', '6px');
    this.renderer.setStyle(particle, 'background', `hsl(${220 + Math.random() * 60}, 70%, 60%)`);
    this.renderer.setStyle(particle, 'border-radius', '50%');
    this.renderer.setStyle(particle, 'pointer-events', 'none');
    this.renderer.setStyle(particle, 'z-index', '1000');
    this.renderer.setStyle(particle, 'left', `${rect.left + Math.random() * rect.width}px`);
    this.renderer.setStyle(particle, 'top', `${rect.top + rect.height}px`);
    
    document.body.appendChild(particle);

    particle.animate([
      { transform: 'translateY(0) scale(1)', opacity: '1' },
      { transform: `translateY(-${50 + Math.random() * 100}px) scale(0)`, opacity: '0' }
    ], {
      duration: 1000 + Math.random() * 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => particle.remove();
  }

  private handleResize = (): void => {
    if (isPlatformBrowser(this.platformId)) {
      this.setupParallaxEffects();
    }
  }

  private handleMouseMove = (event: MouseEvent): void => {
    this.onMouseMove(event);
  }

  scrollToTop(): void {
    this.scroll.scrollToPosition([0, 0]);
  }
}