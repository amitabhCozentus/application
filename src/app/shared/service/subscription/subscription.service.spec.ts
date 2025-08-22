import { TestBed } from '@angular/core/testing';
import { SubscriptionService } from './subscription.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();
    service = TestBed.inject(SubscriptionService);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});