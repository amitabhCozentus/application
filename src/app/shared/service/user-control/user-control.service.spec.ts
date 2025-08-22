import { TestBed } from '@angular/core/testing';
import { UserControlService } from './user-control.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserControlComponent } from 'src/app/pages/user-managment/user-control/user-control.component';

describe('UserControlService', () => {
  let service: UserControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,UserControlComponent],
      providers: [UserControlService] // only if not providedIn: 'root'

    });
    service = TestBed.inject(UserControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
