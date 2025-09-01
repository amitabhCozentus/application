import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PrimengModule } from '../../../primeng/primeng.module';
import { NgxDropzoneModule } from 'ngx-dropzone';

@Component({
  selector: 'app-upload-download-dialog',
  imports: [PrimengModule, ReactiveFormsModule, FormsModule, NgxDropzoneModule],
  templateUrl: './upload-download-dialog.component.html',
  styleUrl: './upload-download-dialog.component.scss'
})
export class UploadDownloadDialogComponent implements OnInit, OnChanges {
  @Input() uploadDialogVisible: boolean = true;
  @Input() editMode: boolean = false;
  @Input() selectedReleaseNote: any = null;

  @Output() dialogClosed = new EventEmitter<void>();
  @Output() releaseNoteUpdated = new EventEmitter<any>();

  uploadForm: FormGroup;
  files: File[] = [];

  constructor(private formBuilder: FormBuilder) {
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
      // Pre-fill form with existing data for editing
      this.uploadForm.patchValue({
        releaseName: this.selectedReleaseNote.releaseName,
        releaseNotesDate: new Date(this.selectedReleaseNote.releaseDate)
      });
    } else {
      // Reset form for new entry
      this.uploadForm.reset();
      this.files = [];
    }
  }

  onSubmit() {
    if (this.uploadForm.valid) {
      const formData = {
        releaseName: this.uploadForm.value.releaseName,
        releaseDate: this.uploadForm.value.releaseNotesDate.toISOString().split('T')[0], // Format date
        uploadedBy: 'current.user@bdpint.com', // Replace with actual user
        uploadedOn: new Date().toISOString().replace('T', ' ').substring(0, 19) // Current timestamp
      };

      this.releaseNoteUpdated.emit(formData);
      console.log('Form submitted:', formData);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  closeDialog() {
    this.dialogClosed.emit();
  }

  uploadFile() {
    this.onSubmit();
  }

  onChoosingFile(event: any) {
    console.log('File selected:', event);
    this.files.push(...event.addedFiles);
  }

  onRemove(file: any) {
    console.log('File removed:', file);
    this.files.splice(this.files.indexOf(file), 1);
  }  private markFormGroupTouched() {
    Object.keys(this.uploadForm.controls).forEach(key => {
      const control = this.uploadForm.get(key);
      control?.markAsTouched();
    });
  }

}
