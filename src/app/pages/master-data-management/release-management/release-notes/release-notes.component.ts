import { Component } from '@angular/core';
import { PrimengModule } from '../../../../shared/primeng/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RELEASE_NOTES_TABLE_HEADERS, ReleaseNoteData, TableHeaders, toPagedResult } from '../../../../shared/lib/constants';
import { CommonTableSearchComponent } from '../../../../shared/component/table-search/common-table-search.component';
import { UploadDownloadDialogComponent } from '../../../../shared/component/dialog/upload-download-dialog/upload-download-dialog.component';
import { UserManualComponent } from '../user-manual/user-manual.component';
import { ReleaseManagementService } from 'src/app/shared/service/release-management/release-management.service';


@Component({
  selector: 'app-release-notes',
  imports: [PrimengModule, ReactiveFormsModule, FormsModule, CommonTableSearchComponent, UploadDownloadDialogComponent, UserManualComponent],
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent {

cols: TableHeaders[] = RELEASE_NOTES_TABLE_HEADERS;
showEditDialog: boolean = false;
selectedReleaseNote: ReleaseNoteData | null = null;
  releaseNotes: ReleaseNoteData[] = [];
searchTerm: string = '';

constructor(private releaseService: ReleaseManagementService) {}

ngOnInit() {
  this.loadReleaseNotesData();
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

onReleaseNoteUpdated(updatedData: ReleaseNoteData) {
    if (this.selectedReleaseNote) {
      const index = this.releaseNotes.findIndex(note => note.id === this.selectedReleaseNote?.id);
      if (index !== -1) {
        this.releaseNotes[index] = { ...this.releaseNotes[index], ...updatedData };
      }
    } else {
      this.releaseNotes.unshift(updatedData);
    }
    this.showEditDialog = false;
    this.selectedReleaseNote = null;
  }

onTabChange(event: any) {

  if (event.index === 1) {
    //this.loadUserManualData();
  } else if (event.index === 0) {
    this.loadReleaseNotesData();
  }
}


loadReleaseNotesData() {
  this.releaseService.getDocuments('RELEASE_NOTE', 0, 50, this.searchTerm).subscribe({
    next: (res) => {
      const result = toPagedResult<ReleaseNoteData>(res); 
      this.releaseNotes = result.data;
      console.log('Release notes loaded:', this.releaseNotes);
    },
    error: (err) => console.error('Failed to load release notes:', err)
  });
}

downloadReleaseNotes(rowData: any) {
  if (!rowData?.id) {
    console.error('No ID found for download:', rowData);
    return;
  }

  this.releaseService.downloadDocument(rowData.id, 'RELEASE_NOTE').subscribe({
    next: (res) => {
      if (res?.data) {
        const fileUrl = res.data; // backend returns stored URL
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = rowData.fileName || 'release-note.pdf';
        a.click();
      }
    },
    error: (err) => console.error('Failed to download release note:', err)
  });
}


  }


