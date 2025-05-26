import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BgAboutMeComponent } from './bg-about-me.component';

describe('BgContactComponent', () => {
  let component: BgAboutMeComponent;
  let fixture: ComponentFixture<BgAboutMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BgAboutMeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BgAboutMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
