import { Component, OnInit, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { AosService } from '../../Services/aos.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', animate('600ms ease-out'))
    ])
  ]
})
export class AboutUsComponent implements OnInit {
  @ViewChild('aboutSection', { static: true }) aboutSection!: ElementRef;
  fadeState = 'hidden';
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private aos: AosService
  ) { }
  
  ngOnInit(): void {
    // Inicializar animaciones solo cuando estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initIntersectionAnimation();
      this.aos.refresh();
    }
  }

  private initIntersectionAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (typeof IntersectionObserver === 'undefined') {
      this.fadeState = 'visible';
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.fadeState = 'visible';
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.aboutSection.nativeElement);
  }
}