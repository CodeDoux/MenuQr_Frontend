import { TestBed } from '@angular/core/testing';

import { PublicOrderService } from './public-order.service';

describe('PublicOrderService', () => {
  let service: PublicOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
