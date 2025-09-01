import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleaseNotesComponent } from './release-notes.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ReleaseNotesComponent', () => {
  let component: ReleaseNotesComponent;
  let fixture: ComponentFixture<ReleaseNotesComponent>;

  beforeEach(async () => {
    // Stub ResizeObserver globally for PrimeNG Tabs teardown
    (window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
    await TestBed.configureTestingModule({
      imports: [
        ReleaseNotesComponent,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleaseNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openAddRoleDialog should clear selection and open dialog', () => {
    component.selectedReleaseNote = { releaseName: 'x' } as any;
    component.showEditDialog = false;
    component.openAddRoleDialog();
    expect(component.selectedReleaseNote).toBeNull();
    expect(component.showEditDialog).toBeTrue();
  });

  it('editReleaseNotes should set selected and open dialog', () => {
    const note = component.releaseNotes[0];
    component.editReleaseNotes(note);
    expect(component.selectedReleaseNote).toEqual(note);
    expect(component.showEditDialog).toBeTrue();
  });

  it('onDialogClosed should reset dialog state', () => {
    component.showEditDialog = true;
    component.selectedReleaseNote = { releaseName: 'x' } as any;
    const logSpy = spyOn(console, 'log');
    component.onDialogClosed();
    expect(component.showEditDialog).toBeFalse();
    expect(component.selectedReleaseNote).toBeNull();
    expect(logSpy).toHaveBeenCalled();
  });

  it('onReleaseNoteUpdated should update existing when selectedReleaseNote is set', () => {
    const original = component.releaseNotes[1];
    component.selectedReleaseNote = { releaseName: original.releaseName };
    component.showEditDialog = true;
    component.onReleaseNoteUpdated({ uploadedBy: 'updated@bdpint.com' });
    const updated = component.releaseNotes.find(n => n.releaseName === original.releaseName)!;
    expect(updated.uploadedBy).toBe('updated@bdpint.com');
    expect(component.showEditDialog).toBeFalse();
    expect(component.selectedReleaseNote).toBeNull();
  });

  it('onReleaseNoteUpdated should add a new item when no selection', () => {
    const len = component.releaseNotes.length;
    component.selectedReleaseNote = null;
    component.onReleaseNoteUpdated({
      releaseName: 'New Note',
      releaseDate: '2025-08-27',
      uploadedBy: 'new@bdpint.com',
      uploadedOn: '2025-08-27 10:00:00'
    });
    expect(component.releaseNotes.length).toBe(len + 1);
    expect(component.releaseNotes[0].releaseName).toBe('New Note');
  });

  it('resetSearch should clear searchTerm and log', () => {
    const logSpy = spyOn(console, 'log');
    component.searchTerm = 'hello';
    component.resetSearch();
    expect(component.searchTerm).toBe('');
    expect(logSpy).toHaveBeenCalled();
  });

  it('onSearch and refresh should log without throwing', () => {
    const logSpy = spyOn(console, 'log');
    component.searchTerm = 'abc';
    component.onSearch();
    component.refresh();
    expect(logSpy).toHaveBeenCalled();
  });

  it('onTabChange should trigger loadReleaseNotesData when index 0', () => {
    const spy = spyOn(component, 'loadReleaseNotesData');
    component.onTabChange({ index: 0 });
    expect(spy).toHaveBeenCalled();
  });
});
