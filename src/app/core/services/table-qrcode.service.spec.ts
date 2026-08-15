import { TestBed } from '@angular/core/testing';

import { TableQrcodeService } from './table-qrcode.service';

describe('TableQrcodeService', () => {
  let service: TableQrcodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableQrcodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
