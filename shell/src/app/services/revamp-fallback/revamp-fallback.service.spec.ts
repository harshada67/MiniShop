import { TestBed } from '@angular/core/testing';

import { RevampFallbackService } from './revamp-fallback.service';

describe('RevampFallbackService', () => {
  let service: RevampFallbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevampFallbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
