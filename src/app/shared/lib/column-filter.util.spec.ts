import { buildColumnFiltersFromEvent } from './column-filter.util';

describe('buildColumnFiltersFromEvent', () => {
  const mapper = (ui: string) => {
    const m: Record<string, string> = {
      roleName: 'name',
      roleDescription: 'description',
      status: 'isActive',
      createdOn: 'createdOn',
      updatedOn: 'updatedOn',
      skin: 'skin',
    };
    return m[ui] || ui;
  };

  it('maps text, boolean, and date filters with multi-sort meta', () => {
    const date = new Date(2025, 7, 27); // Aug is month 7 (0-based)
    const event: any = {
      filters: {
        roleName: { matchMode: 'contains', value: 'adm' },
        status: { constraints: [{ matchMode: 'equals', value: true }] },
        createdOn: { matchMode: 'dateIs', value: date },
      },
      multiSortMeta: [
        { field: 'updatedOn', order: -1 },
        { field: 'roleName', order: 1 },
      ],
    };

    const out = buildColumnFiltersFromEvent(event, mapper);
    // Order is not guaranteed; assert presence
    expect(out).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ columnName: 'name', filter: 'cnt:adm' }),
      jasmine.objectContaining({ columnName: 'isActive', filter: 'eq:true' }),
      jasmine.objectContaining({ columnName: 'createdOn', filter: jasmine.stringMatching(/^deq:\d{4}-\d{2}-\d{2}$/) }),
      jasmine.objectContaining({ columnName: 'updatedOn', sort: 'desc' }),
      jasmine.objectContaining({ columnName: 'name', sort: 'asc' }),
    ]));
  });

  it('supports between date range and IN operator', () => {
    const event: any = {
      filters: {
        createdOn: { matchMode: 'between', value: [new Date('2025-01-01'), new Date('2025-01-31')] },
        skin: { matchMode: 'in', value: ['classic', 'modern'] },
      },
      sortField: 'createdOn',
      sortOrder: 1,
    };
    const out = buildColumnFiltersFromEvent(event, mapper);
    expect(out).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ columnName: 'createdOn', filter: 'dbetween:2025-01-01,2025-01-31', sort: 'asc' }),
      jasmine.objectContaining({ columnName: 'skin', filter: 'in:classic,modern' }),
    ]));
  });

  it('handles legacy array filter meta and different casing of match modes', () => {
    const event: any = {
      filters: {
        roleDescription: [ { matchMode: 'StartsWith', value: 'Sys' } ],
        updatedOn: { constraints: [{ matchMode: 'DateBefore', value: '2024-12-31' }] },
      }
    };
    const out = buildColumnFiltersFromEvent(event, mapper);
    expect(out).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ columnName: 'description', filter: 'sw:Sys' }),
      jasmine.objectContaining({ columnName: 'updatedOn', filter: 'dlt:2024-12-31' }),
    ]));
  });

  it('ignores unknown or empty filters and returns only valid descriptors', () => {
    const event: any = {
      filters: {
        roleName: { matchMode: 'unknown', value: 'x' },
        status: { matchMode: 'equals', value: null },
      }
    };
    const out = buildColumnFiltersFromEvent(event, mapper);
    expect(out.length).toBe(0);
  });
});
