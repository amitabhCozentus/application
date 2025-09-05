import { Component, inject } from '@angular/core';
import { PrimengModule } from "../../../../shared/primeng/primeng.module";
import { USER_MANUAL_TABLE_HEADERS, TableHeaders, ReleaseNoteData, toPagedResult } from "../../../../shared/lib/constants";
import { CommonTableSearchComponent } from '../../../../shared/component/table-search/common-table-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReleaseManagementService } from 'src/app/shared/service/release-management/release-management.service';
import { UploadDownloadDialogComponent } from 'src/app/shared/component/dialog/upload-download-dialog/upload-download-dialog.component';

@Component({
  selector: 'app-user-manual',
  imports: [PrimengModule, CommonTableSearchComponent, FormsModule, ReactiveFormsModule,UploadDownloadDialogComponent],
  templateUrl: './user-manual.component.html',
  styleUrl: './user-manual.component.scss'
})
export class UserManualComponent {
   cols: TableHeaders[] = USER_MANUAL_TABLE_HEADERS;
  UserManual: ReleaseNoteData[] = [];

  userManualService = inject(ReleaseManagementService);
  searchTerm: string = '';

//  State for dialog
  showEditDialog = false;
  selectedReleaseNote: ReleaseNoteData | null = null;
  noteType: 'USER_MANUAL' = 'USER_MANUAL';

  ngOnInit() {
    this.loadUserManualData();
  }

  onSearch() {
    this.loadUserManualData();
  }

  resetSearch() {
    this.searchTerm = '';
    this.loadUserManualData();
  }

  refresh() {
    this.loadUserManualData();
  }

  openAddRoleDialog() {
    this.selectedReleaseNote = null;
    this.showEditDialog = true;
  }

 deleteManual(rowData: any) {
  if (!rowData?.id) {
    console.error('No ID found for rowData:', rowData);
    return;
  }

  if (confirm(`Are you sure you want to delete "${rowData.manualName || rowData.fileName}"?`)) {
    this.userManualService.deleteDocument(rowData.id, 'USER_MANUAL').subscribe({
      next: () => {
        // ✅ Remove from UI list after success
        this.UserManual = this.UserManual.filter(m => m.id !== rowData.id);
        console.log('User manual deleted successfully:', rowData.id);
      },
      error: (err) => {
        console.error('Failed to delete user manual:', err);
      }
    });
  }
}


  onDialogClosed() {
    this.showEditDialog = false;
    this.selectedReleaseNote = null;
    console.log('User manual dialog closed');
  }

  onUserManualUpdated(updatedData: ReleaseNoteData) {
    if (this.selectedReleaseNote) {
      const index = this.UserManual.findIndex(m => m.id === this.selectedReleaseNote?.id);
      if (index !== -1) {
        this.UserManual[index] = { ...this.UserManual[index], ...updatedData };
      }
    } else {
      this.UserManual.unshift(updatedData);
    }
    this.showEditDialog = false;
    this.selectedReleaseNote = null;
    console.log('User manual updated:', updatedData);
  }

  loadUserManualData() {
    this.userManualService.getDocuments('USER_MANUAL', 0, 50, this.searchTerm).subscribe({
      next: (res) => {
        const result = toPagedResult<ReleaseNoteData>(res);
        this.UserManual = result.data.map(item => ({
          ...item,
          manualName: item.fileName   //  map backend → UI name has been changed 
        }));
        console.log('User manuals loaded:', this.UserManual);
      },
      error: (err) => console.error('Failed to load user manuals:', err)
    });
  }
}