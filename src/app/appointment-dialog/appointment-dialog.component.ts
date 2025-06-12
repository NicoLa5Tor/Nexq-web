import { Component, OnInit, Inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppointmentService, ServiceOption, AppointmentData } from '../../Services/appointment.service';


@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss'],
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'scale(0.8) translateY(-50px)',
          backdropFilter: 'blur(0px)'
        }),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ 
            opacity: 1, 
            transform: 'scale(1) translateY(0)',
            backdropFilter: 'blur(10px)'
          })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ 
            opacity: 0, 
            transform: 'scale(0.8) translateY(-50px)',
            backdropFilter: 'blur(0px)'
          })
        )
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('successAnimation', [
      state('hidden', style({ opacity: 0, transform: 'scale(0.5)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible', [
        animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)')
      ])
    ])
  ]
})
export class AppointmentDialogComponent implements OnInit {
  appointmentForm!: FormGroup;
  selectedServiceId: string = '';
  isSubmitting = false;
  showSuccess = false;
  currentStep = 1;
  totalSteps = 3;

  services: ServiceOption[] = [];

  timeSlots = [
    { value: '09:00-10:00', label: '9:00 AM - 10:00 AM', available: true },
    { value: '10:00-11:00', label: '10:00 AM - 11:00 AM', available: true },
    { value: '11:00-12:00', label: '11:00 AM - 12:00 PM', available: false },
    { value: '14:00-15:00', label: '2:00 PM - 3:00 PM', available: true },
    { value: '15:00-16:00', label: '3:00 PM - 4:00 PM', available: true },
    { value: '16:00-17:00', label: '4:00 PM - 5:00 PM', available: true }
  ];

  contactMethods = [
    { value: 'email', label: 'Correo Electrónico', icon: '📧' },
    { value: 'phone', label: 'Teléfono', icon: '📱' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' }
  ];

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private dialogRef: MatDialogRef<AppointmentDialogComponent>,
    private appointmentService: AppointmentService,
    @Inject(MAT_DIALOG_DATA) public data: { serviceId: string }
  ) {
    this.services = this.appointmentService.services;
    this.selectedServiceId = data?.serviceId || this.appointmentService.getSelectedService();
  }

  ngOnInit(): void {
    this.initializeForm();
    document.body.style.overflow = 'hidden';
    if (this.selectedServiceId) {
      this.appointmentService.setSelectedService(this.selectedServiceId);
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    this.closeDialog();
  }

  initializeForm(): void {
    this.appointmentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      company: ['', [Validators.required, Validators.minLength(2)]],
      service: [this.selectedServiceId || '', Validators.required],
      preferredTime: ['', Validators.required],
      preferredContact: ['email', Validators.required],
      message: ['']
    });
  }

  getSelectedService() {
    const serviceId = this.appointmentForm.get('service')?.value;
    return this.services.find(s => s.id === serviceId);
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.validateCurrentStep()) {
        this.currentStep++;
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        const personalFields = ['firstName', 'lastName', 'email', 'phone', 'company'];
        return personalFields.every(field => {
          const control = this.appointmentForm.get(field);
          return control?.valid;
        });
      case 2:
        return this.appointmentForm.get('service')?.valid || false;
      case 3:
        return this.appointmentForm.get('preferredTime')?.valid || false;
      default:
        return true;
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.isSubmitting = true;
      const formData: AppointmentData = this.appointmentForm.value;
      this.appointmentService.setAppointmentData(formData);

      // Simular envío
      setTimeout(() => {
        this.isSubmitting = false;
        this.showSuccess = true;

        setTimeout(() => {
          this.dialogRef.close({ success: true, data: formData });
        }, 2000);
      }, 1000);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.appointmentForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('email')) {
      return 'Ingrese un email válido';
    }
    if (field?.hasError('pattern')) {
      return 'Formato inválido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  formatPhone(event: any): void {
    const input = event.target;
    let digits = input.value.replace(/\D/g, '');

    if (digits.startsWith('57')) {
      digits = digits.substring(2);
    }

    let display = digits;
    if (digits.length > 3 && digits.length <= 6) {
      display = digits.slice(0, 3) + ' ' + digits.slice(3);
    } else if (digits.length > 6) {
      display = digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 10);
    }

    input.value = display;
    this.appointmentForm.patchValue({ phone: digits });
  }

  selectService(serviceId: string): void {
    this.appointmentForm.patchValue({ service: serviceId });
    this.appointmentService.setSelectedService(serviceId);
  }

  selectTimeSlot(timeValue: string): void {
    this.appointmentForm.patchValue({ preferredTime: timeValue });
  }

  selectContactMethod(method: string): void {
    this.appointmentForm.patchValue({ preferredContact: method });
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'Información Personal';
      case 2: return 'Seleccionar Servicio';
      case 3: return 'Programar Cita';
      default: return 'Agendar Consulta';
    }
  }

  getStepDescription(): string {
    switch (this.currentStep) {
      case 1: return 'Cuéntanos sobre ti y tu empresa';
      case 2: return 'Elige el servicio que necesitas';
      case 3: return 'Selecciona fecha y hora preferida';
      default: return '';
    }
  }
}