import { TestBed } from '@angular/core/testing';

import { JournalActiviteService } from './journal-activite.service';

describe('JournalActiviteService', () => {
  let service: JournalActiviteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalActiviteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
