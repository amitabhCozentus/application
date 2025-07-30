import { TestBed } from '@angular/core/testing';

import { TopbarsService } from './topbars.service';

describe('TopbarsService', () => {
  let service: TopbarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TopbarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
