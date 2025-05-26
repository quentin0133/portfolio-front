import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BgProjectsComponent } from './bg-projects.component';

describe('BgProjectsComponent', () => {
  let component: BgProjectsComponent;
  let fixture: ComponentFixture<BgProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BgProjectsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BgProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
