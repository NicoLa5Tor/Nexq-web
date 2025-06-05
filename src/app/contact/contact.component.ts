import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AosService } from '../../Services/aos.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', animate('600ms ease-out'))
    ])
  ]
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  submitted = false;
  success = false;
  @ViewChild('contactSection', { static: true }) contactSection!: ElementRef;
  fadeState = 'hidden';
  
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
      this.initIntersectionAnimation();
      this.aos.refresh();
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
  
  private initIntersectionAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (typeof IntersectionObserver === 'undefined') {
      this.fadeState = 'visible';
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.fadeState = 'visible';
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.contactSection.nativeElement);
  }
}