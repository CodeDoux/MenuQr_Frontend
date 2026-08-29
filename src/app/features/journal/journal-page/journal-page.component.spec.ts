import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalPageComponent } from './journal-page.component';

describe('JournalPageComponent', () => {
  let component: JournalPageComponent;
  let fixture: ComponentFixture<JournalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
