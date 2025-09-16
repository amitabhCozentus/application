import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppRoutes } from '../../lib/api-constant';

@Injectable({
  providedIn: 'root'
})
export class ReleaseManagementService {

  private http = inject(HttpClient);
 
  constructor() { }
 
  getNotes(requestBody: any, docType: string): Observable<any> {
    const params = new HttpParams().set('docType', docType);
    return this.http.post(AppRoutes.ReleaseManagement.GET_RELEASE_MANUAL_NOTES, requestBody, { params });
  }
 
  uploadDocument(
    file: File,
    docType: string,
    releaseUserManualName: string,
    releaseDate: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
 
    const params = new HttpParams()
      .set('docType', docType)
      .set('releaseUserManualName', releaseUserManualName)
      .set('releaseDate', releaseDate);
 
    return this.http.post(AppRoutes.ReleaseManagement.UPLOAD_DOCUMENT, formData, { params });
  }
 
  reuploadDocument(id: number, file: File): Observable<any> {
    const formData = new FormData();
  formData.append('file', file);
 
  return this.http.put(AppRoutes.ReleaseManagement.REUPLOAD_DOCUMENT(id), formData);
  }
 
  deleteDocument(
    id: number,
    docType: 'RELEASE_NOTE' | 'USER_MANUAL'
  ): Observable<void> {
    // Use the route helper and pass docType as a query param as well
 
    return this.http.delete<void>(AppRoutes.ReleaseManagement.DELETE_DOCUMENT(id, docType));
  }
 
  downloadDocument(id: number): Observable<any> {
    return this.http.get(AppRoutes.ReleaseManagement.DOWNLOAD_DOCUMENT(id));
  }
}

