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
    const fixture = TestBed.createComponent(UserManualComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
