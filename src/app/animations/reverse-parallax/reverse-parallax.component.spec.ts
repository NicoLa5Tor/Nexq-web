import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReverseParallaxComponent } from './reverse-parallax.component';

describe('ReverseParallaxComponent', () => {
  let component: ReverseParallaxComponent;
  let fixture: ComponentFixture<ReverseParallaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReverseParallaxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReverseParallaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
