import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseNotesComponent } from './release-notes.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ReleaseNotesComponent', () => {
  let component: ReleaseNotesComponent;
  let fixture: ComponentFixture<ReleaseNotesComponent>;

  beforeEach(async () => {
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
});
