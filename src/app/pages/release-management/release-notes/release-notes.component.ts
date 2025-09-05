import { Component } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RELEASE_NOTES_TABLE_HEADERS, TableHeaders } from '../../../shared/lib/constants';
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';
import { UploadDownloadDialogComponent } from '../../../shared/component/dialog/upload-download-dialog/upload-download-dialog.component';
import { UserManualComponent } from '../user-manual/user-manual.component';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-release-notes',
  imports: [PrimengModule, ReactiveFormsModule, FormsModule, CommonTableSearchComponent, UploadDownloadDialogComponent, UserManualComponent],
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent {

cols: TableHeaders[] = RELEASE_NOTES_TABLE_HEADERS;
showEditDialog: boolean = false;
selectedReleaseNote: any = null;
releaseNotes: any[] = [
  {
    releaseName: 'MMT Portal v2.1.0',
    releaseDate: '2025-08-15',
    uploadedBy: 'john.doe@bdpint.com',
    uploadedOn: '2025-08-15 10:30:00'
  },
  {
    releaseName: 'MMT Portal v2.0.5',
    releaseDate: '2025-08-01',
    uploadedBy: 'jane.smith@bdpint.com',
    uploadedOn: '2025-08-01 14:15:00'
  },
  {
    releaseName: 'MMT Portal v2.0.4',
    releaseDate: '2025-07-20',
    uploadedBy: 'mike.johnson@bdpint.com',
    uploadedOn: '2025-07-20 09:45:00'
  },
  {
    releaseName: 'MMT Portal v2.0.3',
    releaseDate: '2025-07-05',
    uploadedBy: 'sarah.wilson@bdpint.com',
    uploadedOn: '2025-07-05 16:20:00'
  },
  {
    releaseName: 'MMT Portal v2.0.2',
    releaseDate: '2025-06-25',
    uploadedBy: 'david.brown@bdpint.com',
    uploadedOn: '2025-06-25 11:10:00'
  },
  {
    releaseName: 'MMT Portal v2.0.1',
    releaseDate: '2025-06-10',
    uploadedBy: 'lisa.garcia@bdpint.com',
    uploadedOn: '2025-06-10 13:30:00'
  },
  {
    releaseName: 'MMT Portal v2.0.0',
    releaseDate: '2025-06-01',
    uploadedBy: 'admin@bdpint.com',
    uploadedOn: '2025-06-01 08:00:00'
  }
];
searchTerm: string = '';

constructor(private translate: TranslateService) {}


ngOnInit() {
  this.cols = [
    { field: 'releaseName', header: this.translate.instant('LBL.RELEASE_NAME'), sortable: true, filter: true },
    { field: 'releaseDate', header: this.translate.instant('LBL.RELEASE_DATE'), sortable: true, filter: true },
    { field: 'uploadedBy', header: this.translate.instant('LBL.UPLOADED_BY'), sortable: true, filter: true },
    { field: 'uploadedOn', header: this.translate.instant('LBL.UPLOADED_ON'), sortable: true, filter: true }
  ];
  this.onTabChange(0);
}
onSearch() {
  // Implement search functionality
  console.log('Searching for:', this.searchTerm);
}

resetSearch() {
  this.searchTerm = '';
  // Reset search results
  console.log('Search reset');
}

refresh() {
  // Implement refresh functionality
  console.log('Refreshing data');
}

openAddRoleDialog() {
  // Open dialog for adding new release notes
  this.selectedReleaseNote = null;
  this.showEditDialog = true;
}

editReleaseNotes(rowData: any) {
  this.selectedReleaseNote = { ...rowData }; 
  this.showEditDialog = true;
}

deleteReleaseNotes(rowData: any) {
}

onDialogClosed() {
  this.showEditDialog = false;
  this.selectedReleaseNote = null;
  console.log('Dialog closed');
}

onReleaseNoteUpdated(updatedData: any) {
  if (this.selectedReleaseNote) {
    const index = this.releaseNotes.findIndex(note => 
      note.releaseName === this.selectedReleaseNote.releaseName
    );
    if (index !== -1) {
      this.releaseNotes[index] = { ...this.releaseNotes[index], ...updatedData };
    }
  } else {
    this.releaseNotes.unshift(updatedData);
  }
  
  this.showEditDialog = false;
  this.selectedReleaseNote = null;
}





loadReleaseNotesData() {
}

activeTab: number = 0;


noteType: 'RELEASE_NOTE' | 'USER_MANUAL' = 'RELEASE_NOTE';  // <-- new property

onTabChange(index: number) {   // <-- index directly, not event.index
  this.activeTab = index;
  this.noteType = index === 1 ? 'USER_MANUAL' : 'RELEASE_NOTE'; // <-- update property
  console.log('Tab changed → index:', index, ' noteType:', this.noteType);
  this.showEditDialog = false; // Close dialog on tab change
}

}

