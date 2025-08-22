import { TestBed } from '@angular/core/testing';
import { RoleService } from './role.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoleControlComponent } from 'src/app/pages/role-management/role-control/role-control.component';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RoleControlComponent
      ],
      providers: [RoleService]
    }).compileComponents();
    service = TestBed.inject(RoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
