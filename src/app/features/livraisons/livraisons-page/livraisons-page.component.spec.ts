import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisonsPageComponent } from './livraisons-page.component';

describe('LivraisonsPageComponent', () => {
  let component: LivraisonsPageComponent;
  let fixture: ComponentFixture<LivraisonsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivraisonsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivraisonsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
