import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiIndicatorsComponent } from './kpi-indicators.component';

describe('KpiIndicatorsComponent', () => {
  let component: KpiIndicatorsComponent;
  let fixture: ComponentFixture<KpiIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiIndicatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
