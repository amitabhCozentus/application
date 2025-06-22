import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonTableSearchComponent } from './common-table-search.component';
import { By } from '@angular/platform-browser';
import { PrimengModule } from '../../primeng/primeng.module';
import { DebugElement } from '@angular/core';

describe('CommonTableSearchComponent', () => {
  let component: CommonTableSearchComponent;
  let fixture: ComponentFixture<CommonTableSearchComponent>;
  let inputEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimengModule, CommonTableSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonTableSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.debugElement.query(By.css('input'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit valueChange on input', () => {
    spyOn(component.valueChange, 'emit');
    inputEl.nativeElement.value = 'test';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalled();
  });

  it('should emit search on enter key', () => {
    spyOn(component.search, 'emit');
    inputEl.triggerEventHandler('keyup.enter', {});
    expect(component.search.emit).toHaveBeenCalled();
  });

  it('should emit clear on clear button click', () => {
    component.value = 'abc';
    fixture.detectChanges();
    spyOn(component.clear, 'emit');
    spyOn(component.valueChange, 'emit');
    const clearBtn = fixture.debugElement.query(By.css('button'));
    if (clearBtn) {
      clearBtn.nativeElement.click();
      expect(component.clear.emit).toHaveBeenCalled();
      expect(component.valueChange.emit).toHaveBeenCalledWith('');
    }
  });
});
