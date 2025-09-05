import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserConfigurationService, UserAssignmentPayload } from './user-configuration.service';
import { AdminEndPoint } from '../../lib/api-constant';
import { ApiResponseWithoutContent } from '../../lib/constants';

describe('UserConfigurationService', () => {
  let service: UserConfigurationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserConfigurationService]
    });
    service = TestBed.inject(UserConfigurationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call updateCopySubscription with correct params', () => {
    const payload: UserAssignmentPayload = {
      roleId: 1,
      isBdpEmployee: true,
      assignedCompanies: [{ companyCode: 'C1', companyName: 'Company 1' }]
    };
    const userId = '123';
    service.updateCopySubscription(payload, userId).subscribe();
    const req = httpMock.expectOne(
      r => r.url === AdminEndPoint.UserManagement.SAVE_UPDATE_USER_ROLE && r.method === 'PUT'
    );
    expect(req.request.params.get('userId')).toBe(userId);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('should call getUserAssignedCompanies with correct params', () => {
    const userId = '456';
    service.getUserAssignedCompanies(userId).subscribe((res: ApiResponseWithoutContent) => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne(
      r => r.url === AdminEndPoint.UserManagement.GET_USER_ASSIGNED_COMPANIES && r.method === 'GET'
    );
    expect(req.request.params.get('userId')).toBe(userId);
    req.flush({});
  });
});
