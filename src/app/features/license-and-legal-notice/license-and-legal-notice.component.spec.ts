import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseAndLegalNoticeComponent } from './license-and-legal-notice.component';

describe('LicenseAndLegalNoticeComponent', () => {
  let component: LicenseAndLegalNoticeComponent;
  let fixture: ComponentFixture<LicenseAndLegalNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseAndLegalNoticeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LicenseAndLegalNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
