import { Component } from '@angular/core';
import { PrimengModule } from "../../../shared/primeng/primeng.module";
import { USER_MANUAL_TABLE_HEADERS, TableHeaders } from "../../../shared/lib/constants";
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-manual',
  imports: [PrimengModule, CommonTableSearchComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './user-manual.component.html',
  styleUrl: './user-manual.component.scss'
})
export class UserManualComponent {
  cols: TableHeaders[] = USER_MANUAL_TABLE_HEADERS;
  UserManual: any[] = [
    {
      manualName: 'MMT Portal User Guide v2.1.0',
      updatedOn: '2025-08-15 11:00:00',
      uploadedBy: 'admin@bdpint.com',
      uploadedOn: '2025-08-15 11:00:00'
    },
    {
      manualName: 'Release Management Guide v2.0',
      updatedOn: '2025-08-10 14:30:00',
      uploadedBy: 'john.doe@bdpint.com',
      uploadedOn: '2025-08-10 14:30:00'
    },
    {
      manualName: 'User Management Manual v1.5',
      updatedOn: '2025-08-05 09:15:00',
      uploadedBy: 'jane.smith@bdpint.com',
      uploadedOn: '2025-08-05 09:15:00'
    },
    {
      manualName: 'Subscription Management Guide v1.3',
      updatedOn: '2025-07-28 16:45:00',
      uploadedBy: 'mike.johnson@bdpint.com',
      uploadedOn: '2025-07-28 16:45:00'
    },
    {
      manualName: 'Role Configuration Manual v1.2',
      updatedOn: '2025-07-20 13:20:00',
      uploadedBy: 'sarah.wilson@bdpint.com',
      uploadedOn: '2025-07-20 13:20:00'
    },
    {
      manualName: 'Quick Start Guide v1.0',
      updatedOn: '2025-07-15 10:00:00',
      uploadedBy: 'david.brown@bdpint.com',
      uploadedOn: '2025-07-15 10:00:00'
    }
  ];
  searchTerm: string = '';

  onSearch() {
    // Implement search functionality
    console.log('Searching user manuals for:', this.searchTerm);
  }

  resetSearch() {
    this.searchTerm = '';
    console.log('User manual search reset');
  }

  refresh() {
    // Implement refresh functionality
    console.log('Refreshing user manual data');
  }

  openAddRoleDialog() {
    // Implement add manual dialog functionality
    console.log('Opening upload user manual dialog');
  }

  deleteManual(rowData: any) {
    // Implement delete functionality
    console.log('Deleting user manual:', rowData);
  }

}
