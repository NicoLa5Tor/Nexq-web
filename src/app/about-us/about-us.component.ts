import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }
  
  ngOnInit(): void {
    // Inicializar animaciones solo cuando estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initFadeInAnimations();
    }
  }
  
  private initFadeInAnimations(): void {
    // Verificar que estamos en un entorno de navegador
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Animación de entrada para elementos cuando son visibles
    const fadeElements = document.querySelectorAll('.about-section .fade-in');
    if (fadeElements.length > 0 && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
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