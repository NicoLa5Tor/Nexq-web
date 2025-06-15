import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 Agregar esto
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailJSService, EmailError, EmailResponse } from '../../services/email-js.service';
import { FormData } from '../tech-form/tech-form.component';

export type SendMethod = 'emailjs' | 'email' | 'whatsapp';

@Component({
  selector: 'app-send-options',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './send-options.component.html',
  styleUrls: ['./send-options.component.scss'],
})
export class SendOptionsComponent {
  @Input() formData!: FormData;
  @Output() sendMethodSelected = new EventEmitter<SendMethod>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() editData = new EventEmitter<void>();

  selectedMethod: SendMethod | null = null;
  isLoading = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { formData: FormData },
    private dialogRef: MatDialogRef<SendOptionsComponent>,
    private emailService: EmailJSService // 👈 Inyectar el servicio
  ) {
    // Soporte para obtener datos desde el dialog de Angular Material
    this.formData = data.formData;
  }

  selectMethod(method: SendMethod) {
    this.selectedMethod = method;
    this.showSuccess = false;
    this.showError = false;
  }

  confirmSend() {
    if (this.selectedMethod && !this.isLoading) {
      this.isLoading = true;
      this.showSuccess = false;
      this.showError = false;

      if (this.selectedMethod === 'emailjs') {
        // Opción principal: EmailJS (automático y profesional)
        this.sendViaEmailJS();
      } else if (this.selectedMethod === 'email') {
        // Opción de respaldo: Mailto
        this.sendViaMailto();
      } else if (this.selectedMethod === 'whatsapp') {
        // Opción alternativa: WhatsApp
        this.sendViaWhatsApp();
      }
    }
  }

  private sendViaEmailJS(): void {
    this.emailService.sendTechConsultationForm({
      servicio: this.formData.servicio,
      email: this.formData.email,
      telefono: this.formData.telefono,
      nombre: this.formData.nombre,
      apellidos: this.formData.apellidos,
      nombreEmpresa: this.formData.nombreEmpresa,
      fechaConsulta: this.formData.fechaConsulta
    }).subscribe({
      next: (response: EmailResponse) => {
        this.isLoading = false;
        this.showSuccess = true;
        this.successMessage = 'Consulta enviada exitosamente. Te contactaremos pronto.';
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          this.dialogRef.close({ success: true, method: 'emailjs' });
        }, 2000);
      },
      error: (error: EmailError) => {
        this.isLoading = false;
        console.warn('EmailJS falló, ofreciendo opciones alternativas...', error);
        
        // Mostrar error y opciones de respaldo
        this.showError = true;
        this.errorMessage = 'No pudimos enviar automáticamente. Puedes usar las opciones alternativas de Email o WhatsApp.';
        
        // Resetear selección para que pueda elegir otra opción
        this.selectedMethod = null;
      }
    });
  }

  private sendViaMailto(): void {
    try {
      const subject = this.generateEmailSubject();
      const body = this.generateEmailBody();
      const mailtoLink = `mailto:investigacion@nexqai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.open(mailtoLink);
      
      this.isLoading = false;
      this.showSuccess = true;
      this.successMessage = 'Se abrió tu cliente de correo. Por favor, envía el mensaje desde allí.';
      
      setTimeout(() => {
        this.dialogRef.close({ success: true, method: 'email' });
      }, 2000);
    } catch (error) {
      this.isLoading = false;
      this.showError = true;
      this.errorMessage = 'Error al abrir el cliente de correo. Intenta con WhatsApp.';
    }
  }

  private sendViaWhatsApp(): void {
    try {
      const whatsappMessage = this.generateWhatsAppMessage();
      const whatsappNumber = '+573043441049'; // Tu número de WhatsApp
      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      
      window.open(whatsappLink, '_blank');
      
      this.isLoading = false;
      this.showSuccess = true;
      this.successMessage = 'Se abrió WhatsApp con tu mensaje. Por favor, envíalo desde allí.';
      
      setTimeout(() => {
        this.dialogRef.close({ success: true, method: 'whatsapp' });
      }, 2000);
    } catch (error) {
      this.isLoading = false;
      this.showError = true;
      this.errorMessage = 'Error al abrir WhatsApp. Intenta copiando el mensaje manualmente.';
    }
  }

  onClose() {
    this.closeModal.emit();
    this.dialogRef.close();
  }

  onEdit() {
    this.editData.emit();
    this.dialogRef.close();
  }

  // Generadores de mensaje mejorados
  generateWhatsAppMessage(): string {
    return `¡Hola equipo de NexqAI! 👋

Me gustaría solicitar una consulta técnica:

🏢 *Empresa:* ${this.formData.nombreEmpresa}
👤 *Contacto:* ${this.formData.nombre} ${this.formData.apellidos}
📧 *Email:* ${this.formData.email}
📞 *Teléfono:* ${this.formData.telefono}
🔧 *Servicio:* ${this.getServiceName(this.formData.servicio)}
📅 *Fecha preferida:* ${this.formatDate(this.formData.fechaConsulta)}

¡Espero su respuesta para coordinar la reunión! 🚀`;
  }

  generateEmailSubject(): string {
    return `Solicitud de Consulta Técnica - ${this.getServiceName(this.formData.servicio)} - ${this.formData.nombreEmpresa}`;
  }

  generateEmailBody(): string {
    return `Estimado equipo de NexqAI,

Me pongo en contacto para solicitar una consulta técnica sobre sus servicios especializados.

INFORMACIÓN DE LA EMPRESA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Empresa: ${this.formData.nombreEmpresa}
• Contacto: ${this.formData.nombre} ${this.formData.apellidos}
• Email: ${this.formData.email}
• Teléfono: ${this.formData.telefono}

SERVICIO REQUERIDO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this.getServiceName(this.formData.servicio)}

FECHA PREFERIDA PARA LA CONSULTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this.formatDate(this.formData.fechaConsulta)}

Quedo a la espera de su respuesta para coordinar la reunión y conocer más sobre cómo NexqAI puede ayudar a nuestra empresa.

Saludos cordiales,

${this.formData.nombre} ${this.formData.apellidos}
${this.formData.nombreEmpresa}
${this.formData.email}
${this.formData.telefono}

───────────────────────────────────────────────
Este mensaje fue generado desde el formulario de consultas de NexqAI.com`;
  }

  // Utilidades (públicas para usar en el template)
  getServiceName(serviceId: string): string {
    const serviceNames: { [key: string]: string } = {
      'analisis-datos': 'Análisis Avanzado de Datos',
      'soluciones-ia': 'Soluciones Basadas en IA',
      'big-data': 'Big Data y Visualización',
      'desarrollo-software': 'Desarrollo de Software',
      'investigacion-desarrollo': 'Investigación y Desarrollo',
      'servicios-financieros': 'Servicios Financieros'
    };
    return serviceNames[serviceId] || serviceId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Getters para el template
  get isFormValid(): boolean {
    return !!(this.selectedMethod && !this.isLoading);
  }

  get buttonText(): string {
    if (this.isLoading) {
      return 'Enviando...';
    }
    if (!this.selectedMethod) {
      return 'Selecciona una opción';
    }
    
    const texts = {
      'emailjs': 'Enviar Automáticamente',
      'email': 'Abrir Email',
      'whatsapp': 'Abrir WhatsApp'
    };
    
    return texts[this.selectedMethod] || 'Enviar';
  }
}