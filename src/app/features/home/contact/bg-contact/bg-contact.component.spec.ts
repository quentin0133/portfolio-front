import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BgContactComponent } from './bg-contact.component';

describe('BgContactComponent', () => {
  let component: BgContactComponent;
  let fixture: ComponentFixture<BgContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BgContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BgContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
