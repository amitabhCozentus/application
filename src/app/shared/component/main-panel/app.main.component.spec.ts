import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

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

  it('should compute topbarHeight from view and adjust on resize', fakeAsync(() => {
    const host = fixture.nativeElement as HTMLElement;
    const topbar = host.querySelector('.layout-topbar-fixed') as HTMLElement;
    // Simulate topbar having a height
    Object.defineProperty(topbar, 'offsetHeight', { get: () => 80 });
    component.ngAfterViewInit();
    expect(component.topbarHeight).toBeGreaterThanOrEqual(80);

    // Trigger HostListener resize
    spyOn(component as any, 'calculateTopbarHeight').and.callThrough();
    component.onResize();
    tick(120); // flush debounce timer
    expect((component as any).calculateTopbarHeight).toHaveBeenCalled();
  }));
});
