import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalAdminComponent } from './journal-admin.component';

describe('JournalAdminComponent', () => {
  let component: JournalAdminComponent;
  let fixture: ComponentFixture<JournalAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
