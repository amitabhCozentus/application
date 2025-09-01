import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { UploadDownloadDialogComponent } from './upload-download-dialog.component';
import { By } from '@angular/platform-browser';

describe('UploadDownloadDialogComponent', () => {
  let component: UploadDownloadDialogComponent;
  let fixture: ComponentFixture<UploadDownloadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UploadDownloadDialogComponent,
        NoopAnimationsModule,
        NgxDropzoneModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadDownloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form for edit mode with selected release note', () => {
    const note = { releaseName: 'v1.0', releaseDate: '2024-01-10' };
    component.editMode = true;
    component.selectedReleaseNote = note as any;

    component.ngOnChanges();
    fixture.detectChanges();

    expect(component.uploadForm.get('releaseName')?.value).toBe('v1.0');
    const dateVal = component.uploadForm.get('releaseNotesDate')?.value as Date;
    expect(dateVal instanceof Date).toBeTrue();
  });

  it('should reset form when not in edit mode', () => {
    component.editMode = false;
    component.selectedReleaseNote = null;
    component.uploadForm.patchValue({ releaseName: 'x', releaseNotesDate: new Date() });
    component.files = [new File(['x'], 'a.pdf', { type: 'application/pdf' })];

    component.ngOnChanges();
    fixture.detectChanges();

    expect(component.uploadForm.get('releaseName')?.value).toBeNull();
    expect(component.uploadForm.get('releaseNotesDate')?.value).toBeNull();
    expect(component.files.length).toBe(0);
  });

  it('should not emit when form is invalid on submit', () => {
    spyOn(component.releaseNoteUpdated, 'emit');
    component.uploadForm.reset();
    component.onSubmit();
    expect(component.releaseNoteUpdated.emit).not.toHaveBeenCalled();
  });

  it('should emit form data on valid submit', () => {
    spyOn(component.releaseNoteUpdated, 'emit');
    const date = new Date('2024-02-01T00:00:00Z');
    component.uploadForm.patchValue({ releaseName: 'v2', releaseNotesDate: date });

    component.onSubmit();
    expect(component.releaseNoteUpdated.emit).toHaveBeenCalled();
    const arg = (component.releaseNoteUpdated.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(arg.releaseName).toBe('v2');
    expect(arg.releaseDate).toBe('2024-02-01');
  });

  it('uploadFile should proxy to onSubmit', () => {
    spyOn(component, 'onSubmit');
    component.uploadFile();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should add and remove files via dropzone handlers', () => {
    const f = new File(['abc'], 'test.pdf', { type: 'application/pdf' });
    component.onChoosingFile({ addedFiles: [f] });
    expect(component.files.length).toBe(1);
    component.onRemove(f);
    expect(component.files.length).toBe(0);
  });

  it('should emit close on dialog close', () => {
    spyOn(component.dialogClosed, 'emit');
    component.closeDialog();
    expect(component.dialogClosed.emit).toHaveBeenCalled();
  });
});

