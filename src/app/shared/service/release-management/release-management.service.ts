import { inject, Injectable } from '@angular/core';
import { ApiRequestPayload, ApiResponse, ReleaseNoteData, ReleaseUploadResponse } from '../../lib/constants';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';




@Injectable({
  providedIn: 'root'
})
export class ReleaseManagementService {
private baseUrl = 'http://localhost:8080/api/v1/releases';  

  constructor() {}

      private http = inject(HttpClient);
uploadDocument(
  file: File,
  docType: string,
  releaseUserManualName: string,
  releaseDate: string,
  noteType: 'RELEASE_NOTE' | 'USER_MANUAL' // <-- Add this parameter
): Observable<ReleaseNoteData | null> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const params = new HttpParams()
    .set('docType', docType)
    .set('releaseUserManualName', releaseUserManualName)
    .set('releaseDate', releaseDate)
    .set('noteType', noteType); // <-- Add this

  return this.http
    .post<ReleaseUploadResponse<ReleaseNoteData>>(
      `${this.baseUrl}/upload`,
      formData,
      { params }
    )
    .pipe(
      map(res => (res.success && res.data ? res.data : null))
    );
}

 getDocuments(
    docType: 'RELEASE_NOTE' | 'USER_MANUAL',
    page = 0,
    size = 50,
    searchText: string = ''
  ): Observable<ApiResponse<ReleaseNoteData>> {
    const params = new HttpParams().set('docType', docType);

    const body: ApiRequestPayload = {
      pagination: { page, size },
      searchFilter: { searchText },
      columns: []
    };

    return this.http.post<ApiResponse<ReleaseNoteData>>(`${this.baseUrl}/release-manual-notes`, body, { params });
  }

  //Reupload or edit
  reuploadDocument(
  id: number,
  file: File
): Observable<ReleaseNoteData> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.put<ReleaseNoteData>(
    `${this.baseUrl}/${id}/re-upload`,
    formData
  );
}

//Delete 
deleteDocument(
  id: number,
  docType: 'RELEASE_NOTE' | 'USER_MANUAL'
): Observable<void> {
  return this.http.delete<void>(
    `${this.baseUrl}/${id}/${docType}`,
    { params: { docType } }
  );
}

//Downloadable hyperlink
// Download document (Release Note or User Manual)
downloadDocument(
  id: number,
  docType: 'RELEASE_NOTE' | 'USER_MANUAL'
): Observable<{ success: boolean; message: string; data: string }> {
  return this.http.get<{ success: boolean; message: string; data: string }>(
    `${this.baseUrl}/${id}`
  );
}


}