import { Directive, ElementRef, AfterViewInit, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[titleAnimation]',
  standalone: true
})
export class TitleAnimationDirective implements AfterViewInit {
  @Input() titleText: string = '';
  
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  
  ngAfterViewInit() {
    setTimeout(() => this.initAnimation(), 100);
  }
  
  private initAnimation() {
    const element = this.el.nativeElement;
    const text = this.titleText || element.textContent;
    
    if (!text) return;
    
    // Guardamos las clases originales del elemento
    const originalClassList = [...element.classList];
    
    // Limpiamos el elemento
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    
    // Creamos un contenedor para el texto animado
    const container = this.renderer.createElement('span');
    this.renderer.addClass(container, 'animated-text-container');
    
    // Creamos un span para cada letra
    [...text].forEach((char, index) => {
      const span = this.renderer.createElement('span');
      const textNode = this.renderer.createText(char);
      
      // Añadimos clase para la animación
      this.renderer.addClass(span, 'animated-letter');
      
      // Establecemos el delay basado en el índice
      this.renderer.setStyle(span, 'animation-delay', `${index * 0.05}s`);
      
      // Agregamos la letra al span y el span al contenedor
      this.renderer.appendChild(span, textNode);
      this.renderer.appendChild(container, span);
    });
    
    // Agregamos el contenedor al elemento original
    this.renderer.appendChild(element, container);
  }
}