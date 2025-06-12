import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService,AppointmentData } from '../../Services/appointment.service';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-send-method-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './send-method-dialog.component.html',
  styleUrls: ['./send-method-dialog.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('buttonHover', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hover', style({ transform: 'scale(1.05)' })),
      transition('normal <=> hover', animate('200ms ease-out'))
    ])
  ]
})
export class SendMethodDialogComponent implements OnInit {
  appointmentData: AppointmentData | null = null;
  hoveredButton: string = '';
  sending = false;
  sendSuccess = false;

  constructor(
    public dialogRef: MatDialogRef<SendMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { appointmentData: AppointmentData },
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {
    this.appointmentData = data.appointmentData;
  }

  ngOnInit(): void {
    // Animación de entrada
  }

  sendByEmail(): void {
    if (!this.appointmentData) return;
    
    this.sending = true;
    const emailTemplate = this.appointmentService.generateEmailTemplate(this.appointmentData);
    const subject = encodeURIComponent(`Solicitud de Consultoría - ${this.appointmentService.getServiceById(this.appointmentData.service)?.name || 'General'}`);
    const body = encodeURIComponent(emailTemplate);
    
    // Simular envío
    setTimeout(() => {
      // Abrir cliente de correo predeterminado
      window.location.href = `mailto:info@nexqanalytics.com?subject=${subject}&body=${body}`;
      
      this.sending = false;
      this.sendSuccess = true;
      
      // Mostrar mensaje de éxito
      this.snackBar.open('✅ Se ha abierto tu cliente de correo', 'Cerrar', {
        duration: 5000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      
      // Cerrar dialog después de un momento
      setTimeout(() => {
        this.dialogRef.close({ method: 'email', success: true });
      }, 2000);
    }, 1000);
  }

  sendByWhatsApp(): void {
    if (!this.appointmentData) return;
    
    this.sending = true;
    const message = this.appointmentService.generateWhatsAppMessage(this.appointmentData);
    const phoneNumber = '573001234567'; // Reemplazar con el número real de la empresa en Colombia
    
    // Simular envío
    setTimeout(() => {
      // Abrir WhatsApp
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      
      this.sending = false;
      this.sendSuccess = true;
      
      // Mostrar mensaje de éxito
      this.snackBar.open('✅ Se ha abierto WhatsApp', 'Cerrar', {
        duration: 5000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      
      // Cerrar dialog después de un momento
      setTimeout(() => {
        this.dialogRef.close({ method: 'whatsapp', success: true });
      }, 2000);
    }, 1000);
  }

  getServiceName(): string {
    if (!this.appointmentData) return '';
    return this.appointmentService.getServiceById(this.appointmentData.service)?.name || 'Consultoría General';
  }

  getServiceIcon(): string {
    if (!this.appointmentData) return '';
    return this.appointmentService.getServiceById(this.appointmentData.service)?.icon || '';
  }
}