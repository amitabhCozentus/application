import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SubscriptionCopyDialogComponent } from './subscription-copy-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SubscriptionCopyDialogComponent', () => {
  let component: SubscriptionCopyDialogComponent;
  let fixture: ComponentFixture<SubscriptionCopyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SubscriptionCopyDialogComponent,
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionCopyDialogComponent);
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
      subscriptionType: 'Premium',
      onBoardedOn: '',
      onBoardedSource: '',
      featureIds: [1]
    };
    component.features = [{ id: 1, name: 'F1', keyCode: 'f1' }];
    component.subscription = subscription;
    expect(component.subscriptionForm.get('customerName')?.value).toBe('Test');
    expect(component.featureStates[1]).toBeTrue();
    expect(component.assignedFeatureIds).toContain(1);
  });

  it('should toggle feature state', () => {
    component.featureStates[1] = false;
    component.toggleFeature(1);
    expect(component.featureStates[1]).toBeTrue();
  });

  it('should call updateCopySubscription on valid submit', () => {
    component.features = [{ id: 1, name: 'F1', keyCode: 'f1' }];
    component.featureStates = { 1: true };
    component.subscriptionForm.patchValue({
      customerName: 'Test',
      customerCode: '123',
      selectedCustomer: { companyCode: 456 }
    });
    spyOn(component['subscriptionService'], 'updateCopySubscription').and.returnValue(of({}));
    spyOn(component.onClose, 'emit');
    spyOn(component.onUpdateSuccess, 'emit');
    component.onUpdateSubmit();
    expect(component.onClose.emit).toHaveBeenCalled();
    expect(component.onUpdateSuccess.emit).toHaveBeenCalled();
  });
});
