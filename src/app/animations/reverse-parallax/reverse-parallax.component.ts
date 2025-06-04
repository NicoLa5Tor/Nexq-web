import { Component, AfterViewInit } from '@angular/core';
import { animate } from 'animejs';

@Component({
  selector: 'app-reverse-parallax',
  standalone: true,
  imports: [],
  templateUrl: './reverse-parallax.component.html',
  styleUrls: ['./reverse-parallax.component.scss']
})
export class ReverseParallaxComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    animate('.square', {
      translateY: [0, '-15rem'],
      rotate: '1turn',
      duration: 2000,
      direction: 'alternate',
      loop: true,
      easing: 'inOutQuad',
      autoplay: true
    });
  }
  }
