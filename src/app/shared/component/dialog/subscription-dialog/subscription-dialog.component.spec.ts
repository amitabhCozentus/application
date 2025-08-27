import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { SubscriptionDialogComponent } from './subscription-dialog.component';

describe('SubscriptionDialogComponent', () => {
  let component: SubscriptionDialogComponent;
  let fixture: ComponentFixture<SubscriptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SubscriptionDialogComponent,
        HttpClientTestingModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form and feature states on subscription input', () => {
    const subscription = {
      customerName: 'Test',
      customerCode: '123',
      subscriptionTypeName: 'Premium',
      onBoardedOn: '',
      onBoardedSource: '',
      featureIds: [1]
    };
    component.features = [{ id: 1, name: 'F1', keyCode: 'f1' }];
    component.subscription = subscription;
    expect(component.subscriptionForm.get('customerName')?.value).toBe('Test');
    expect(component.featureStates[1]).toBeTrue();
  });

  it('should toggle feature state', () => {
    component.featureStates[1] = false;
    component.toggleFeature(1);
    expect(component.featureStates[1]).toBeTrue();
  });

  it('should call updateCustomerSubscriptionList on valid submit', () => {
    component.features = [{ id: 1, name: 'F1', keyCode: 'f1' }];
    component.subscriptionTier = [{ id: 2, name: 'Premium', configType: 'SUBSCRIPTION_TYPE' }];
    component.featureStates = { 1: true };
    component.subscriptionForm.patchValue({
      customerName: 'Test',
      customerCode: '123',
      subscriptionTypeName: 'Premium'
    });
    spyOn(component['subscriptionService'], 'updateCustomerSubscriptionList').and.returnValue(of({}));
    spyOn(component.onClose, 'emit');
    spyOn(component.onUpdateSuccess, 'emit');
    component.onUpdateSubmit();
    expect(component.onClose.emit).toHaveBeenCalled();
    expect(component.onUpdateSuccess.emit).toHaveBeenCalled();
  });
});
