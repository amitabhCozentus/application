import { TestBed } from '@angular/core/testing';

import { PetaService } from './peta.service';

describe('PetaService', () => {
  let service: PetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PetaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
