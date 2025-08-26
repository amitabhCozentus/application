import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscriptionComponent } from './subscription.component';
import { SubscriptionService } from 'src/app/shared/service/subscription/subscription.service';
import { HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('SubscriptionComponent', () => {
  let component: SubscriptionComponent;
  let fixture: ComponentFixture<SubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SubscriptionComponent,   
        HttpClientTestingModule,
        TranslateModule.forRoot()  
      ],
      providers: [
        SubscriptionService      
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
