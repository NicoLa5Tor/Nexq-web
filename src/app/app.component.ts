import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'nexq-ai';



  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private aos: AosService
  ) {}

  
  ngOnInit(): void {

  }
  
  ngAfterViewInit(): void {

    this.aos.init();

  }

}