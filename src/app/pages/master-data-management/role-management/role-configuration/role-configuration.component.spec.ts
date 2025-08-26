import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { RoleConfigurationComponent } from './role-configuration.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastComponent } from 'src/app/shared/component/toast-component/toast.component';
import { MessageService } from 'primeng/api';

describe('RoleConfigurationComponent', () => {
  let component: RoleConfigurationComponent;
  let fixture: ComponentFixture<RoleConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RoleConfigurationComponent,
        ToastComponent,
      
      ],
      providers: [
  MessageService 
],
      schemas: [NO_ERRORS_SCHEMA]
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
