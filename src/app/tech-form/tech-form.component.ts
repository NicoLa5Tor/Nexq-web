// tech-form.component.ts
import { Component, Input,Inject, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as AOS from 'aos';

export interface FormData {
  servicio: string;
  email: string;
  telefono: string;
  nombre: string;
  apellidos: string;
  nombreEmpresa: string;
  fechaConsulta: string;
}

@Component({
  selector: 'app-tech-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tech-form.component.html',
  styleUrls: ['./tech-form.component.scss']
})
export class TechFormComponent implements OnInit, AfterViewInit {
  @Input() servicioInicial: string = '';
  @Output() formCompleted = new EventEmitter<FormData>();
  @Input() initialData?: FormData;
  // Lista de servicios disponibles
  servicios = [
    { id: 'analisis-datos', nombre: 'Análisis Avanzado de Datos' },
    { id: 'soluciones-ia', nombre: 'Soluciones Basadas en IA' },
    { id: 'big-data', nombre: 'Big Data y Visualización' },
    { id: 'desarrollo-software', nombre: 'Desarrollo de Software' },
    { id: 'investigacion-desarrollo', nombre: 'Investigación y Desarrollo' },
    { id: 'servicios-financieros', nombre: 'Servicios Financieros' }
  ];
  
  techForm!: FormGroup;
  isFormValid = false;
  isSubmitting = false;
  isSubmitted = false;
  minDate = new Date().toISOString().split('T')[0];
  
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  ngOnInit() {
    this.initForm();
    this.techForm.valueChanges.subscribe(() => {
      this.isFormValid = this.techForm.valid;
    });
  
    // Si existen datos iniciales, prellenar el formulario
    if (this.data && this.data.initialData) {
      this.techForm.patchValue(this.data.initialData);
    }
  }
  
  ngAfterViewInit() {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-out-cubic'
    });
  }
  
  initForm() {
    // Buscar el servicio que coincide con el nombre proporcionado por el componente padre
    const servicioEncontrado = this.servicios.find(s => 
      s.nombre === this.servicioInicial || s.id === this.servicioInicial
    );
    
    const servicioValido = servicioEncontrado ? servicioEncontrado.id : '';
    
    this.techForm = this.fb.group({
      servicio: [servicioValido, [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s\-\(\)]{10,15}$/)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      nombreEmpresa: ['', [Validators.required, Validators.minLength(2)]],
      fechaConsulta: ['', [Validators.required]]
    });
    
    // Si hay un servicio inicial, lo establecemos explícitamente
    if (servicioValido) {
      this.techForm.get('servicio')?.setValue(servicioValido);
      this.techForm.get('servicio')?.updateValueAndValidity();
    }
  }
  
  onSubmit() {
    if (this.techForm.valid) {
      this.isSubmitting = true;
      
      // Emitimos el evento con los datos para que el componente padre los maneje
      this.formCompleted.emit(this.techForm.value);
      
      // No hacemos nada más - el componente padre es quien debe manejar qué hacer
      // después de recibir los datos del formulario
      setTimeout(() => {
        this.isSubmitting = false;
      }, 500);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.techForm.controls).forEach(key => {
        this.techForm.get(key)?.markAsTouched();
      });
    }
  }
  
  resetForm() {
    this.techForm.reset();
    
    // Buscar el servicio que coincide con el nombre proporcionado por el componente padre
    const servicioEncontrado = this.servicios.find(s => 
      s.nombre === this.servicioInicial || s.id === this.servicioInicial
    );
    
    const servicioValido = servicioEncontrado ? servicioEncontrado.id : '';
    
    if (servicioValido) {
      this.techForm.get('servicio')?.setValue(servicioValido);
      this.techForm.get('servicio')?.updateValueAndValidity();
    }
    
    this.isSubmitted = false;
  }
  
  getFieldError(fieldName: string): string {
    const field = this.techForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} muy corto`;
      if (field.errors['pattern']) return 'Formato de teléfono inválido';
    }
    return '';
  }
  
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      servicio: 'Servicio',
      email: 'Email',
      telefono: 'Teléfono',
      nombre: 'Nombre',
      apellidos: 'Apellidos',
      nombreEmpresa: 'Nombre de la empresa',
      fechaConsulta: 'Fecha de consulta'
    };
    return labels[fieldName] || fieldName;
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.techForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }
  
  getFormCompletionPercentage(): number {
    const fields = Object.keys(this.techForm.controls);
    const validFields = fields.filter(field => this.techForm.get(field)?.valid);
    return Math.round((validFields.length / fields.length) * 100);
  }
  
  // Métodos para las animaciones del header
  getHeaderGradient(servicio: string | null | undefined): string {
    switch(servicio) {
      case 'analisis-datos':
        return 'from-blue-900 to-cyan-700';
      case 'soluciones-ia':
        return 'from-purple-900 to-pink-700';
      case 'big-data':
        return 'from-emerald-900 to-teal-700';
      case 'desarrollo-software':
        return 'from-red-900 to-orange-700';
      case 'investigacion-desarrollo':
        return 'from-amber-900 to-yellow-700';
      case 'servicios-financieros':
        return 'from-indigo-900 to-violet-700';
      default:
        return 'from-blue-800 to-indigo-800';
    }
  }
  
  getIconBackground(servicio: string | null | undefined): string {
    switch(servicio) {
      case 'analisis-datos':
        return 'bg-gradient-to-r from-blue-500 to-cyan-400';
      case 'soluciones-ia':
        return 'bg-gradient-to-r from-purple-500 to-pink-400';
      case 'big-data':
        return 'bg-gradient-to-r from-emerald-500 to-teal-400';
      case 'desarrollo-software':
        return 'bg-gradient-to-r from-red-500 to-orange-400';
      case 'investigacion-desarrollo':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400';
      case 'servicios-financieros':
        return 'bg-gradient-to-r from-indigo-500 to-violet-400';
      default:
        return 'bg-gradient-to-r from-cyan-400 to-blue-500';
    }
  }
  
  getParticleClass(index: number, servicio: string | null | undefined): string {
    const baseClass = 'particles';
    switch(servicio) {
      case 'analisis-datos':
        return baseClass + ' particles-analisis-datos';
      case 'soluciones-ia':
        return baseClass + ' particles-soluciones-ia';
      case 'big-data':
        return baseClass + ' particles-big-data';
      case 'desarrollo-software':
        return baseClass + ' particles-desarrollo-software';
      case 'investigacion-desarrollo':
        return baseClass + ' particles-investigacion-desarrollo';
      case 'servicios-financieros':
        return baseClass + ' particles-servicios-financieros';
      default:
        return baseClass;
    }
  }
}