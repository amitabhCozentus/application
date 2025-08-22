import { TestBed } from '@angular/core/testing';
import { TopbarsService } from './topbars.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TopbarsService', () => {
  let service: TopbarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TopbarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
