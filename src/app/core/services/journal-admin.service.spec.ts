import { TestBed } from '@angular/core/testing';

import { JournalAdminService } from './journal-admin.service';

describe('JournalAdminService', () => {
  let service: JournalAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
