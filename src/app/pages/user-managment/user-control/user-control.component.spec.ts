import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserControlComponent } from './user-control.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserControlService } from 'src/app/shared/service/user-control/user-control.service';
import { TranslateModule } from '@ngx-translate/core';

describe('UserControlComponent', () => {
  let component: UserControlComponent;
  let fixture: ComponentFixture<UserControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserControlComponent,HttpClientTestingModule,TranslateModule.forRoot()],
      providers: [UserControlService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
