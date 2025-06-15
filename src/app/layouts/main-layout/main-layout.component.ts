import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import {
  CommonModule,
  ViewportScroller,
  isPlatformBrowser
} from '@angular/common';
import {
  Router,
  NavigationEnd,
  RouterOutlet,
  Event
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { CookieConsentBannerComponent } from '../../legal/cookie-consent-banner/cookie-consent-banner.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CookieConsentBannerComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private scroll: ViewportScroller,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.router.events
        .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => {
          this.onRouteChange(); // ✅ se llama en cada navegación
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private onRouteChange(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scroll.scrollToPosition([0, 0]); // Scroll al top
    }

    // ✅ Aquí va tu lógica personalizada global:
    // cerrar modales, reiniciar cosas, logs, etc.
    console.log('Cambio de ruta detectado');
  }
}
