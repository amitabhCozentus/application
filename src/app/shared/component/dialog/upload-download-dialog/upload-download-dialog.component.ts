import { Component, Input, Output, EventEmitter, OnInit, OnChanges, Signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PrimengModule } from '../../../primeng/primeng.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReleaseManagementService  } from '../../../service/release-management/release-management.service';
import { ReleaseNoteData } from 'src/app/shared/lib/constants';
@Component({
  selector: 'app-upload-download-dialog',
  imports: [PrimengModule, ReactiveFormsModule, FormsModule, NgxDropzoneModule],
  templateUrl: './upload-download-dialog.component.html',
  styleUrl: './upload-download-dialog.component.scss'
})
export class UploadDownloadDialogComponent implements OnInit, OnChanges {
   @Input() uploadDialogVisible: boolean = true;
  @Input() editMode: boolean = false;
  @Input() selectedReleaseNote: ReleaseNoteData | null = null;

  @Output() dialogClosed = new EventEmitter<void>();
  @Output() releaseNoteUpdated = new EventEmitter<ReleaseNoteData>();
  @Output() userManualUpdated = new EventEmitter<any>();  
  @Input() noteType: 'RELEASE_NOTE' | 'USER_MANUAL' = 'RELEASE_NOTE';
  uploadForm: FormGroup;
  files: File[] = [];

  errorMessage: string = '';

  // ✅ readonly signal for upload result
  uploadedNote?: Signal<ReleaseNoteData | null>;

  constructor(
    private formBuilder: FormBuilder,
    private releaseService: ReleaseManagementService
  ) {
    this.uploadForm = this.formBuilder.group({
      releaseName: ['', Validators.required],
      releaseNotesDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges() {
    this.initializeForm();
  }

  initializeForm() {
    if (this.editMode && this.selectedReleaseNote) {
      this.uploadForm.patchValue({
        releaseName: this.selectedReleaseNote.noteType,
        releaseNotesDate: new Date(this.selectedReleaseNote.dateOfReleaseNote)
      });
    } else {
      this.uploadForm.reset();
      this.files = [];
    }
  }

  //pdf ornot check
  
onSubmit() {
  if (this.uploadForm.valid && this.files.length > 0) {
    const file = this.files[0];

    if (this.editMode && this.selectedReleaseNote?.id) {
      // 🔄 Re-upload API call (only runs in edit mode)
      this.releaseService.reuploadDocument(this.selectedReleaseNote.id, file).subscribe({
        next: (result: ReleaseNoteData) => {
          if (this.noteType === 'RELEASE_NOTE') {
            this.releaseNoteUpdated.emit(result);
          } else {
            this.userManualUpdated.emit(result);
          }
          this.closeDialog();
        },
        error: err => {
          this.errorMessage = 'Re-upload failed. Please try again.';
        }
      });

    } else {
      // 🆕 Your existing Upload API code (unchanged)
      const docType = this.noteType;
      const releaseUserManualName = this.uploadForm.value.releaseName;
      const releaseDate = this.uploadForm.value.releaseNotesDate
        .toISOString()
        .split('T')[0];

      this.releaseService.uploadDocument(
        file,
        docType,
        releaseUserManualName,
        releaseDate,
        this.noteType
      ).subscribe({
        next: (result: ReleaseNoteData | null) => {
          if (result) {
            if (this.noteType === 'RELEASE_NOTE') {
              this.releaseNoteUpdated.emit(result);
            } else {
              this.userManualUpdated.emit(result);
            }
            this.closeDialog();
          }
        },
        error: err => {
          if (err?.status === 409) {
            this.errorMessage =
              'A manual with the same name exists, but the new version could not replace it. Please try again or rename the file.';
          } else {
            this.errorMessage =
              'Upload failed. Please try again or contact your system administrator.';
          }
        }
      });
    }
  } else {
    console.log('Form is invalid or no file selected');
    this.markFormGroupTouched();
  }
}



  closeDialog() {
    this.dialogClosed.emit();
      this.errorMessage = '';

  }

  uploadFile() {
    this.onSubmit();
  }

  onChoosingFile(event: any) {
    if (event.addedFiles?.length > 0) {
    const file = event.addedFiles[0];
    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Invalid file type. Only PDF files are supported.';
      this.files = [];
    } else {
      this.errorMessage = '';
      this.files = [file];
    }
  }
  }

  onRemove(file: File) {
    const idx = this.files.indexOf(file);
    if (idx > -1) {
      this.files.splice(idx, 1);
    }
    this.errorMessage = '';
  }

  private markFormGroupTouched() {
    Object.keys(this.uploadForm.controls).forEach(key => {
      const control = this.uploadForm.get(key);
      control?.markAsTouched();
    });
  }
}