import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        if (document.scrollingElement) {
          document.scrollingElement.scrollTop = 0;
        } else {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      });
    }
  }
}