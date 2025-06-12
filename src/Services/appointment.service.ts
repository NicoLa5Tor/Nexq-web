import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppointmentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message?: string;
  preferredContact?: 'phone' | 'email' | 'whatsapp';
  preferredTime?: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private selectedServiceSubject = new BehaviorSubject<string>('');
  selectedService$ = this.selectedServiceSubject.asObservable();
  
  private appointmentDataSubject = new BehaviorSubject<AppointmentData | null>(null);
  appointmentData$ = this.appointmentDataSubject.asObservable();

  services: ServiceOption[] = [
    {
      id: 'data-analysis',
      name: 'Análisis Avanzado de Datos',
      description: 'Minería de datos, ML y modelos predictivos',
      icon: 'M21.21 15.89A10 10 0 1 1 8 2.83 M22 12A10 10 0 0 0 12 2v10z'
    },
    {
      id: 'ai-solutions',
      name: 'Soluciones Basadas en IA',
      description: 'Automatización y asistentes virtuales',
      icon: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3 M8 22h8'
    },
    {
      id: 'big-data',
      name: 'Big Data y Visualización',
      description: 'Bases de datos escalables y visualización',
      icon: 'M3 3h18v18H3z M3 9h18 M9 21V9'
    },
    {
      id: 'software-dev',
      name: 'Desarrollo de Software',
      description: 'Aplicaciones web y móviles personalizadas',
      icon: 'M16 18l6-6-6-6 M8 6l-6 6 6 6'
    },
    {
      id: 'research',
      name: 'Investigación y Desarrollo',
      description: 'Algoritmos de optimización sectorial',
      icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'
    },
    {
      id: 'financial',
      name: 'Servicios Financieros',
      description: 'Gestión de riesgos y optimización',
      icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'
    }
  ];

  constructor() { }

  setSelectedService(serviceId: string): void {
    this.selectedServiceSubject.next(serviceId);
  }

  getSelectedService(): string {
    return this.selectedServiceSubject.value;
  }

  setAppointmentData(data: AppointmentData): void {
    this.appointmentDataSubject.next(data);
  }

  getAppointmentData(): AppointmentData | null {
    return this.appointmentDataSubject.value;
  }

  getServiceById(id: string): ServiceOption | undefined {
    return this.services.find(service => service.id === id);
  }

  generateEmailTemplate(data: AppointmentData): string {
    const service = this.getServiceById(data.service);
    return `
Asunto: Solicitud de Consultoría - ${service?.name || 'General'}

Estimado equipo de NexQ Analytics,

Me gustaría solicitar una consultoría para el siguiente servicio:

INFORMACIÓN DEL SOLICITANTE:
- Nombre: ${data.firstName} ${data.lastName}
- Empresa: ${data.company}
- Email: ${data.email}
- Teléfono: ${data.phone}

SERVICIO SOLICITADO:
- Tipo de servicio: ${service?.name || 'Consultoría General'}
- Descripción: ${service?.description || ''}

${data.message ? `MENSAJE ADICIONAL:\n${data.message}` : ''}

${data.preferredTime ? `HORARIO PREFERIDO: ${data.preferredTime}` : ''}
${data.preferredContact ? `CONTACTO PREFERIDO: ${data.preferredContact === 'phone' ? 'Teléfono' : data.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Email'}` : ''}

Quedo atento a su respuesta para coordinar la reunión.

Saludos cordiales,
${data.firstName} ${data.lastName}
    `.trim();
  }

  generateWhatsAppMessage(data: AppointmentData): string {
    const service = this.getServiceById(data.service);
    return encodeURIComponent(`
¡Hola! Me gustaría agendar una consultoría.

*DATOS DE CONTACTO:*
• Nombre: ${data.firstName} ${data.lastName}
• Empresa: ${data.company}
• Email: ${data.email}
• Teléfono: ${data.phone}

*SERVICIO DE INTERÉS:*
${service?.name || 'Consultoría General'}

${data.message ? `*MENSAJE:*\n${data.message}` : ''}

${data.preferredTime ? `*Horario preferido:* ${data.preferredTime}` : ''}

¿Cuándo podríamos agendar una reunión?
    `.trim());
  }

  clearData(): void {
    this.selectedServiceSubject.next('');
    this.appointmentDataSubject.next(null);
  }
}