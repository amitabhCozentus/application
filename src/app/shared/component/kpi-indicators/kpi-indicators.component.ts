import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimengModule } from '../../primeng/primeng.module';

interface KpiCardData {
  label: string;
  totalCount: number;
  transportModeData: {
    mode: string;
    count: number;
  }[];
}

@Component({
  selector: 'app-kpi-indicators',
  standalone: true,
  imports: [CommonModule,PrimengModule],
  templateUrl: './kpi-indicators.component.html',
  styleUrls: ['./kpi-indicators.component.scss']
})
export class KpiIndicatorsComponent {
  @Input() card: KpiCardData [] = [];
  cardItems: KpiCardData[] = [];

  constructor() { 
  }

  ngOnInit(): void {
    console.log(this.card);
   // this.cardItems.push(...Object.values(this.card));
  }

  getModeIcon(mode: string): string {
    switch (mode) {
      case 'AIR':
        return '../../../../assets/bdp/images/Air.svg';
      case 'OCEAN':
        return '../../../../assets/bdp/images/ocean.svg';
      case 'RAIL':
        return '../../../../assets/bdp/images/rail.svg';
      case 'ROAD':
        return '../../../../assets/bdp/images/road.svg';
      default:
        return '';
    }
  }
}
