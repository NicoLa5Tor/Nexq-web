// maintenance.component.ts
import { Component,OnInit } from '@angular/core';
import { NgFor, NgStyle } from '@angular/common';
import { ScrollService } from '../../../services/scroll.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [NgFor, NgStyle],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit{
  constructor(private scrollService: ScrollService){}
  ngOnInit(): void {
    this.scrollService.scrollToTop();
  }
  // Arreglos para las columnas binarias y sus elementos
  binaryColumns = Array(10).fill(0).map((_, i) => ({
    position: (i+1)*10,
    delay: i*0.3
  }));
  
  binaryDigits = Array(15).fill(0).map((_, i) => i % 2);
  
  // Array para los mensajes de consola
  consoleMessages = [
    'Ejecutando diagnóstico del sistema...',
    'Reconfigurando firewalls...',
    'Optimizando bases de datos...',
    'Volvemos pronto. Acceso restringido.'
  ];
}