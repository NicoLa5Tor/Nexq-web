import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, Event } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private scrollTop: ViewportScroller
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.router.events.pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.onRouteChange(event.urlAfterRedirects);
      })
    );
  }

  ngOnDestroy() {
    // Limpieza de la suscripción
    this.subscription.unsubscribe();
  }

  private onRouteChange(url: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.scrollTop.scrollToPosition([0,0])

    }
  }
}