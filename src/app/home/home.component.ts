// home.component.ts
import { Component, OnInit, PLATFORM_ID, Inject, HostListener, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicesOverviewComponent } from '../services-overview/services-overview.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { ContactComponent } from '../contact/contact.component';
import { FeaturesComponent } from '../features/features.component';
import { ScrollService } from '../../Services/scroll.service';
import { ViewportScroller } from '@angular/common';
import { ReverseParallaxComponent } from '../animations/reverse-parallax/reverse-parallax.component';
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
export class HomeComponent implements AfterViewInit, OnDestroy {
  private animationStarted = false;
  private elementsToAnimate: Array<Element> = [];
  private observer: IntersectionObserver | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,private scroll : ViewportScroller,private scrollService: ScrollService) {}
  
  ngAfterViewInit(): void {
    
    if (isPlatformBrowser(this.platformId)) {
      // Iniciar animaciones del hero de inmediato
      setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
          heroContent.classList.add('revealed');
          this.startHeroAnimationsImmediately();
        }
      }, 200);

      // Configurar el observer para las animaciones basadas en scroll
      this.setupScrollObserver();
      
      // Verificar el scroll inicial después de renderizado
      setTimeout(() => {
        this.observeScrollElements();
      }, 100);
    }
    this.scroll.scrollToPosition([0,0])
  }
  scrollToTop()
  {
    this.scroll.scrollToPosition([0,0]);
  }
  ngOnDestroy(): void {
    // Desconectar el observer cuando el componente se destruye
    if (this.observer && isPlatformBrowser(this.platformId)) {
      this.observer.disconnect();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.adjustForScreenSize();
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (isPlatformBrowser(this.platformId) && !this.observer) {
      // Solo usamos este método si el IntersectionObserver no está disponible
      this.checkScrollReveal();
    }
  }

  toggleMobileMenu(): void {
    alert('Menú móvil activado');
  }

  private adjustForScreenSize(): void {
    const isMobile = window.innerWidth < 768;
    const isSmallScreen = window.innerWidth < 480;
    
    // Aplicar tamaño fijo al SVG de la red neuronal
    const networkSvg = document.querySelector('.neural-network-wrapper svg');
    if (networkSvg) {
      if (isSmallScreen) {
        networkSvg.setAttribute('height', '150');
      } else if (isMobile) {
        networkSvg.setAttribute('height', '170');
      } else {
        networkSvg.setAttribute('height', '190');
      }
      
      // Asegurar que no se aplican transformaciones de tamaño
      (networkSvg as HTMLElement).style.transform = 'none';
    }
  }

  private setupScrollObserver(): void {
    // Verificar si el navegador soporta IntersectionObserver
    if ('IntersectionObserver' in window) {
      // Calcular el rootMargin basado en el tamaño de la pantalla
      // En dispositivos móviles, activar la animación cuando el elemento está más lejos (cuando apenas entra en la pantalla)
      const isMobile = window.innerWidth < 768;
      const rootMargin = isMobile ? '0px 0px -10% 0px' : '0px 0px 0px 0px';
      
      const options = {
        root: null, // viewport
        rootMargin: rootMargin,
        threshold: isMobile ? 0.05 : 0.2 // Umbral más bajo para dispositivos móviles
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Agregar un pequeño retraso para asegurar una secuencia visual
            setTimeout(() => {
              entry.target.classList.add('revealed');
              
              // Si es el contenedor de la red neuronal, iniciar su animación específica
              if (entry.target.classList.contains('neural-network-container')) {
                this.startNeuralNetworkAnimation();
              }
              
              // Dejar de observar elementos que ya se han revelado
              this.observer?.unobserve(entry.target);
            }, entry.target.classList.contains('neural-network-container') ? 300 : 100);
          }
        });
      }, options);
      
      this.observeScrollElements();
    } else {
      // Fallback para navegadores que no soportan IntersectionObserver
      this.observer = null;
    }
  }

  private observeScrollElements(): void {
    if (!this.observer) return;
    
    // Observar elementos con clase scroll-reveal que no estén en el hero-content
    const elementsToAnimate = document.querySelectorAll('.scroll-reveal:not(.hero-content), .sequential-fade:not(.revealed)');
    
    elementsToAnimate.forEach(element => {
      this.observer?.observe(element);
    });
    
    // También observar específicamente los componentes
    const components = document.querySelectorAll('app-services-overview, app-about-us, app-contact');
    components.forEach(component => {
      this.observer?.observe(component);
    });
  }

  private checkScrollReveal(): void {
    // Este método es un fallback si el IntersectionObserver no está disponible
    if (!this.animationStarted) {
      const heroContent = document.querySelector('.hero-content');
      if (!heroContent) return;
      
      heroContent.classList.add('revealed');
      
      if (!this.animationStarted) {
        this.animationStarted = true;
        this.initializeTypewriterEffects();
      }
    }
    
    // Determinar si estamos en mobile para ajustar el punto de activación
    const isMobile = window.innerWidth < 768;
    const activationOffset = isMobile ? window.innerHeight * 0.8 : window.innerHeight - 100;
    
    // Revelar otros componentes a medida que se hacen visibles
    const otherSections = document.querySelectorAll('.scroll-reveal:not(.hero-content):not(.revealed), .sequential-fade:not(.revealed)');
    otherSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const isVisible = (
        rect.top < activationOffset &&
        rect.bottom > 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
      
      if (isVisible) {
        section.classList.add('revealed');
        
        // Si es el contenedor de la red neuronal, iniciar su animación específica
        if (section.classList.contains('neural-network-container')) {
          this.startNeuralNetworkAnimation();
        }
      }
    });

    // Revelar componentes específicos
    const components = document.querySelectorAll('app-services-overview:not(.revealed), app-about-us:not(.revealed), app-contact:not(.revealed)');
    components.forEach(section => {
      const rect = section.getBoundingClientRect();
      const isVisible = (
        rect.top < activationOffset &&
        rect.bottom > 0
      );
      
      if (isVisible) {
        section.classList.add('revealed');
      }
    });
  }

  private startNeuralNetworkAnimation(): void {
    // Obtener todos los elementos de la red neuronal para animarlos secuencialmente
    const networkContainer = document.querySelector('.neural-network-container');
    const nodes = document.querySelectorAll('.node');
    const connections = document.querySelectorAll('.connection');
    const logoTextGroup = document.querySelector('.logo-text');
    const networkText = document.querySelector('.logo-text text') as SVGTextElement;
    
    if (!networkContainer) return;
    
    // Asegurar tamaño correcto antes de iniciar animaciones
    const networkSvg = document.querySelector('.neural-network-wrapper svg');
    if (networkSvg) {
      // Establecer altura fija según el dispositivo
      if (window.innerWidth < 480) {
        networkSvg.setAttribute('height', '150');
      } else if (window.innerWidth < 768) {
        networkSvg.setAttribute('height', '170');
      } else {
        networkSvg.setAttribute('height', '190');
      }
      
      // Asegurar que no hay transformaciones que afecten el tamaño
      (networkSvg as HTMLElement).style.transform = 'none';
    }
    
    // Activar animaciones (sin animaciones de movimiento vertical)
    networkContainer.classList.add('animation-active');
    
    // Animar los nodos secuencialmente (solo opacidad y escala)
    nodes.forEach((node, index) => {
      setTimeout(() => {
        node.classList.add('active');
      }, 100 * index);
    });
    
    // Animar las conexiones secuencialmente (solo opacidad)
    connections.forEach((connection, index) => {
      setTimeout(() => {
        connection.classList.add('active');
      }, 80 * index + 300);
    });
    
    // Animar el texto al final
    if (networkText && logoTextGroup) {
      setTimeout(() => {
        // El texto final que queremos mostrar
        const finalText = "Análisis avanzado";
        
        // Activar el grupo de texto para hacerlo visible
        logoTextGroup.classList.add('active');
        
        // Asegurarse que el texto está visible
        networkText.style.opacity = "1";
        
        // Iniciar con texto vacío
        networkText.textContent = '';
        
        // Pequeña pausa para aplicar los estilos
        setTimeout(() => {
          // Iniciamos el efecto letra por letra
          this.typewriterHackerEffectSVG(networkText, finalText);
        }, 50);
      }, 1000);
    }
    
    // Después de que terminen todas las animaciones, asegurar que el tamaño se mantiene
    setTimeout(() => {
      if (networkSvg) {
        // Volver a aplicar el tamaño fijo
        if (window.innerWidth < 480) {
          networkSvg.setAttribute('height', '150');
        } else if (window.innerWidth < 768) {
          networkSvg.setAttribute('height', '170');
        } else {
          networkSvg.setAttribute('height', '190');
        }
        
        // Asegurar que no hay transformaciones
        (networkSvg as HTMLElement).style.transform = 'none';
      }
    }, 2000);
  }
  
  // Método para animar texto SVG con efecto typewriter y hacker combinados
  private typewriterHackerEffectSVG(element: SVGTextElement, finalText: string): void {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}:"<>?|[];,.';
    const chars = finalText.split('');
    let currentIndex = 0;
    let currentDisplay = '';
    
    const typeNextChar = () => {
      if (currentIndex >= chars.length) {
        return; // Animación completa
      }
      
      currentDisplay += chars[currentIndex];
      
      // Crear un array con el texto actual más algunos caracteres random al final
      const displayArray = currentDisplay.split('');
      const remainingLength = chars.length - currentDisplay.length;
      
      // Añadir caracteres aleatorios al final
      if (remainingLength > 0) {
        for (let i = 0; i < Math.min(remainingLength, 3); i++) {
          displayArray.push(randomChars[Math.floor(Math.random() * randomChars.length)]);
        }
      }
      
      // Aplicar efecto hacker a los últimos 3 caracteres (o menos si no hay suficientes)
      for (let i = Math.max(0, displayArray.length - 3); i < displayArray.length; i++) {
        if (i >= currentDisplay.length) {
          displayArray[i] = randomChars[Math.floor(Math.random() * randomChars.length)];
        }
      }
      
      // Actualizar texto
      element.textContent = displayArray.join('');
      
      // Avanzar al siguiente caracter
      currentIndex++;
      
      // Continuar la animación
      setTimeout(typeNextChar, 80);
    };
    
    // Iniciar la animación
    typeNextChar();
  }
  
  private startHeroAnimationsImmediately(): void {
    if (this.animationStarted) return;
    
    this.animationStarted = true;
    this.initializeTypewriterEffects();
    this.initializeBasicAnimations();
  }

  private initializeBasicAnimations(): void {
    // Animaciones básicas que no dependen del scroll reveal
    const cursor = document.querySelector('.glow-cursor') as HTMLElement;
    if (cursor) {
      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });
    }

    const nav = document.querySelector('.nav-container') as HTMLElement;
    if (nav) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          nav.style.background = 'rgba(10, 10, 15, 0.95)';
          nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        } else {
          nav.style.background = 'rgba(10, 10, 15, 0.85)';
          nav.style.boxShadow = 'none';
        }
      });
    }
    
    this.adjustForScreenSize();
  }
  
  private initializeTypewriterEffects(): void {
    // Caracteres aleatorios para el efecto "hacker"
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}:"<>?|[];,.';
    
    // Función para el título (simple typewriter sin efectos de hacker)
    const simpleTypewriter = (element: HTMLElement, callback: any = null) => {
      // Capturar el texto original sin procesar los tags HTML
      const textParts = element.innerText.split('\n');
      const firstLine = textParts[0] || '';
      const secondLine = textParts[1] || '';
      
      // Limpiar y añadir clase para el efecto
      element.innerHTML = '';
      element.classList.add('typewriter-effect');
      
      // Animación línea por línea
      let currentIndex = 0;
      let currentText = '';
      let currentPart = 0;
      const parts = [firstLine, secondLine];
      
      const typeNextChar = () => {
        if (currentPart >= parts.length) {
          setTimeout(() => {
            element.classList.add('typing-complete');
            if (callback && typeof callback === 'function') {
              callback();
            }
          }, 200); // Reducido a 200ms para que el flujo sea más rápido
          return;
        }
        
        if (currentIndex < parts[currentPart].length) {
          currentText += parts[currentPart][currentIndex];
          
          // Actualizar el HTML basado en la parte actual
          if (currentPart === 0) {
            element.innerHTML = currentText;
          } else {
            element.innerHTML = parts[0] + '<br class="line-break fade-in">' + currentText;
          }
          
          currentIndex++;
          setTimeout(typeNextChar, 25); // Velocidad más rápida
        } else {
          currentPart++;
          currentIndex = 0;
          currentText = '';
          
          // Si pasamos a la segunda línea, agregar un salto con animación de fade-in
          if (currentPart === 1) {
            element.innerHTML = parts[0] + '<br class="line-break fade-in">';
            // Pausa más larga entre líneas para que la transición sea más suave
            setTimeout(typeNextChar, 150); 
          } else {
            typeNextChar(); // Continuar con siguiente parte o finalizar
          }
        }
      };
      
      // Iniciar el proceso de escritura inmediatamente
      typeNextChar();
    };
    
    // Efecto hacker en todo el texto a la vez (un carácter aleatorio por posición)
    const animateHackerText = (element: HTMLElement, finalText: string, callback: any = null) => {
      // Crear un arreglo con el texto final
      const finalChars = Array.from(finalText);
      
      // Crear una copia que iremos modificando
      const currentChars = [...finalChars];
      
      // Total de iteraciones para revelar gradualmente
      const totalIterations = 8;
      let currentIteration = 0;
      
      // Función para actualizar el texto
      const updateText = () => {
        // Calcular cuántos caracteres deben estar fijos en esta iteración
        const fixedPercentage = currentIteration / totalIterations;
        
        // Actualizar todos los caracteres
        for (let i = 0; i < finalChars.length; i++) {
          // Decidir si este carácter debería estar fijo o seguir aleatorio
          const shouldBeFixed = Math.random() < fixedPercentage;
          
          if (shouldBeFixed) {
            // Fijar este carácter a su valor final
            currentChars[i] = finalChars[i];
          } else {
            // Mantener como un carácter aleatorio, pero solo si no es un espacio
            if (finalChars[i] !== ' ' && finalChars[i] !== '\n') {
              currentChars[i] = randomChars[Math.floor(Math.random() * randomChars.length)];
            } else {
              // Preservar espacios y saltos de línea
              currentChars[i] = finalChars[i];
            }
          }
        }
        
        // Actualizar el elemento con los caracteres actuales
        element.textContent = currentChars.join('');
        
        // Avanzar a la siguiente iteración
        currentIteration++;
        
        if (currentIteration <= totalIterations) {
          // Continuar la animación
          setTimeout(updateText, 60); // Velocidad más rápida
        } else {
          // Finalizar con el texto exacto
          element.textContent = finalText;
          
          // Llamar al callback si existe
          if (callback && typeof callback === 'function') {
            callback();
          }
        }
      };
      
      // Iniciar con texto completamente aleatorio (preservando espacios)
      for (let i = 0; i < finalChars.length; i++) {
        if (finalChars[i] !== ' ' && finalChars[i] !== '\n') {
          currentChars[i] = randomChars[Math.floor(Math.random() * randomChars.length)];
        }
      }
      element.textContent = currentChars.join('');
      
      // Iniciar la animación
      setTimeout(updateText, 50); // Iniciar más rápido
    };
    
    // Versión para SVGTextElement
    const animateHackerTextSvg = (element: SVGTextElement, finalText: string, callback: any = null) => {
      // Crear un arreglo con el texto final
      const finalChars = Array.from(finalText);
      
      // Crear una copia que iremos modificando
      const currentChars = [...finalChars];
      
      // Total de iteraciones para revelar gradualmente
      const totalIterations = 8; // Reducido de 12
      let currentIteration = 0;
      
      // Función para actualizar el texto
      const updateText = () => {
        // Calcular cuántos caracteres deben estar fijos en esta iteración
        const fixedPercentage = currentIteration / totalIterations;
        
        // Actualizar todos los caracteres
        for (let i = 0; i < finalChars.length; i++) {
          // Decidir si este carácter debería estar fijo o seguir aleatorio
          const shouldBeFixed = Math.random() < fixedPercentage;
          
          if (shouldBeFixed) {
            // Fijar este carácter a su valor final
            currentChars[i] = finalChars[i];
          } else {
            // Mantener como un carácter aleatorio, pero solo si no es un espacio
            if (finalChars[i] !== ' ') {
              currentChars[i] = randomChars[Math.floor(Math.random() * randomChars.length)];
            } else {
              // Preservar espacios
              currentChars[i] = finalChars[i];
            }
          }
        }
        
        // Actualizar el elemento con los caracteres actuales
        element.textContent = currentChars.join('');
        
        // Avanzar a la siguiente iteración
        currentIteration++;
        
        if (currentIteration <= totalIterations) {
          // Continuar la animación
          setTimeout(updateText, 60); // Velocidad más rápida
        } else {
          // Finalizar con el texto exacto
          element.textContent = finalText;
          
          // Llamar al callback si existe
          if (callback && typeof callback === 'function') {
            callback();
          }
        }
      };
      
      // Iniciar con texto completamente aleatorio (preservando espacios)
      for (let i = 0; i < finalChars.length; i++) {
        if (finalChars[i] !== ' ') {
          currentChars[i] = randomChars[Math.floor(Math.random() * randomChars.length)];
        }
      }
      element.textContent = currentChars.join('');
      
      // Iniciar la animación
      setTimeout(updateText, 50); // Iniciar más rápido
    };
    
    // Hacer el método animateHackerTextSvg accesible para su uso en otras partes
    this.animateHackerTextSvg = animateHackerTextSvg;
    
    // Iniciar la secuencia completa de animaciones
    const heroTitle = document.querySelector('.hero-title') as HTMLElement;
    const heroDescription = document.querySelector('.hero-description') as HTMLElement;
    
    if (heroTitle) {
      // Animar el título con typewriter simple (sin efecto hacker)
      simpleTypewriter(heroTitle, () => {
        // Mostrar la descripción
        if (heroDescription) {
          heroDescription.classList.add('show');
          
          // Animar la descripción con el efecto hacker
          setTimeout(() => {
            const descriptionText = heroDescription.textContent || '';
            animateHackerText(heroDescription, descriptionText, () => {
              // Mostrar botones
              const buttons = document.querySelector('.hero-buttons');
              if (buttons) {
                buttons.classList.add('show');
                
                // Mostrar la red neuronal (pero no iniciar la animación aún)
                // Eso lo haremos cuando sea visible en el viewport
                setTimeout(() => {
                  const neuralNetwork = document.querySelector('.neural-network-container');
                  if (neuralNetwork) {
                    neuralNetwork.classList.add('show');
                  }
                }, 200);
              }
            });
          }, 100);
        }
      });
    }
  }
  
  // Método compartido para animar texto SVG
  private animateHackerTextSvg: (element: SVGTextElement, finalText: string, callback?: any) => void = () => {};
}