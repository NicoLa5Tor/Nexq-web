import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AppointmentService, ServiceOption, AppointmentData } from '../../Services/appointment.service';

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatListModule,
    MatStepperModule,
    MatIconModule
  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss']
})
export class AppointmentDialogComponent {
  personalGroup: FormGroup;
  serviceGroup: FormGroup;
  scheduleGroup: FormGroup;

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
    { value: 'email', label: 'Correo Electrónico' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'whatsapp', label: 'WhatsApp' }
  ];

  showSuccess = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentDialogComponent>,
    private appointmentService: AppointmentService,
    @Inject(MAT_DIALOG_DATA) public data: { serviceId: string }
  ) {
    this.services = this.appointmentService.services;
    const selectedService = data?.serviceId || this.appointmentService.getSelectedService();

    this.personalGroup = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
      company: ['', Validators.required]
    });

    this.serviceGroup = this.fb.group({
      service: [selectedService, Validators.required]
    });

    this.scheduleGroup = this.fb.group({
      preferredTime: ['', Validators.required],
      preferredContact: ['email', Validators.required],
      message: ['']
    });

    this.personalGroup.get('phone')?.valueChanges.subscribe(val => {
      const digits = String(val || '').replace(/\D/g, '').slice(0, 10);
      if (digits !== val) {
        this.personalGroup.get('phone')?.setValue(digits, { emitEvent: false });
      }
    });
  }

  submit(): void {
    if (this.personalGroup.invalid || this.serviceGroup.invalid || this.scheduleGroup.invalid) {
      return;
    }
    const data: AppointmentData = {
      ...this.personalGroup.value,
      ...this.serviceGroup.value,
      ...this.scheduleGroup.value
    } as AppointmentData;
    this.appointmentService.setSelectedService(data.service);
    this.appointmentService.setAppointmentData(data);
    this.showSuccess = true;
    setTimeout(() => {
      this.dialogRef.close({ success: true, data });
    }, 1500);
  }
}
