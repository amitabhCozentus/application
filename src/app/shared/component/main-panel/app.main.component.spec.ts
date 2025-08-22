import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppMainComponent } from './app.main.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('MainComponentComponent', () => {
  let component: AppMainComponent;
  let fixture: ComponentFixture<AppMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppMainComponent,TranslateModule.forRoot(),HttpClientTestingModule],
       providers: [
    { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }
  ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
