import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDownloadDialogComponent } from './upload-download-dialog.component';

describe('UploadDownloadDialogComponent', () => {
  let component: UploadDownloadDialogComponent;
  let fixture: ComponentFixture<UploadDownloadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDownloadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadDownloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
