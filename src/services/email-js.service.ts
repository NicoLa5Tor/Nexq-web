// src/app/services/emailjs.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interfaces para tipado fuerte
export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  userId: string;
}

export interface EmailTemplate {
  [key: string]: any;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  originalResponse?: any;
}

export interface EmailError {
  success: false;
  message: string;
  originalResponse?: any;
}

export const EMAIL_TEMPLATES = {
  CONTACT_FORM: {
    serviceId: 'service_g4rn9bf',
    templateId: 'template_vh3a6in',
    userId: 'AWT8RFyy4Tnnh9Ta1'
  },
  TECH_CONSULTATION: {
    serviceId: 'service_g4rn9bf',
    templateId: 'template_c51n2ai',
    userId: 'AWT8RFyy4Tnnh9Ta1'
  },
  NEWSLETTER: {
    serviceId: 'service_g4rn9bf',
    templateId: 'template_newsletter', 
    userId: 'AWT8RFyy4Tnnh9Ta1'
  },
  QUOTE_REQUEST: {
    serviceId: 'service_g4rn9bf',
    templateId: 'template_quote', 
    userId: 'AWT8RFyy4Tnnh9Ta1'
  }
} as const;

@Injectable({
  providedIn: 'root'
})
export class EmailJSService {
  private readonly apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}
  sendEmail(templateParams: EmailTemplate, config: EmailJSConfig): Observable<EmailResponse> {
    const payload = {
      service_id: config.serviceId,
      template_id: config.templateId,
      user_id: config.userId,
      template_params: templateParams
    };

    return this.http.post(this.apiUrl, payload, {
      headers: this.defaultHeaders,
      responseType: 'text' as 'json'
    }).pipe(
      map((response: any) => {
        // EmailJS devuelve "OK" cuando es exitoso
        if (response === 'OK' || (typeof response === 'string' && response.includes('OK'))) {
          return {
            success: true,
            message: 'Email enviado exitosamente',
            originalResponse: response
          };
        } else {
          throw new Error(`Respuesta inesperada: ${response}`);
        }
      }),
      catchError((error) => {
        // Si el status es 200 pero hay error de parsing, probablemente sí se envió
        if (error.status === 200 && error.statusText === 'OK') {
          return [{
            success: true,
            message: 'Email enviado exitosamente (error de parsing menor)',
            originalResponse: error.error
          }];
        }
        
        return throwError(() => ({
          success: false,
          message: this.getErrorMessage(error),
          originalResponse: error
        }));
      })
    );
  }

  sendEmailWithTemplate(
    templateKey: keyof typeof EMAIL_TEMPLATES, 
    templateParams: EmailTemplate
  ): Observable<EmailResponse> {
    const config = EMAIL_TEMPLATES[templateKey];
    return this.sendEmail(templateParams, config);
  }

  sendContactForm(contactData: {
    name: string;
    email: string;
    company?: string;
    service: string;
    message: string;
  }): Observable<EmailResponse> {
    const templateParams = {
      from_name: contactData.name,
      from_email: contactData.email,
      company: contactData.company || 'No especificada',
      service: contactData.service,
      message: contactData.message,
      to_email: 'investigacion@nexqai.com'
    };

    return this.sendEmailWithTemplate('CONTACT_FORM', templateParams);
  }

  sendTechConsultationForm(consultationData: {
    servicio: string;
    email: string;
    telefono: string;
    nombre: string;
    apellidos: string;
    nombreEmpresa: string;
    fechaConsulta: string;
  }): Observable<EmailResponse> {
    const serviceNames: { [key: string]: string } = {
      'analisis-datos': 'Análisis Avanzado de Datos',
      'soluciones-ia': 'Soluciones Basadas en IA',
      'big-data': 'Big Data y Visualización',
      'desarrollo-software': 'Desarrollo de Software',
      'investigacion-desarrollo': 'Investigación y Desarrollo',
      'servicios-financieros': 'Servicios Financieros'
    };

    const serviceDescriptions: { [key: string]: string } = {
      'analisis-datos': 'Minería de datos, reportes ejecutivos y modelos predictivos para transformar información en decisiones estratégicas.',
      'soluciones-ia': 'Automatización de procesos, asistentes virtuales y optimización logística con inteligencia artificial.',
      'big-data': 'Bases de datos escalables, integración con Power BI/Tableau y visualización avanzada para grandes volúmenes de datos.',
      'desarrollo-software': 'Aplicaciones web/móviles personalizadas, computación avanzada y sistemas automatizados de gestión.',
      'investigacion-desarrollo': 'Algoritmos de optimización sectorial, proyectos experimentales en IA y colaboraciones académicas.',
      'servicios-financieros': 'Gestión de riesgos de mercado/crédito, optimización de inversiones y análisis actuarial.'
    };

    const templateParams = {
      service_name: serviceNames[consultationData.servicio] || consultationData.servicio,
      service_description: serviceDescriptions[consultationData.servicio] || 'Consulta técnica especializada.',
      client_name: consultationData.nombre,
      client_lastname: consultationData.apellidos,
      client_email: consultationData.email,
      client_phone: consultationData.telefono,
      company_name: consultationData.nombreEmpresa,
      preferred_date: this.formatDate(consultationData.fechaConsulta),
      submission_date: new Date().toLocaleString('es-ES', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      to_email: 'investigacion@nexqai.com'
    };

    return this.sendEmailWithTemplate('TECH_CONSULTATION', templateParams);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  sendNewsletter(emailData: {
    to_email: string;
    subject: string;
    content: string;
  }): Observable<EmailResponse> {
    return this.sendEmailWithTemplate('NEWSLETTER', emailData);
  }

  sendQuoteRequest(quoteData: {
    client_name: string;
    client_email: string;
    project_description: string;
    budget_range: string;
  }): Observable<EmailResponse> {
    return this.sendEmailWithTemplate('QUOTE_REQUEST', quoteData);
  }

  /**
   * Verifica si EmailJS está configurado correctamente
   * @param config Configuración a verificar
   * @returns boolean indicando si la configuración es válida
   */
  isConfigValid(config: EmailJSConfig): boolean {
    return !!(config.serviceId && config.templateId && config.userId);
  }

  /**
   * Obtiene la lista de templates disponibles
   * @returns Array con las claves de templates disponibles
   */
  getAvailableTemplates(): string[] {
    return Object.keys(EMAIL_TEMPLATES);
  }

  /**
   * Obtiene la descripción detallada de un servicio
   * @param serviceType Tipo de servicio
   * @returns Descripción del servicio
   */
  private getServiceDescription(serviceType: string): string {
    const descriptions: { [key: string]: string } = {
      'Análisis Avanzado de Datos': 'Minería de datos, reportes ejecutivos, modelos de machine learning personalizados y evaluación de riesgos con modelos predictivos.',
      'Soluciones Basadas en IA': 'Automatización de procesos empresariales, asistentes virtuales, bots inteligentes y optimización de operaciones logísticas.',
      'Big Data y Visualización': 'Diseño de bases de datos escalables, integración con Power BI y Tableau, y visualización avanzada de hallazgos clave.',
      'Desarrollo de Software': 'Aplicaciones web y móviles personalizadas, soluciones en computación avanzada y sistemas automatizados para gestión.',
      'Investigación y Desarrollo': 'Algoritmos de optimización sectorial, modelos estocásticos y proyectos experimentales en IA.',
      'Servicios Financieros': 'Gestión de riesgos de mercado y crédito, optimización de portafolios, análisis actuarial y valoración de activos.'
    };

    return descriptions[serviceType] || 'Consulta técnica especializada según las necesidades del cliente.';
  }

  /**
   * Maneja los errores y devuelve mensajes amigables
   * @param error Error del HTTP
   * @returns Mensaje de error amigable
   */
  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'No hay conexión a internet. Verifica tu conexión.';
    } else if (error.status === 400) {
      return 'Error en los datos enviados. Verifica la información.';
    } else if (error.status === 401) {
      return 'Error de autenticación con EmailJS.';
    } else if (error.status === 402) {
      return 'Límite de emails alcanzado en EmailJS.';
    } else if (error.status >= 500) {
      return 'Error del servidor de EmailJS. Inténtalo más tarde.';
    } else {
      return 'Error desconocido al enviar el email.';
    }
  }
}