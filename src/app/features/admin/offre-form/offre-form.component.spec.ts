import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffreFormComponent } from './offre-form.component';

describe('OffreFormComponent', () => {
  let component: OffreFormComponent;
  let fixture: ComponentFixture<OffreFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffreFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffreFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
