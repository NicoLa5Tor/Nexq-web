import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesOverviewComponent } from './services-overview.component';

describe('ServicesOverviewComponent', () => {
  let component: ServicesOverviewComponent;
  let fixture: ComponentFixture<ServicesOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServicesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
