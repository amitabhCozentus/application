import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTableFilterComponent } from './common-table-filter.component';

describe('CommonTableFilterComponent', () => {
  let component: CommonTableFilterComponent;
  let fixture: ComponentFixture<CommonTableFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonTableFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonTableFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
