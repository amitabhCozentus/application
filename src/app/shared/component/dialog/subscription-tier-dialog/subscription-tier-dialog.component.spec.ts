import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

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

  it('should emit onClose when dialog is closed', () => {
    spyOn(component.onClose, 'emit');
    component.onCloseDialog();
    expect(component.onClose.emit).toHaveBeenCalled();
  });

  it('should emit onSave and onClose on valid save', () => {
    component.selectedRows = [{ customerCode: '123' }];
    component.subscriptionTier = [{ id: 1, name: 'Standard', configType: 'SUBSCRIPTION_TYPE' }];
    component.selectedTier = 'Standard';
    spyOn(component['subscriptionService'], 'bulkUpdateSubscriptionTier').and.returnValue(of({}));
    spyOn(component.onSave, 'emit');
    spyOn(component.onClose, 'emit');
    component.onSaveDialog();
    expect(component.onSave.emit).toHaveBeenCalled();
    expect(component.onClose.emit).toHaveBeenCalled();
  });

  it('should show error if no tier selected', () => {
    component.selectedRows = [{ customerCode: '123' }];
    component.subscriptionTier = [];
    component.selectedTier = null;
    spyOn(component['messageService'], 'add');
    component.onSaveDialog();
    expect(component['messageService'].add).toHaveBeenCalled();
  });
});
