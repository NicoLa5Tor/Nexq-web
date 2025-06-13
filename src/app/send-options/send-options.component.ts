import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormData } from '../tech-form/tech-form.component';

export type SendMethod = 'email' | 'whatsapp';

@Component({
  selector: 'app-send-options',
  templateUrl: './send-options.component.html',
  styleUrls: ['./send-options.component.scss'],
  // Si usas standalone: standalone: true, imports: [...]  (ponlo si corresponde)
})
export class SendOptionsComponent {
  @Input() formData!: FormData;
  @Output() sendMethodSelected = new EventEmitter<SendMethod>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() editData = new EventEmitter<void>();

  selectedMethod: SendMethod | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { formData: FormData },
    private dialogRef: MatDialogRef<SendOptionsComponent>
  ) {
    // Soporte para obtener datos desde el dialog de Angular Material
    this.formData = data.formData;
  }
  selectMethod(method: SendMethod) {
    this.selectedMethod = method;
  }

  confirmSend() {
    if (this.selectedMethod) {
      // Aquí puedes enviar el mensaje directamente o emitir para el padre si lo prefieres.
      if (this.selectedMethod === 'email') {
        const subject = this.generateEmailSubject();
        const body = this.generateEmailBody();
        const mailtoLink = `mailto:contacto@tuempresa.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
      } else if (this.selectedMethod === 'whatsapp') {
        const whatsappMessage = this.generateWhatsAppMessage();
        const whatsappNumber = '+573001234567'; // Número fijo o pásalo por config
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappLink, '_blank');
      }
      this.dialogRef.close();
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

  // Generadores de mensaje
  generateWhatsAppMessage(): string {
    return `Hola! Me gustaría solicitar una consulta:

🏢 Empresa: ${this.formData.nombreEmpresa}
👤 Contacto: ${this.formData.nombre} ${this.formData.apellidos}
📧 Email: ${this.formData.email}
📞 Teléfono: ${this.formData.telefono}
🔧 Servicio: ${this.formData.servicio}
📅 Fecha preferida: ${this.formData.fechaConsulta}

¡Gracias!`;
  }

  generateEmailSubject(): string {
    return `Solicitud de consulta - ${this.formData.servicio} - ${this.formData.nombreEmpresa}`;
  }

  generateEmailBody(): string {
    return `Estimado equipo NexqAI,

Me pongo en contacto para solicitar una consulta sobre sus servicios.

Datos de la empresa:
- Empresa: ${this.formData.nombreEmpresa}
- Contacto: ${this.formData.nombre} ${this.formData.apellidos}
- Email: ${this.formData.email}
- Teléfono: ${this.formData.telefono}

Servicio requerido: ${this.formData.servicio}
Fecha preferida para la consulta: ${this.formData.fechaConsulta}

Quedo a la espera de su respuesta para coordinar la reunión.

Saludos cordiales,
${this.formData.nombre} ${this.formData.apellidos}
${this.formData.nombreEmpresa}`;
  }
}
