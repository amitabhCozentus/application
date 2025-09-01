import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserManualComponent } from './user-manual.component';
import { TranslateModule } from '@ngx-translate/core';

describe('UserManualComponent', () => {
  let component: UserManualComponent;
  let fixture: ComponentFixture<UserManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManualComponent,
        TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Use the fixture initialized in beforeEach
    expect(component).toBeTruthy();
  });

  it('onSearch should log and not mutate data', () => {
    const logSpy = spyOn(console, 'log');
    const before = component.UserManual.length;
    component.searchTerm = 'guide';
    component.onSearch();
    expect(logSpy).toHaveBeenCalled();
    expect(component.UserManual.length).toBe(before);
  });

  it('resetSearch clears searchTerm and logs', () => {
    const logSpy = spyOn(console, 'log');
    component.searchTerm = 'x';
    component.resetSearch();
    expect(component.searchTerm).toBe('');
    expect(logSpy).toHaveBeenCalled();
  });

  it('refresh logs', () => {
    const logSpy = spyOn(console, 'log');
    component.refresh();
    expect(logSpy).toHaveBeenCalled();
  });

  it('openAddRoleDialog logs', () => {
    const logSpy = spyOn(console, 'log');
    component.openAddRoleDialog();
    expect(logSpy).toHaveBeenCalled();
  });

  it('deleteManual logs with row data', () => {
    const logSpy = spyOn(console, 'log');
    const row = component.UserManual[0];
    component.deleteManual(row);
    expect(logSpy).toHaveBeenCalled();
  });
});
