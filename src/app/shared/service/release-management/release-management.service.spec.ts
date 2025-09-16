import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ReleaseManagementService } from './release-management.service';
import { AppRoutes } from '../../lib/api-constant';

describe('ReleaseManagementService', () => {
  let service: ReleaseManagementService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'put', 'delete', 'get']);
    TestBed.configureTestingModule({
      providers: [
        ReleaseManagementService,
        { provide: HttpClient, useValue: httpClientSpy }
      ]
    });
    service = TestBed.inject(ReleaseManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getNotes with correct params', () => {
    const requestBody = { foo: 'bar' };
    const docType = 'USER_MANUAL';
    httpClientSpy.post.and.returnValue(of({}));
    service.getNotes(requestBody, docType).subscribe();
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      AppRoutes.ReleaseManagement.GET_RELEASE_MANUAL_NOTES,
      requestBody,
      jasmine.objectContaining({ params: jasmine.anything() })
    );
  });

  it('should call uploadDocument with correct params and formData', () => {
    const file = new File(['test'], 'test.txt');
    const docType = 'USER_MANUAL';
    const releaseUserManualName = 'manual';
    const releaseDate = '2024-01-01';
    httpClientSpy.post.and.returnValue(of({}));
    service.uploadDocument(file, docType, releaseUserManualName, releaseDate).subscribe();
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      AppRoutes.ReleaseManagement.UPLOAD_DOCUMENT,
      jasmine.any(FormData),
      jasmine.objectContaining({ params: jasmine.anything() })
    );
  });

  it('should call reuploadDocument with correct params and formData', () => {
    const id = 1;
    const file = new File(['test'], 'test.txt');
    httpClientSpy.put.and.returnValue(of({}));
    service.reuploadDocument(id, file).subscribe();
    expect(httpClientSpy.put).toHaveBeenCalledWith(
      AppRoutes.ReleaseManagement.REUPLOAD_DOCUMENT(id),
      jasmine.any(FormData)
    );
  });

  it('should call deleteDocument with correct params', () => {
    const id = 1;
    const docType = 'RELEASE_NOTE';
    httpClientSpy.delete.and.returnValue(of({}));
    service.deleteDocument(id, docType as any).subscribe();
    expect(httpClientSpy.delete).toHaveBeenCalledWith(
      AppRoutes.ReleaseManagement.DELETE_DOCUMENT(id, docType)
    );
  });

  it('should call downloadDocument with correct params', () => {
    const id = 1;
    httpClientSpy.get.and.returnValue(of({}));
    service.downloadDocument(id).subscribe();
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      AppRoutes.ReleaseManagement.DOWNLOAD_DOCUMENT(id)
    );
  });
});
