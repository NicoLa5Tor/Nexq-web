import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgStyle } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  baseX: number;
  baseY: number;
  density: number;
  draw(ctx: CanvasRenderingContext2D): void;
  update(mouse: MousePosition, canvas: HTMLCanvasElement): void;
}

interface MousePosition {
  x: number;
  y: number;
  radius: number;
}

@Component({
  selector: 'app-particles-background',
  templateUrl: './particles-background.component.html',
  styleUrls: ['./particles-background.component.scss'],
  standalone: true,
  imports: [NgStyle] // Importar NgStyle explícitamente
})
export class ParticlesBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particlesCanvas') particlesCanvas!: ElementRef<HTMLCanvasElement>;
  
  // Propiedades configurables
  @Input() opacity: number = 0.3;
  @Input() particleDensity: number = 10000; // Menor número = más partículas
  @Input() particleColors: string[] = [
    'rgba(94, 137, 176, 0.6)',  // azul
    'rgba(110, 86, 207, 0.6)',  // morado
    'rgba(158, 119, 224, 0.6)', // lila
    'rgba(94, 137, 176, 0.3)',  // azul claro
    'rgba(255, 255, 255, 0.5)'  // blanco
  ];
  @Input() maxConnectDistance: number = 100;
  @Input() mouseInteractionRadius: number = 100;
  @Input() particleSpeed: number = 0.8;
  @Input() particleMinSize: number = 1;
  @Input() particleMaxSize: number = 3;
  
  // Propiedades privadas
  private animationFrame: number = 0;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouse: MousePosition = { x: 0, y: 0, radius: this.mouseInteractionRadius };
  private resizeObserver!: ResizeObserver;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Configuración inicial
    this.mouse.radius = this.mouseInteractionRadius;
  }
  
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initCanvas(), 100);
    }
  }
  
  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      
      // Remover listeners
      const canvas = this.particlesCanvas?.nativeElement;
      if (canvas) {
        canvas.removeEventListener('mousemove', this.handleMouseMove);
        canvas.removeEventListener('mouseleave', this.handleMouseLeave);
      }
    }
  }
  
  private initCanvas(): void {
    if (!this.particlesCanvas) return;
    
    const canvas = this.particlesCanvas.nativeElement;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    // Configurar tamaño inicial
    this.updateCanvasSize();
    
    // Observar cambios de tamaño
    this.setupResizeObserver();
    
    // Configurar eventos del mouse
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mouseleave', this.handleMouseLeave);
    
    // Crear partículas e iniciar animación
    this.createParticles();
    this.animate();
  }
  
  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      // Fallback para navegadores que no soportan ResizeObserver
      window.addEventListener('resize', () => this.updateCanvasSize());
      return;
    }
    
    this.resizeObserver = new ResizeObserver(() => {
      this.updateCanvasSize();
    });
    
    this.resizeObserver.observe(this.particlesCanvas.nativeElement.parentElement as Element);
  }
  
  private updateCanvasSize(): void {
    const canvas = this.particlesCanvas.nativeElement;
    const parent = canvas.parentElement as HTMLElement;
    
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    
    // Recrear partículas cuando cambia el tamaño
    this.createParticles();
  }
  
  private handleMouseMove = (event: MouseEvent): void => {
    const canvas = this.particlesCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }
  
  private handleMouseLeave = (): void => {
    // Mover el mouse fuera del canvas cuando el cursor sale
    this.mouse.x = -100;
    this.mouse.y = -100;
  }
  
  private createParticles(): void {
    this.particles = [];
    
    // Calcular número de partículas basado en el área y la densidad configurada
    const canvas = this.particlesCanvas.nativeElement;
    const numberOfParticles = Math.min(
      200, // máximo de partículas
      Math.floor((canvas.width * canvas.height) / this.particleDensity)
    );
    
    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * (this.particleMaxSize - this.particleMinSize) + this.particleMinSize;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const colorIndex = Math.floor(Math.random() * this.particleColors.length);
      
      this.particles.push(this.createParticle(x, y, size, this.particleColors[colorIndex]));
    }
  }
  
  private createParticle(x: number, y: number, size: number, color: string): Particle {
    return {
      x,
      y,
      size,
      baseX: x,
      baseY: y,
      density: (Math.random() * 30) + 1,
      color,
      speedX: Math.random() * this.particleSpeed - (this.particleSpeed / 2),
      speedY: Math.random() * this.particleSpeed - (this.particleSpeed / 2),
      
      draw: function(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      },
      
      update: function(mouse: MousePosition, canvas: HTMLCanvasElement) {
        // Mover partículas
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebotar en los bordes
        if (this.x > canvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }

        // Interactividad con el mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = forceDirectionX * force * this.density;
          const directionY = forceDirectionY * force * this.density;
          
          this.x -= directionX;
          this.y -= directionY;
        }
      }
    };
  }
  
  private animate = (): void => {
    const canvas = this.particlesCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar y actualizar partículas
    for (const particle of this.particles) {
      particle.draw(this.ctx);
      particle.update(this.mouse, canvas);
    }
    
    // Dibujar conexiones
    this.connectParticles();
    
    // Continuar animación
    this.animationFrame = requestAnimationFrame(this.animate);
  }
  
  private connectParticles(): void {
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.maxConnectDistance) {
          // Ajustar opacidad basada en la distancia
          const opacity = 1 - (distance / this.maxConnectDistance);
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(94, 137, 176, ${opacity * 0.8})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
          this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
          this.ctx.stroke();
        }
      }
    }
  }
}