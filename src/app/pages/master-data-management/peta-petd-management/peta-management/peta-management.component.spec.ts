import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetaManagementComponent } from './peta-management.component';

describe('PetaManagementComponent', () => {
  let component: PetaManagementComponent;
  let fixture: ComponentFixture<PetaManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetaManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetaManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
