import { Component, Input, Output, EventEmitter, OnInit, OnChanges, Signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PrimengModule } from '../../../primeng/primeng.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReleaseManagementService } from '../../../service/release-management/release-management.service';
import { ToastComponent } from '../../toast-component/toast.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-upload-download-dialog',
  imports: [PrimengModule, ReactiveFormsModule, FormsModule, NgxDropzoneModule, ToastComponent],
  templateUrl: './upload-download-dialog.component.html',
  styleUrl: './upload-download-dialog.component.scss'
})
export class UploadDownloadDialogComponent implements OnInit, OnChanges {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  
  @Input() uploadDialogVisible: boolean = true;
  @Input() editMode: boolean = false; // default to false, so dialog is always in upload mode unless explicitly set
  @Input() selectedReleaseNote: any | null = null;

  @Output() dialogClosed = new EventEmitter<void>();
  @Output() releaseNoteUpdated = new EventEmitter<any>();
  @Output() userManualUpdated = new EventEmitter<any>();
  @Input() noteType: 'RELEASE_NOTE' | 'USER_MANUAL' = 'RELEASE_NOTE'; // Must be set by parent
  get releaseNameLabel() {
    return this.noteType === 'USER_MANUAL' ? 'Manual Name' : 'Release Name';
  }
  get releaseDateLabel() {
    return this.noteType === 'USER_MANUAL' ? 'Manual Date' : 'Release Note Date';
  }
  uploadForm: FormGroup;
  files: File[] = [];
  // tracks whether the server returned success for the current file
  uploadSuccess: boolean = false;

  // Options for user manual names (SelectItem format for p-dropdown)
  manualOptions: { label: string; value: string }[] = [
    { label: 'Customer Manual', value: 'Customer Manual' },
    { label: 'PSA BDP Manual', value: 'PSA BDP Manual' },
    { label: 'BNS Manual', value: 'BNS Manual' }
  ];

  errorMessage: string = '';

  // ✅ readonly signal for upload result
  uploadedNote?: Signal<any | null>;

  constructor(
    private formBuilder: FormBuilder,
    private releaseService: ReleaseManagementService
    , private translateService: TranslateService
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
        releaseName: this.selectedReleaseNote.releaseUserManualName,
        releaseNotesDate: new Date(this.selectedReleaseNote.dateOfReleaseNote)
      });
  // make fields readonly in re-upload/edit mode
  this.uploadForm.get('releaseName')?.disable();
  this.uploadForm.get('releaseNotesDate')?.disable();
    } else {
      this.uploadForm.reset();
      this.files = [];
  this.uploadSuccess = false;
  // ensure controls are enabled
  this.uploadForm.get('releaseName')?.enable();
  this.uploadForm.get('releaseNotesDate')?.enable();
    }
  }

  //pdf ornot check

  onSubmit() {
    if (this.uploadForm.valid && this.files.length > 0) {
      const file = this.files[0];
      // Ensure docType is always set and valid
      const docType = this.noteType === 'USER_MANUAL' ? 'USER_MANUAL' : 'RELEASE_NOTE';
      if (this.editMode && this.selectedReleaseNote?.id) {
        this.releaseService.reuploadDocument(this.selectedReleaseNote.id, file).subscribe({
          next: (result: any) => {
            if (docType === 'RELEASE_NOTE') {
              this.releaseNoteUpdated.emit(result);
            } else {
              this.userManualUpdated.emit(result);
            }
            // show toast via ViewChild reference
            this.toastComponent.showSuccess(this.translateService.instant('LBL.UPLOAD.SUCCESS'));
            this.uploadSuccess = true;
          },
          error: err => {
            const msg = err?.status === 409 ? this.translateService.instant('LBL.UPLOAD.FILE_EXISTS') : this.translateService.instant('LBL.UPLOAD.INVALID_TYPE');
            this.toastComponent.showError(msg);
          }
        });
      } else {
        const releaseUserManualName = this.uploadForm.value.releaseName;
        const releaseDate = this.uploadForm.value.releaseNotesDate
          .toISOString()
          .split('T')[0];
        this.releaseService.uploadDocument(
          file,
          docType,
          releaseUserManualName,
          releaseDate
        ).subscribe({
          next: (result: any | null) => {
            if (result) {
              if (docType === 'RELEASE_NOTE') {
                this.releaseNoteUpdated.emit(result);
              } else {
                this.userManualUpdated.emit(result);
              }
              // Show toast via ViewChild reference
              this.toastComponent.showSuccess(this.translateService.instant('LBL.UPLOAD.SUCCESS'));
              this.uploadSuccess = true;
            }
          },
          error: err => {
            const msg = err?.status === 409
              ? this.translateService.instant('LBL.UPLOAD.FILE_EXISTS')
              : this.translateService.instant('LBL.UPLOAD.INVALID_TYPE');
            this.toastComponent.showError(msg);
          }
        });
      }
    } else {
      console.log('Form is invalid or no file selected');
      this.markFormGroupTouched();
    }
  }



  closeDialog() {
  // Discard all entered data
  this.uploadForm.reset();
  this.files = [];
  this.uploadSuccess = false;
  this.errorMessage = '';
  // ensure controls enabled
  this.uploadForm.get('releaseName')?.enable();
  this.uploadForm.get('releaseNotesDate')?.enable();
  this.dialogClosed.emit();

  }

  uploadFile() {
    this.onSubmit();
  }

  onChoosingFile(event: any) {
    if (event.addedFiles?.length > 0) {
      const file = event.addedFiles[0];
      // Client-side: enforce only the file size limit (user requested)
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        // Reject the file and show toast via ViewChild reference
        this.files = [];
        this.uploadSuccess = false;
  this.toastComponent.showError(this.translateService.instant('LBL.UPLOAD.FILE_SIZE_EXCEED'));
        return;
      }

      // Accept file (no other client-side validations per request)
      this.files = [file];
      this.errorMessage = '';
      // reset uploadSuccess because a new file is selected
      this.uploadSuccess = false;
    }
  }

  onRemove(file: File) {
    // Remove the selected/uploaded file but keep form values
    if (!file) {
      this.files = [];
      this.uploadSuccess = false;
      return;
    }
    const idx = this.files.indexOf(file);
    if (idx > -1) {
      this.files.splice(idx, 1);
    }
    this.uploadSuccess = false;
    this.errorMessage = '';
  }

  private markFormGroupTouched() {
    Object.keys(this.uploadForm.controls).forEach(key => {
      const control = this.uploadForm.get(key);
      control?.markAsTouched();
    });
  }
}
