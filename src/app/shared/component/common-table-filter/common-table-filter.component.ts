import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PrimengModule } from '../../primeng/primeng.module';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-common-table-filter',
  imports: [CommonModule,PrimengModule],
  templateUrl: './common-table-filter.component.html',
  styleUrl: './common-table-filter.component.scss'
})
export class CommonTableFilterComponent {
 @Input() field!: string;       // column field name
  @Input() table!: Table;        // PrimeNG table reference

  isColumnFiltered(): boolean {
    if (!this.table?.filters) return false;

    const filter = this.table.filters[this.field];
    if (!filter) return false;

    // Multiple filter conditions (array)
    if (Array.isArray(filter)) {
      return filter.some(f =>
        f?.value !== null &&
        f?.value !== undefined &&
        f?.value !== ''
      );
    }

    // Single filter condition
    return filter.value !== null &&
           filter.value !== undefined &&
           filter.value !== '';
  }
}
