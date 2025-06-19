import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserControlService {

    private existingUsertableHeaders: any[] = [
        { field: 'userName', header: 'Name' },
        { field: 'userId', header: 'User Email Id' },
        { field: 'companies', header: 'Company Name' },
        { field: 'roleGranted', header: 'Role Granted' }
      ];
      private pendingUsertableHeaders: any[] = [ 
        { field: 'userName', header: 'Name' },
        { field: 'userId', header: 'User Email Id' },
        { field: 'companies', header: 'Company Name' },
        { field: 'roleGranted', header: 'Role Granted' }
      ];





  getTableHeaders(activeIndex: any) {
    if (activeIndex)
      return this.existingUsertableHeaders
    else
      return this.pendingUsertableHeaders
  }

  constructor() { }
}
