import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookie-consent-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cookie-consent-banner.component.html',
  styleUrls: ['./cookie-consent-banner.component.scss']
})
export class CookieConsentBannerComponent {
  showBanner = false;

  constructor() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      this.showBanner = true;
    }
  }

  acceptCookies(): void {
    localStorage.setItem('cookieConsent', 'accepted'); // puedes usar 'all' si luego gestionas por categorías
    this.showBanner = false;
  }

  rejectCookies(): void {
    localStorage.setItem('cookieConsent', 'rejected'); // útil si luego necesitas condicionar GA u otros
    this.showBanner = false;
  }
}
