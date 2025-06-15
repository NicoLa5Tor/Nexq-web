import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AosService } from '../../services/aos.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailJSService,EmailResponse, EmailError  } from '../../services/email-js.service';

// Interfaz para el formulario de contacto
interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  service: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  submitted = false;
  success = false;
  error = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private emailService: EmailJSService, // 👈 Inyectamos el servicio
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
    this.error = false;
    this.success = false;

    if (this.contactForm.valid) {
      this.loading = true;
      const formData: ContactFormData = this.contactForm.value;

      // Usar el servicio EmailJS
      this.emailService.sendContactForm(formData).subscribe({
        next: (response: EmailResponse) => {
          console.log('✅ Email enviado exitosamente:', response);
          this.handleSuccess(response.message);
        },
        error: (error: EmailError) => {
          console.warn('❌ EmailJS falló, intentando con mailto...', error);
          // Si EmailJS falla, usar mailto como respaldo
          this.sendEmailWithMailtoFallback(formData);
        }
      });
    }
  }

  // Método alternativo usando mailto como respaldo
  private sendEmailWithMailtoFallback(formData: ContactFormData): void {
    try {
      const serviceNames: { [key: string]: string } = {
        'analisis': 'Análisis de Datos',
        'ia': 'Soluciones de IA',
        'bigdata': 'Big Data y Visualización',
        'software': 'Desarrollo de Software',
        'investigacion': 'Investigación y Desarrollo',
        'finanzas': 'Servicios Financieros',
        'otro': 'Otro'
      };

      const serviceName = serviceNames[formData.service] || formData.service;
      const subject = `Contacto NexqAI - ${serviceName}`;
      
      const body = `
Hola equipo de NexqAI,

Recibieron un nuevo mensaje de contacto desde el sitio web:

═══════════════════════════════════════
📋 INFORMACIÓN DEL CLIENTE
═══════════════════════════════════════

Nombre: ${formData.name}
Email: ${formData.email}
Empresa: ${formData.company || 'No especificada'}
Servicio de interés: ${serviceName}

═══════════════════════════════════════
💬 MENSAJE
═══════════════════════════════════════

${formData.message}

═══════════════════════════════════════

Este mensaje fue enviado desde el formulario de contacto del sitio web.

Por favor, responder directamente a: ${formData.email}

Saludos,
Sistema de Contacto NexqAI
      `.trim();

      const mailtoLink = `mailto:investigacion@nexqai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      if (isPlatformBrowser(this.platformId)) {
        console.log('📧 Abriendo cliente de correo como respaldo...');
        window.open(mailtoLink, '_blank');
        this.handleSuccess('Se abrió tu cliente de correo. Por favor, envía el mensaje desde allí.');
      } else {
        // Si no está en el navegador, mostrar información alternativa
        this.handleAlternativeContact(formData);
      }
    } catch (error) {
      console.error('❌ Error incluso con mailto:', error);
      this.handleAlternativeContact(formData);
    }
  }

  // Método de último recurso si todo falla
  private handleAlternativeContact(formData: ContactFormData): void {
    this.loading = false;
    this.error = true;
    this.errorMessage = `
      No pudimos enviar tu mensaje automáticamente. 
      Por favor, copia la siguiente información y envíala manualmente a: investigacion@nexqai.com
      
      Nombre: ${formData.name}
      Email: ${formData.email}
      Empresa: ${formData.company || 'No especificada'}
      Servicio: ${formData.service}
      Mensaje: ${formData.message}
    `;
  }

  private handleSuccess(message: string = 'Mensaje enviado exitosamente! Te contactaremos pronto.'): void {
    this.loading = false;
    this.success = true;
    this.successMessage = message;
    this.contactForm.reset();
    this.submitted = false;
    
    // Resetear el mensaje de éxito después de un tiempo
    setTimeout(() => {
      this.success = false;
    }, 7000); // Más tiempo para leer el mensaje
  }

  private handleError(message: string): void {
    this.loading = false;
    this.error = true;
    this.errorMessage = message;
    
    // Resetear el mensaje de error después de un tiempo
    setTimeout(() => {
      this.error = false;
    }, 5000);
  }

  // Getter para facilitar el acceso a los controles del formulario
  get f() { 
    return this.contactForm.controls; 
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
  sendCustomEmail(): void {
    const customConfig = {
      serviceId: 'service_g4rn9bf',
      templateId: 'template_personalizado',
      userId: 'AWT8RFyy4Tnnh9Ta1'
    };

    this.emailService.sendEmail({
      custom_param: 'valor personalizado',
      another_param: 'otro valor'
    }, customConfig).subscribe({
      next: (response: EmailResponse) => console.log('Email personalizado enviado:', response),
      error: (error: EmailError) => console.error('Error:', error)
    });
  }
}