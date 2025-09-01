import { Component, Input } from '@angular/core';
interface KpiCardData {
  value: number | string;
  label: string;
  icon: string;
}
@Component({
  selector: 'app-kpi-indicators',
  imports: [],
  templateUrl: './kpi-indicators.component.html',
  styleUrl: './kpi-indicators.component.scss'
})
export class KpiIndicatorsComponent {
@Input() card: KpiCardData [] = [];
constructor() { }
  ngOnInit(): void {
  }
}
