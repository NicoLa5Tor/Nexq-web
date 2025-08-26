import { Component, OnInit, ElementRef, Renderer2, ViewChild, AfterViewInit, signal, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AosService } from '../../services/aos.service';
import { RouterLink } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { ParticlesBackgroundComponent } from '../animations/particles-background/particles-background.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SendOptionsComponent } from '../send-options/send-options.component';
import { AppointmentService } from '../../services/appointment.service';

// NUEVO IMPORT PARA EL FORMULARIO TECH
import { TechFormComponent, FormData } from '../tech-form/tech-form.component';

@Component({
  selector: 'app-services-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, ParticlesBackgroundComponent, MatDialogModule],
  templateUrl: './services-overview.component.html',
  styleUrls: ['./services-overview.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ServicesOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('titleContainer') titleContainer!: ElementRef;
  mostrarServicio = signal(false);
  particleColors = [
    'rgba(94, 137, 176, 0.6)', // azul
    'rgba(110, 86, 207, 0.6)', // morado
    'rgba(158, 119, 224, 0.6)', // lila
    'rgba(94, 137, 176, 0.3)', // azul claro
    'rgba(255, 255, 255, 0.5)' // blanco
  ];
  isMobile = false;
  showParticles = true;

  get particleDensity(): number {
    return this.isMobile ? 20000 : (this.mostrarServicio() ? 12000 : 8000);
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private serviceEstatus: ServiceService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private aos: AosService,
    private dialog: MatDialog,
    private appointmentService: AppointmentService
  ) { }

  ngOnInit(): void {
    this.mostrarServicio.set(this.serviceEstatus.getActivate());
    this.serviceEstatus.setActivate();

    // Inicializar animaciones solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
      this.showParticles = !this.isMobile;
      this.initFadeInAnimations();
      this.aos.refresh();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // COMENTADO: Configurar nodos neurales - usar solo AOS
      // if (this.mostrarServicio()) {
      //   this.setupNeuralNodes();
      // }
      // Refrescar AOS para que detecte los nuevos elementos
      this.aos.refresh();
    }
  }


  returnToView() {
    this.mostrarServicio.set(!this.mostrarServicio());
    // Configurar los nodos neurales después de cambiar la vista
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        // COMENTADO: Setup nodos neurales - usar solo AOS
        // if (this.mostrarServicio()) {
        //   this.setupNeuralNodes();
        // }
      }, 100);
    }
    
    // Refrescar AOS para detectar nuevos elementos
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.aos.refresh();
      }, 50);
    }
  }
  openTechDialog(serviceId?: string, initialData?: FormData): void {
    const dialogRef = this.dialog.open(TechFormComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'tech-dialog-container',
      autoFocus: false,
      data: { initialData } // Pasar los datos iniciales al diálogo
    });
  
    dialogRef.componentInstance.servicioInicial = serviceId || '';
    
    dialogRef.componentInstance.formCompleted.subscribe((formData: FormData) => {
      dialogRef.close();
      this.handleFormData(formData);
    });
  }
  private handleFormData(formData: FormData): void {
    const dialogRef = this.dialog.open(SendOptionsComponent, {
      width: '420px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'send-options-dialog',
      autoFocus: false,
      data: { formData }
    });
  
    // Añadir suscripción a eventos después de abrir el diálogo
    dialogRef.componentInstance.editData.subscribe(() => {
      dialogRef.close();
      // Reabrir el formulario con los datos existentes
      this.openTechDialog(formData.servicio, formData);
    });
  }
  



  // Método para abrir el dialog de opciones de envío  





  /**
   * Método para manejar la visibilidad del CTA
   * Se llama cuando cambia el estado de mostrarServicio
   */


  // COMENTADO: Función de setup de nodos neuronales - usar solo AOS
  // private setupNeuralNodes(): void {
  //   if (!isPlatformBrowser(this.platformId)) return;
  //   const nodesContainer = this.el.nativeElement.querySelector('.neural-nodes-container');
  //   if (!nodesContainer) return;

  //   // Asegurarse de que los nodos sean visibles
  //   this.renderer.setStyle(nodesContainer, 'opacity', '1');
  //   this.renderer.setStyle(nodesContainer, 'visibility', 'visible');
    
  //   // Ajustar z-index si es necesario
  //   this.renderer.setStyle(nodesContainer, 'z-index', '1');
    
  //   // Hacer lo mismo con las líneas de conexión
  //   const dataFlowSvg = this.el.nativeElement.querySelector('.data-flow-svg');
  //   if (dataFlowSvg) {
  //     this.renderer.setStyle(dataFlowSvg, 'opacity', '1');
  //     this.renderer.setStyle(dataFlowSvg, 'visibility', 'visible');
  //     this.renderer.setStyle(dataFlowSvg, 'z-index', '1');
  //   }
  // }

  private initFadeInAnimations(): void {
    // Verificar que estamos en el navegador
    if (!isPlatformBrowser(this.platformId)) return;

    // Animación de entrada para elementos cuando son visibles
    const fadeElements = document.querySelectorAll('.services-section .fade-in');
    
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
}
