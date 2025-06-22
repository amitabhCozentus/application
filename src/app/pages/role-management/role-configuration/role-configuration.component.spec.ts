import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleConfigurationComponent } from './role-configuration.component';

describe('RoleConfigurationComponent', () => {
  let component: RoleConfigurationComponent;
  let fixture: ComponentFixture<RoleConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
