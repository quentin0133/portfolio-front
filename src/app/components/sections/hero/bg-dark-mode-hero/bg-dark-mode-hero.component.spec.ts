import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BgDarkModeHeroComponent } from './bg-dark-mode-hero.component';

describe('BgDarkModeHeroComponent', () => {
  let component: BgDarkModeHeroComponent;
  let fixture: ComponentFixture<BgDarkModeHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BgDarkModeHeroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BgDarkModeHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
