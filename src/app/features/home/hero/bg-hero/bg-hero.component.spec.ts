import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BgHeroComponent } from './bg-hero.component';

describe('BgDarkModeHeroComponent', () => {
  let component: BgHeroComponent;
  let fixture: ComponentFixture<BgHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BgHeroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BgHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
