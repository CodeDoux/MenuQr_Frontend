import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosteFormComponent } from './poste-form.component';

describe('PosteFormComponent', () => {
  let component: PosteFormComponent;
  let fixture: ComponentFixture<PosteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
