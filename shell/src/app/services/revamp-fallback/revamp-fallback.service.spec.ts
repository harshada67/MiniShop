import { RevampFallbackService } from './revamp-fallback.service';

describe('RevampFallbackService', () => {

  let service: RevampFallbackService;

  beforeEach(() => {

    service = new RevampFallbackService();

  });

  it('should create the service', () => {

    expect(service).toBeTruthy();

  });

});