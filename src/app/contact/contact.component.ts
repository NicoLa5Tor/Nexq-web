import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AosService } from '../../Services/aos.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, AfterViewInit {
  contactForm!: FormGroup;
  submitted = false;
  success = false;
  
  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private aos: AosService
  ) { }
  
  ngOnInit(): void {
    // Inicializar el formulario (esto es seguro en SSR)
    this.initForm();
    
    // Inicializar animaciones solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initFadeInAnimations();
      this.aos.refresh();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from('.contact-section form', {
        opacity: 0,
        y: 80,
        duration: 1,
        scrollTrigger: {
          trigger: '.contact-section',
          start: 'top 80%'
        }
      });
      gsap.from('.contact-section .contact-info', {
        opacity: 0,
        x: 80,
        duration: 1,
        scrollTrigger: {
          trigger: '.contact-section',
          start: 'top 80%'
        }
      });
    }
  }
  
  private initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      service: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  
  onSubmit(): void {
    this.submitted = true;
    if (this.contactForm.valid) {
      // Aquí iría la lógica para enviar el formulario a un backend
      // Simulamos éxito (en producción, esto dependería de la respuesta del backend)
      setTimeout(() => {
        this.success = true;
        this.contactForm.reset();
        this.submitted = false;
        // Resetear el mensaje de éxito después de un tiempo
        setTimeout(() => {
          this.success = false;
        }, 5000);
      }, 1500);
    }
  }
  
  private initFadeInAnimations(): void {
    // Verificar que estamos en el navegador
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Animación de entrada para elementos cuando son visibles
    const fadeElements = document.querySelectorAll('.contact-section .fade-in');
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