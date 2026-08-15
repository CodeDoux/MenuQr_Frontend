import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaasLayoutComponent } from './saas-layout.component';

describe('SaasLayoutComponent', () => {
  let component: SaasLayoutComponent;
  let fixture: ComponentFixture<SaasLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaasLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaasLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
