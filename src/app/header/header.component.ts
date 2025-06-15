// header.component.ts
import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isScrolled = false;
  mobileMenuOpen = false;
  isNavigating = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Comprobar si ya hay scroll al iniciar
      this.checkScroll();
    }
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // Método para cerrar el menú después de la selección
  closeMenu() {
    this.mobileMenuOpen = false;
  }

  // Método para navegar con efecto de spinner
  navigateTo(route: string, event: MouseEvent) {
    event.preventDefault(); // Prevenimos la navegación estándar
    this.closeMenu(); // Cerramos el menú si está abierto
    
    // Activamos el spinner
    this.isNavigating = true;
    
    if (isPlatformBrowser(this.platformId)) {
      // Esperamos a que el spinner se muestre brevemente
      setTimeout(() => {
        // Después del tiempo de espera, navegamos a la ruta
        this.router.navigate([route]).then(() => {
          // Mantenemos el spinner un poco más después de que la navegación se complete
          setTimeout(() => {
            this.isNavigating = false;
          }, 400);
        });
      }, 600);
    } 
  }
}