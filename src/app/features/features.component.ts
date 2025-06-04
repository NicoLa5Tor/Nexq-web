// features.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ViewEncapsulation, HostListener, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { AosService } from '../../Services/aos.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface CursorPoint {
  x: number;
  y: number;
  age: number;
  element: HTMLElement;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  // Mantenemos la encapsulación que necesitas
  encapsulation: ViewEncapsulation.Emulated,
  animations: [
    trigger('cardState', [
      state('default', style({
        transform: 'translateY(0) rotateX(0) rotateY(0) scale(1)',
      })),
      state('selected', style({
        transform: 'translateY(-25px) rotateX(12deg) rotateY(12deg) scale(1.08)',
        boxShadow: '-18px 22px 35px rgba(0, 0, 0, 0.3), 18px 12px 35px rgba(0, 0, 0, 0.2), 0 0 0 5px rgba(110, 86, 207, 0.15)'
      })),
      transition('default => selected', animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.5)')),
      transition('selected => default', animate('200ms ease-out'))
    ])
  ]
})
export class FeaturesComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedCard: number = -1; // -1 significa ninguna tarjeta seleccionada
  @ViewChild('sectionTitle') sectionTitleElement!: ElementRef;
  @ViewChild('featuresSection') featuresSection!: ElementRef;
  
  // Título visible siempre
  titleText = 'Nuestras Soluciones de IA';
  showDefaultTitle = true; // Mostramos el título por defecto inicialmente
  
  // Para el efecto 3D basado en la posición del ratón
  mousePosition = { x: 0, y: 0 };
  prevMousePosition = { x: 0, y: 0 };
  
  // Observer para detectar cuando el título está visible
  private intersectionObserver: IntersectionObserver | null = null;
  private titleAnimated = false;
  
  // Para el efecto de estela del cursor
  private cursorTrailActive = false;
  private cursorTrailContainer: HTMLElement | null = null;
  private cursorTrailPoints: CursorPoint[] = [];
  private animationFrameId: number | null = null;
  private mouseOverCard = false;
  
  // Para detección de dispositivos
  private isTouchDevice = false;
  private windowWidth = 0;
  private isReducedMotionPreferred = false;
  
  // Para verificar si estamos en el navegador
  private isBrowser: boolean;
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
    @Inject(PLATFORM_ID) private platformId: Object,
    private aos: AosService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Solo ejecutar código relacionado con el DOM en el navegador
    if (this.isBrowser) {
      // Detectar tipo de dispositivo
      this.detectDeviceCapabilities();
      
      // Asegurarnos de que las variables CSS necesarias estén definidas
      if (!this.isCssVariableDefined('--accent-primary')) {
        document.documentElement.style.setProperty('--accent-primary', '#6e56cf');
      }
      if (!this.isCssVariableDefined('--accent-secondary')) {
        document.documentElement.style.setProperty('--accent-secondary', '#8256f5');
      }
      if (!this.isCssVariableDefined('--bg-secondary')) {
        document.documentElement.style.setProperty('--bg-secondary', '#0f0f17');
      }
      if (!this.isCssVariableDefined('--text-primary')) {
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
      }
      if (!this.isCssVariableDefined('--text-secondary')) {
        document.documentElement.style.setProperty('--text-secondary', '#a0a0b0');
      }
      
      // Escuchar cambios en el tamaño de la ventana
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  ngAfterViewInit(): void {
    // Solo ejecutar código relacionado con el DOM en el navegador
    if (this.isBrowser) {
      // Inicializar el observer para la sección de características
      this.setupIntersectionObserver();
      
      // Para dispositivos móviles, podríamos omitir la animación y mostrar directamente
      if (this.isTouchDevice || this.windowWidth < 768) {
        this.showTitleImmediately();
      } else {
        // Preparar el título para animación en escritorio
        this.prepareTitle();
      }
      
      // Crear contenedor para la estela del cursor solo si no es un dispositivo táctil
      // y no se prefiere el movimiento reducido
      if (!this.isTouchDevice && !this.isReducedMotionPreferred) {
        this.setupCursorTrail();
      }

      this.aos.refresh();
    }
  }
  
  ngOnDestroy(): void {
    // Solo ejecutar código relacionado con el DOM en el navegador
    if (this.isBrowser) {
      // Limpiar el observer cuando el componente se destruye
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
        this.intersectionObserver = null;
      }
      
      // Detener la animación de la estela
      this.stopCursorTrailAnimation();
      
      // Eliminar los elementos de la estela
      this.cleanupCursorTrail();
      
      // Eliminar event listeners
      window.removeEventListener('resize', this.handleResize.bind(this));
    }
  }

  // Mostrar el título inmediatamente para dispositivos móviles
  private showTitleImmediately(): void {
    // En móviles, si la animación falla, al menos siempre tendremos el título visible
    this.showDefaultTitle = true;
    
    // Intentamos iniciar la animación de todas formas
    if (this.sectionTitleElement && this.sectionTitleElement.nativeElement) {
      const titleElement = this.sectionTitleElement.nativeElement;
      
      // Asegurarse de que el título sea visible
      titleElement.style.opacity = '1';
      
      // Intentamos la animación simplificada
      this.prepareSimplifiedAnimation();
    }
  }
  
  // Versión simplificada de la animación para móviles
  private prepareSimplifiedAnimation(): void {
    if (!this.isBrowser || !this.sectionTitleElement) return;
    
    const titleElement = this.sectionTitleElement.nativeElement;
    titleElement.innerHTML = ''; // Limpiar el contenido actual
    this.showDefaultTitle = false; // Ocultar el título por defecto
    
    // Crear el título con spans pero con opacidad inicial visible
    [...this.titleText].forEach((char, index) => {
      const span = document.createElement('span');
      
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
        span.className = 'title-space mobile-visible';
        span.style.display = 'inline-block';
        span.style.width = '0.3em';
      } else {
        span.textContent = char;
        span.classList.add('title-letter', 'mobile-visible');
      }
      
      // Hacer visible inmediatamente en móviles
      span.style.opacity = '1';
      span.style.transform = 'translateY(0)';
      
      titleElement.appendChild(span);
    });
  }

  // Detectar capacidades del dispositivo
  private detectDeviceCapabilities(): void {
    if (!this.isBrowser) return;
    
    // Detectar si es un dispositivo táctil
    this.isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) || 
                         ((navigator as any).msMaxTouchPoints > 0);
    
    // Obtener ancho de la ventana
    this.windowWidth = window.innerWidth;
    
    // Detectar preferencia de movimiento reducido
    if (window.matchMedia) {
      this.isReducedMotionPreferred = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Ajustar número de partículas basado en el ancho de la pantalla
    this.adjustTrailPointsForScreenSize();
  }
  
  // Manejar cambios en el tamaño de la ventana
  private handleResize(): void {
    if (!this.isBrowser) return;
    
    this.windowWidth = window.innerWidth;
    this.adjustTrailPointsForScreenSize();
  }
  
  // Ajustar número de partículas según tamaño de pantalla
  private adjustTrailPointsForScreenSize(): void {
    if (!this.isBrowser || !this.cursorTrailActive) return;
    
    // Eliminar puntos existentes si hay demasiados para el tamaño de pantalla actual
    const maxPoints = this.getMaxPointsForScreenSize();
    
    if (this.cursorTrailPoints.length > maxPoints) {
      const pointsToRemove = this.cursorTrailPoints.length - maxPoints;
      
      for (let i = 0; i < pointsToRemove; i++) {
        const oldestPoint = this.cursorTrailPoints.shift();
        if (oldestPoint && oldestPoint.element.parentNode) {
          oldestPoint.element.remove();
        }
      }
    }
  }
  
  // Determinar número máximo de puntos según tamaño de pantalla
  private getMaxPointsForScreenSize(): number {
    if (this.windowWidth < 576) return 10; // Móviles pequeños
    if (this.windowWidth < 768) return 15; // Móviles grandes
    if (this.windowWidth < 992) return 20; // Tablets
    if (this.windowWidth < 1200) return 25; // Laptops
    return 30; // Pantallas grandes
  }

  selectCard(index: number): void {
    // Si se hace clic en la tarjeta ya seleccionada, se deselecciona
    if (this.selectedCard === index) {
      this.selectedCard = -1;
    } else {
      this.selectedCard = index;
    }
  }
  
  // Controlamos el movimiento del ratón para efecto 3D dinámico y estela
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isBrowser) return;
    
    this.prevMousePosition = { ...this.mousePosition };
    this.mousePosition = { 
      x: event.clientX, 
      y: event.clientY 
    };
    
    // Si es un dispositivo táctil, no aplicamos la estela
    if (this.isTouchDevice || this.isReducedMotionPreferred) return;
    
    // Si el cursor está sobre una tarjeta y la estela está activa, añadir un nuevo punto
    if (this.mouseOverCard && this.cursorTrailActive) {
      this.addTrailPoint(event.clientX, event.clientY);
    }
  }
  
  // Devuelve el estado actual de la tarjeta para las animaciones
  getCardState(index: number): string {
    return this.selectedCard === index ? 'selected' : 'default';
  }
  
  // Cálculo del estilo 3D dinámico basado en la posición del ratón
  getCardTransform(element: any, index: number): object {
    if (!this.isBrowser || this.isTouchDevice || this.isReducedMotionPreferred) return {};
    
    // Convertimos el elemento a HTMLElement
    const cardElement = element as HTMLElement;
    
    if (!cardElement || (this.selectedCard !== -1 && this.selectedCard !== index)) {
      // No aplicamos transformación a las tarjetas no seleccionadas cuando hay una seleccionada
      return {};
    }
    
    if (this.selectedCard === index) {
      // La tarjeta ya está animada mediante estados, no aplicamos transformación adicional
      return {};
    }
    
    const rect = cardElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculamos la distancia desde el centro de la tarjeta al puntero
    const deltaX = this.mousePosition.x - centerX;
    const deltaY = this.mousePosition.y - centerY;
    
    // Normalizamos la distancia para obtener un efecto sutil
    // Ajustamos el ángulo máximo según el tamaño de la pantalla
    const maxRotation = this.windowWidth < 768 ? 7 : 10; // Menor ángulo en móviles
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    
    const rotateY = deltaX / width * maxRotation;
    const rotateX = -deltaY / height * maxRotation;
    
    // Solo aplicamos la transformación si el ratón está cerca de la tarjeta
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = Math.sqrt(width * width + height * height) / 4;
    
    if (distance < maxDistance) {
      const scale = 1 + (0.05 * (1 - distance / maxDistance));
      
      return {
        transform: `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(${scale})
          translateZ(10px)
        `,
        transition: 'transform 0.1s ease-out'
      };
    }
    
    return {
      transform: 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
      transition: 'transform 0.5s ease-out'
    };
  }
  
  // Eventos para activar/desactivar la estela al entrar/salir de una tarjeta
  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    if (!this.isBrowser || this.isTouchDevice || this.isReducedMotionPreferred) return;
    
    // Verificamos si el ratón está sobre una tarjeta
    const target = event.target as HTMLElement;
    const card = target.closest('.feature-card');
    
    if (card) {
      this.mouseOverCard = true;
      this.startCursorTrail();
    }
  }
  
  @HostListener('mouseout', ['$event'])
  onMouseOut(event: MouseEvent) {
    if (!this.isBrowser || this.isTouchDevice || this.isReducedMotionPreferred) return;
    
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    // Si salimos de una tarjeta y no entramos en otra
    if (!relatedTarget || !relatedTarget.closest('.feature-card')) {
      this.mouseOverCard = false;
      this.stopCursorTrail();
    }
  }

  // Configuramos el observer para detectar cuando el título está visible
  private setupIntersectionObserver(): void {
    if (!this.isBrowser) return;
    
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.15 // Reducimos para que se active antes en móviles
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.titleAnimated) {
          // El título está visible, iniciamos la animación
          if (this.isTouchDevice || this.windowWidth < 768) {
            // Para móviles ya tenemos el título visible
            this.titleAnimated = true;
          } else {
            // Para escritorio, animamos
            this.animateTitle();
            this.titleAnimated = true;
            this.showDefaultTitle = false;
          }
          
          // Una vez que se ha animado, podemos desconectar el observer
          if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
          }
        }
      });
    }, options);

    // Observamos la sección
    if (this.featuresSection && this.featuresSection.nativeElement) {
      this.intersectionObserver.observe(this.featuresSection.nativeElement);
    }
  }

  // Prepara el título con spans para cada letra, pero sin animación
  private prepareTitle(): void {
    if (!this.isBrowser || !this.sectionTitleElement) return;
    
    const titleElement = this.sectionTitleElement.nativeElement;
    titleElement.innerHTML = ''; // Limpiar el contenido actual
    
    // Crear spans individuales para cada letra y gestionar espacios
    [...this.titleText].forEach((char, index) => {
      const span = document.createElement('span');
      
      if (char === ' ') {
        // Para espacios, añadimos un espacio no rompible
        span.innerHTML = '&nbsp;';
        span.className = 'title-space'; // Clase especial para espacios
        span.style.display = 'inline-block';
        span.style.width = '0.3em'; // Ancho del espacio
      } else {
        span.textContent = char;
        span.classList.add('title-letter'); // Clase para identificar las letras del título
      }
      
      span.style.opacity = '0'; // Inicialmente invisible
      span.style.transform = 'translateY(20px)'; // Posición inicial para la animación
      titleElement.appendChild(span);
    });
    
    // Ocultar el título por defecto ya que vamos a animar
    this.showDefaultTitle = false;
  }

  // Anima las letras del título
  private animateTitle(): void {
    if (!this.isBrowser || !this.sectionTitleElement) return;
    
    const titleElement = this.sectionTitleElement.nativeElement;
    const letters = titleElement.querySelectorAll('.title-letter, .title-space');
    
    // Ajustar velocidad de animación según tamaño de pantalla
    const baseDelay = this.windowWidth < 768 ? 0.06 : 0.08;
    
    // En lugar de usar clases CSS, aplicamos la animación directamente con JavaScript
    letters.forEach((letter: HTMLElement, index: number) => {
      setTimeout(() => {
        letter.style.opacity = '1';
        letter.style.transform = 'translateY(0)';
        letter.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      }, index * baseDelay * 1000);
    });
  }
  
  // Configuración de la estela del cursor
  private setupCursorTrail(): void {
    if (!this.isBrowser) return;
    
    // Crear contenedor para la estela
    this.cursorTrailContainer = document.createElement('div');
    this.cursorTrailContainer.className = 'cursor-trail-container';
    this.cursorTrailContainer.style.position = 'fixed';
    this.cursorTrailContainer.style.pointerEvents = 'none';
    this.cursorTrailContainer.style.zIndex = '1000';
    this.cursorTrailContainer.style.top = '0';
    this.cursorTrailContainer.style.left = '0';
    this.cursorTrailContainer.style.width = '100%';
    this.cursorTrailContainer.style.height = '100%';
    document.body.appendChild(this.cursorTrailContainer);
  }
  
  // Activar la estela del cursor
  private startCursorTrail(): void {
    if (!this.isBrowser || this.cursorTrailActive) return;
    
    this.cursorTrailActive = true;
    this.startCursorTrailAnimation();
  }
  
  // Desactivar la estela del cursor
  private stopCursorTrail(): void {
    if (!this.isBrowser || !this.cursorTrailActive) return;
    
    this.cursorTrailActive = false;
    // No detenemos la animación inmediatamente para permitir que los puntos existentes se desvanezcan
  }
  
  // Añadir un nuevo punto a la estela
  private addTrailPoint(x: number, y: number): void {
    if (!this.isBrowser || !this.cursorTrailContainer) return;
    
    // Restringir la velocidad de creación de puntos (cada 5 píxeles de movimiento)
    const dx = x - this.prevMousePosition.x;
    const dy = y - this.prevMousePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Ajustar sensibilidad según tamaño de pantalla
    const minDistance = this.windowWidth < 768 ? 3 : 5;
    
    if (distance < minDistance) return; // No crear un punto si el movimiento es pequeño
    
    // Limitar el número de puntos según el tamaño de la pantalla
    const maxPoints = this.getMaxPointsForScreenSize();
    if (this.cursorTrailPoints.length >= maxPoints) {
      // Eliminar el punto más antiguo
      const oldestPoint = this.cursorTrailPoints.shift();
      if (oldestPoint && oldestPoint.element.parentNode) {
        oldestPoint.element.remove();
      }
    }
    
    // Crear un nuevo elemento para el punto
    const point = document.createElement('div');
    point.className = 'cursor-trail-point';
    
    // Ajustar tamaño según pantalla
    const sizeMultiplier = this.windowWidth < 768 ? 0.8 : 1;
    const pointSize = (Math.random() * 5 + 2) * sizeMultiplier;
    
    // Estilos personalizados que se parecen al efecto de Canva
    point.style.position = 'absolute';
    point.style.width = `${pointSize}px`; // 2-7px (ajustado por el multiplicador)
    point.style.height = point.style.width;
    point.style.left = `${x}px`;
    point.style.top = `${y}px`;
    point.style.borderRadius = '50%';
    
    // Colores variados con predominio de azul/morado (similar a Canva)
    const hue = Math.random() * 60 + 220; // 220-280 (tonos azules-morados)
    const lightness = Math.random() * 30 + 50; // 50-80% (colores más brillantes)
    const alpha = Math.random() * 0.5 + 0.5; // Opacidad 0.5-1
    
    point.style.backgroundColor = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;
    point.style.boxShadow = `0 0 ${Math.random() * 3 + 2}px hsla(${hue}, 100%, ${lightness}%, ${alpha * 0.8})`;
    
    // Añadir al contenedor
    this.cursorTrailContainer.appendChild(point);
    
    // Guardar el punto en nuestro array
    this.cursorTrailPoints.push({
      x,
      y,
      age: 0,
      element: point
    });
  }
  
  // Iniciar la animación de la estela
  private startCursorTrailAnimation(): void {
    if (!this.isBrowser || this.animationFrameId !== null) return;
    
    const animate = () => {
      this.updateCursorTrail();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  // Detener la animación de la estela
  private stopCursorTrailAnimation(): void {
    if (!this.isBrowser || this.animationFrameId === null) return;
    
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }
  
  // Actualizar la estela (envejecer y eliminar puntos)
  private updateCursorTrail(): void {
    if (!this.isBrowser) return;
    
    // Incrementar la edad de todos los puntos
    for (let i = this.cursorTrailPoints.length - 1; i >= 0; i--) {
      const point = this.cursorTrailPoints[i];
      point.age += 1;
      
      // Ajustar duración según tamaño de pantalla
      const lifespan = this.windowWidth < 768 ? 30 : 40;
      
      // Aplicar efecto de desvanecimiento basado en la edad
      const opacity = Math.max(0, 1 - (point.age / lifespan)); // Desvanecimiento gradual
      point.element.style.opacity = opacity.toString();
      
      // También reducir el tamaño gradualmente
      const scale = Math.max(0.4, 1 - (point.age / (lifespan * 1.5)));
      point.element.style.transform = `scale(${scale})`;
      
      // Eliminar puntos viejos
      if (point.age > lifespan) {
        point.element.remove();
        this.cursorTrailPoints.splice(i, 1);
      }
    }
    
    // Si no hay puntos y la estela está inactiva, detenemos la animación
    if (this.cursorTrailPoints.length === 0 && !this.cursorTrailActive) {
      this.stopCursorTrailAnimation();
    }
  }
  
  // Limpieza de la estela
  private cleanupCursorTrail(): void {
    if (!this.isBrowser) return;
    
    // Detener la animación
    this.stopCursorTrailAnimation();
    
    // Eliminar todos los puntos
    this.cursorTrailPoints.forEach(point => {
      if (point.element.parentNode) {
        point.element.remove();
      }
    });
    this.cursorTrailPoints = [];
    
    // Eliminar el contenedor
    if (this.cursorTrailContainer && this.cursorTrailContainer.parentNode) {
      this.cursorTrailContainer.remove();
    }
    this.cursorTrailContainer = null;
  }

  private isCssVariableDefined(varName: string): boolean {
    if (!this.isBrowser) return false;
    
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim() !== '';
  }
}