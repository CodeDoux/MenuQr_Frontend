import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffreManagementComponent } from './offre-management.component';

describe('OffreManagementComponent', () => {
  let component: OffreManagementComponent;
  let fixture: ComponentFixture<OffreManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffreManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffreManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
