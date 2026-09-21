import { TestBed } from '@angular/core/testing';

import { CmsContentService } from './cms-content.service';

describe('CmsContentService', () => {
  let service: CmsContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CmsContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
