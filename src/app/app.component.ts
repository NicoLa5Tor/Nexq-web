import { Component, Inject, OnInit, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import AOS from 'aos';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'nexq-ai';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit(): void {
    const isMobile = window.innerWidth <= 768;
    
    AOS.init({
      duration: isMobile ? 600 : 800,
      delay: isMobile ? 100 : 200,
      easing: 'ease-out-cubic',
      once: true,
      mirror: false,
      offset: isMobile ? 50 : 120,
      disable: false
    });
  }

  ngAfterViewInit(): void {
    // Opcional si necesitas refrescar animaciones dinámicas
    // AOS.refresh();
  }
}
