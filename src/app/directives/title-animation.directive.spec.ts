import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TitleAnimationDirective } from './title-animation.directive';

@Component({
  template: `<h2 titleAnimation titleText="Hello"></h2>`,
  standalone: true,
  imports: [TitleAnimationDirective]
})
class TestHostComponent {}

describe('TitleAnimationDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = fixture.debugElement.query(By.directive(TitleAnimationDirective));
    expect(directive).not.toBeNull();
  });
});
