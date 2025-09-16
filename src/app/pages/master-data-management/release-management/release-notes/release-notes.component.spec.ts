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
    // Add a dummy note to the signal for testing
    const dummyNote = { id: 1, releaseName: 'Test', releaseUserManualName: 'Test', dateOfReleaseNote: '2024-01-01' };
    component['rawReleaseNotesSignal'].set([dummyNote]);
    component.editReleaseNotes(dummyNote);
    expect(component.selectedReleaseNote).toEqual(dummyNote);
    expect(component.showEditDialog).toBeTrue();
  });

  it('onDialogClosed should reset dialog state', () => {
    component.showEditDialog = true;
    component.selectedReleaseNote = { releaseName: 'x' } as any;
    component.onDialogClosed();
    expect(component.showEditDialog).toBeFalse();
    expect(component.selectedReleaseNote).toBeNull();
  });

  it('onReleaseNoteUpdated should update existing when selectedReleaseNote is set', () => {
    const original = { id: 2, releaseName: 'Old', uploadedBy: 'old@bdpint.com' };
    component['rawReleaseNotesSignal'].set([original]);
    component.selectedReleaseNote = { id: 2, releaseName: 'Old' };
    component.showEditDialog = true;
    component.onReleaseNoteUpdated({ uploadedBy: 'updated@bdpint.com' });
    const updated = component['rawReleaseNotesSignal']().find(n => n.id === 2)!;
    expect(updated.uploadedBy).toBe('updated@bdpint.com');
    expect(component.showEditDialog).toBeFalse();
    expect(component.selectedReleaseNote).toBeNull();
  });

  it('onReleaseNoteUpdated should reload list when no selection', () => {
    const loadSpy = spyOn(component, 'loadReleaseNotesList');
    component.selectedReleaseNote = null;
    component.paginationState.pageIndex = 1;
    component.paginationState.rows = 5;
    component.searchTerm = 'abc';
    component.columnFilters = [{ columnName: 'releaseName', filter: '', sort: '' }];
    component.onReleaseNoteUpdated({ releaseName: 'New Note' });
    expect(loadSpy).toHaveBeenCalledWith(1, 5, 'abc', component.columnFilters);
    expect(component.showEditDialog).toBeFalse();
    expect(component.selectedReleaseNote).toBeNull();
  });

  it('resetSearch should clear searchTerm, filters, and reload', () => {
    const loadSpy = spyOn(component, 'loadReleaseNotesList');
    component.searchTerm = 'hello';
    component.columnFilters = [{ columnName: 'releaseName', filter: '', sort: '' }];
    component.resetSearch();
    expect(component.searchTerm).toBe('');
    expect(component.columnFilters).toEqual([]);
    expect(loadSpy).toHaveBeenCalledWith(0, 10, '', []);
  });

  it('onSearch should trigger loadReleaseNotesList for valid search', () => {
    const loadSpy = spyOn(component, 'loadReleaseNotesList');
    component.searchTerm = 'abc';
    component.onSearch();
    expect(loadSpy).toHaveBeenCalledWith(0, 10, 'abc', []);
    component.searchTerm = '';
    component.onSearch();
    expect(loadSpy).toHaveBeenCalledWith(0, 10, '', []);
  });

  it('refresh should reset state and reload', (done) => {
    const loadSpy = spyOn(component, 'loadReleaseNotesList');
    component.releaseNotesTable = { clear: jasmine.createSpy('clear') } as any;
    component.refresh();
    setTimeout(() => {
      expect(component.searchTerm).toBe('');
      expect(component.columnFilters).toEqual([]);
      expect(loadSpy).toHaveBeenCalledWith(0, 10, '', []);
      done();
    });
  });

  it('onTabChange should trigger loadReleaseNotesData when index 0', () => {
    const spy = spyOn(component, 'loadReleaseNotesData');
    component.onTabChange({ index: 0 });
    expect(spy).toHaveBeenCalled();
  });
});
