import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionTierDialogComponent } from './subscription-tier-dialog.component';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SubscriptionTierDialogComponent', () => {
  let component: SubscriptionTierDialogComponent;
  let fixture: ComponentFixture<SubscriptionTierDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionTierDialogComponent,HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionTierDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
