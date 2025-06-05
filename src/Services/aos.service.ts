import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import AOS from 'aos';

@Injectable({
  providedIn: 'root'
})
export class AosService {
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  init(): void {
    if (!this.initialized && isPlatformBrowser(this.platformId)) {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true
      });
      this.initialized = true;
    }
  }

  refresh(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.refresh();
    }
  }
}
