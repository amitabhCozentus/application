import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopbarComponent } from './topbar.component';
import { TopbarsService } from '../../service/topbars/topbars.service';
import { HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

// Fake loader for unit tests
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;

  beforeEach(async () => {
  // ensure clean persisted state for dark mode/theme between tests
  try { localStorage.clear(); } catch {}
    await TestBed.configureTestingModule({
      imports: [
        TopbarComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader }
        }), HttpClientTestingModule, RouterTestingModule
      ],
      providers: [
        TopbarsService,
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch language and rebuild menu', () => {
  // Spy on the exact instance used inside the component to avoid injector mismatch
  const useSpy = spyOn((component as any).translateService, 'use').and.returnValue(of({}) as any);
    const buildSpy = spyOn(component, 'buildNavMenu');
    component.onLanguageChange({ value: 'fr' });
    expect(component.selectedLanguage).toBe('fr');
    expect(useSpy).toHaveBeenCalledWith('fr');
  // simulate subscribe callback
  (component as any).translateService.use('fr').subscribe(() => {});
    expect(buildSpy).toHaveBeenCalled();
  });

  it('executeDarkModeToggle should toggle layout darkTheme', () => {
    const layout = (component as any).layoutService;
  // start from a known state
  layout.layoutConfig.update((s: any) => ({ ...s, darkTheme: false }));
    expect(layout.layoutConfig().darkTheme).toBeFalse();
    component.executeDarkModeToggle();
    expect(layout.layoutConfig().darkTheme).toBeTrue();
    component.executeDarkModeToggle();
    expect(layout.layoutConfig().darkTheme).toBeFalse();
  });

  it('should compute responsive menu and overflow', () => {
    // prepare many items
    (component as any).navMenuItems = Array.from({ length: 10 }, (_, i) => ({ label: 'Item ' + i }));
    // mock container width small
    const div = document.createElement('div');
    Object.defineProperty(div, 'offsetWidth', { get: () => 160 });
    (component as any).navContainer = { nativeElement: div } as any;
    component.onWindowResize();
    expect(component.visibleNavMenuItems.length).toBeGreaterThan(0);
    expect(component.visibleNavMenuItems.length).toBeLessThan((component as any).navMenuItems.length);
    expect(component.showOverflowMenu).toBeTrue();
  });

  it('selectedPrimaryColor should reflect layout primary', () => {
    const layout = (component as any).layoutService;
    layout.layoutConfig.update((s: any) => ({ ...s, primary: 'violet' }));
    expect(component.selectedPrimaryColor()).toBe('violet');
  });

  it('should update menu theme options and set menu theme when dark mode enabled', () => {
    const layout = (component as any).layoutService;
    // ensure light first
    layout.layoutConfig.update((s: any) => ({ ...s, darkTheme: false }));
    component.updateMenuThemeOptions();
    expect(component.menuThemeOptions.find(o => o.value === 'light')).toBeTruthy();

    // toggle dark -> setMenuTheme called internally via executeDarkModeToggle
    const setMenuSpy = spyOn(component as any, 'setMenuTheme').and.callThrough();
    component.executeDarkModeToggle();
    expect(layout.layoutConfig().darkTheme).toBeTrue();
    expect(setMenuSpy).toHaveBeenCalledWith('dark');
    component.updateMenuThemeOptions();
    expect(component.menuThemeOptions.find(o => o.value === 'light')).toBeUndefined();
  });

  it('should not show both menus at the same time (mutual exclusion)', () => {
    const fakeEvent = new Event('click');
    const userMenu = { hide: jasmine.createSpy('hide'), toggle: jasmine.createSpy('toggle') };
    const overflowMenu = { hide: jasmine.createSpy('hide'), toggle: jasmine.createSpy('toggle') };

    component.onOverflowButtonClick(fakeEvent, overflowMenu, userMenu);
    expect(userMenu.hide).toHaveBeenCalled();
    expect(overflowMenu.toggle).toHaveBeenCalledWith(fakeEvent);

    component.onUserAvatarClick(fakeEvent, userMenu, overflowMenu);
    expect(overflowMenu.hide).toHaveBeenCalled();
    expect(userMenu.toggle).toHaveBeenCalledWith(fakeEvent);
  });

  it('should respect saved dark mode preference on init', () => {
    try { localStorage.setItem('darkMode', JSON.stringify(true)); } catch {}
    // Create a fresh instance to trigger ngOnInit with saved state
    const freshFixture = TestBed.createComponent(TopbarComponent);
    const fresh = freshFixture.componentInstance as any;
    const setMenuSpy = spyOn(fresh, 'setMenuTheme').and.callThrough();
    fresh.ngOnInit();
    expect(fresh.layoutService.layoutConfig().darkTheme).toBeTrue();
    expect(setMenuSpy).toHaveBeenCalledWith('dark');
  });

  it('should respect saved theme color preference on init', () => {
    try { localStorage.setItem('themeColorPreference', JSON.stringify('violet')); } catch {}
    const freshFixture = TestBed.createComponent(TopbarComponent);
    const fresh = freshFixture.componentInstance as any;
    fresh.ngOnInit();
    expect(fresh.selectedSkin).toBe('violet');
    expect(fresh.layoutService.layoutConfig().primary).toBe('violet');
  });

  it('updateColors should update primary theme and call applyTheme for primary', () => {
    const applySpy = spyOn(component as any, 'applyTheme').and.stub();
    const evt: any = { value: { name: 'cyan' }, stopPropagation: jasmine.createSpy('stop') };
    (component as any).updateColors(evt, 'primary');
    expect(applySpy).toHaveBeenCalledWith('primary', jasmine.objectContaining({ name: 'cyan' }));
    expect((component as any).layoutService.layoutConfig().primary).toBe('cyan');
    expect(evt.stopPropagation).toHaveBeenCalled();
  });

  it('updateColors should call applyTheme for surface palettes', () => {
    const applySpy = spyOn(component as any, 'applyTheme').and.stub();
    const evt: any = { value: { name: 'blue', palette: { 50: '#fff' } } };
    (component as any).updateColors(evt, 'surface');
    expect(applySpy).toHaveBeenCalledWith('surface', evt.value);
  });

  it('buildNavMenu should filter items based on permission', () => {
    const spyPerm = spyOn(component as any, 'userHasPermission').and.callFake((p: string) => p !== 'HOME_VISIBLE');
    component.buildNavMenu();
    const labels = (component as any).navMenuItems.map((i: any) => i.label);
    expect(labels).not.toContain('LBL.MENU.HOME');
    expect(spyPerm).toHaveBeenCalled();
  });

  it('onWindowResize should recompute responsive menu', () => {
    const spyCalc = spyOn<any>(component, 'calculateResponsiveMenu');
    component.onWindowResize();
    expect(spyCalc).toHaveBeenCalled();
  });

  it('ngOnInit should default to English and build menu after translation ready', () => {
    const useSpy = spyOn((component as any).translateService, 'use').and.returnValue(of({}) as any);
    const buildSpy = spyOn(component as any, 'buildNavMenu');
    component.ngOnInit();
    expect(useSpy).toHaveBeenCalledWith('en');
    (component as any).translateService.use('en').subscribe(() => {});
    expect(buildSpy).toHaveBeenCalled();
  });

  it('calculateResponsiveMenu should show no overflow when container is wide', () => {
    (component as any).navMenuItems = Array.from({ length: 5 }, (_, i) => ({ label: 'Item ' + i }));
    const div = document.createElement('div');
    Object.defineProperty(div, 'offsetWidth', { get: () => 5000 });
    (component as any).navContainer = { nativeElement: div } as any;
    component.onWindowResize();
    expect(component.visibleNavMenuItems.length).toBe(5);
    expect(component.showOverflowMenu).toBeFalse();
  });

  it('getPresetExt should return noir palette when primary is noir, otherwise colored palette', () => {
    const layout = (component as any).layoutService;
    layout.layoutConfig.update((s: any) => ({ ...s, primary: 'noir' }));
    const noir = (component as any).getPresetExt();
    expect(noir.semantic.primary[50]).toBe('{zinc.50}');

    layout.layoutConfig.update((s: any) => ({ ...s, primary: 'violet' }));
    const colored = (component as any).getPresetExt();
    expect(colored.semantic.primary[50]).not.toBe('{zinc.50}');
  });

  it('ngAfterViewInit should attach a ResizeObserver when available', () => {
    const observed: any[] = [];
    class FakeRO {
      cb: any;
      constructor(cb: any) { this.cb = cb; }
      observe = (el: any) => { observed.push(el); };
      disconnect = () => {};
    }
    (window as any).ResizeObserver = FakeRO as any;
    // Provide a fake container element to observe; avoid PrimeNG initialization by not touching template
    (component as any).navContainer = { nativeElement: document.createElement('div') } as any;
    component.ngAfterViewInit();
    expect(observed.length).toBeGreaterThan(0);
  });
});
