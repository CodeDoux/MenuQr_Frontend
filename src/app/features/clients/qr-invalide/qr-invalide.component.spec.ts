import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrInvalideComponent } from './qr-invalide.component';

describe('QrInvalideComponent', () => {
  let component: QrInvalideComponent;
  let fixture: ComponentFixture<QrInvalideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrInvalideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrInvalideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
