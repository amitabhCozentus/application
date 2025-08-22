import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SubscriptionTierDialogComponent } from './subscription-tier-dialog.component';

describe('SubscriptionTierDialogComponent', () => {
  let component: SubscriptionTierDialogComponent;
  let fixture: ComponentFixture<SubscriptionTierDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SubscriptionTierDialogComponent,
        HttpClientTestingModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
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
