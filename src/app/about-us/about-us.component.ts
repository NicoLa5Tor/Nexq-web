import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AosService } from '../../Services/aos.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit, AfterViewInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private aos: AosService
  ) { }
  
  ngOnInit(): void {
    // Inicializar animaciones solo cuando estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initFadeInAnimations();
      this.aos.refresh();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from('.about-section .about-content', {
        opacity: 0,
        x: -80,
        duration: 1,
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 80%'
        }
      });
      gsap.from('.about-section .team-section', {
        opacity: 0,
        x: 80,
        duration: 1,
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 80%'
        }
      });
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