import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionPrintComponent } from './addition-print.component';

describe('AdditionPrintComponent', () => {
  let component: AdditionPrintComponent;
  let fixture: ComponentFixture<AdditionPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionPrintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
