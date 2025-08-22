import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
