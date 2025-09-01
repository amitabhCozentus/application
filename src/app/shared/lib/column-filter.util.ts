import { ColumnFilterDescriptor } from "./constants";

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

export type FieldMapper = (uiField: string) => string;

/** Normalize date-like inputs to YYYY-MM-DD */
function normalizeDate(val: any): string | null {
  if (!val) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  const fromLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return fromLocal(val);
  }

  if (typeof val === 'string') {
    const s = val.trim();
    // yyyy-MM-dd
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    if (iso.test(s)) return s;

    // dd-MM-yyyy
    const dmy = /^(\d{2})-(\d{2})-(\d{4})$/;
    const dmyMatch = s.match(dmy);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const d = new Date(year, month, day);
      if (isNaN(d.getTime())) return null;
      return fromLocal(d);
    }

    // dd MMM yyyy e.g., 24 Aug 2025
    const dmyText = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/;
    const txt = s.match(dmyText);
    if (txt) {
      const day = parseInt(txt[1], 10);
      const mon = MONTHS.indexOf(txt[2].toLowerCase());
      const year = parseInt(txt[3], 10);
      const d = new Date(year, mon, day);
      if (isNaN(d.getTime())) return null;
      return fromLocal(d);
    }

    const d = new Date(s);
    if (!isNaN(d.getTime())) return fromLocal(d);
    return null;
  }

  const d = new Date(val);
  if (!isNaN(d.getTime())) return fromLocal(d);
  return null;
}

/** Convert PrimeNG matchMode + value to API operator string */
function toApiOp(matchMode: string, value: any, field?: string): string | undefined {
  if (!matchMode) return undefined;
  const mm = matchMode.toLowerCase();
  const isBooleanField = field === 'isActive';

  const toCsv = (v: any[]): string => v.map(x => x == null ? '' : String(x)).join(',');

  switch (mm) {
    case 'contains': return value != null ? `cnt:${value}` : undefined;
    case 'notcontains': return value != null ? `ncnt:${value}` : undefined;
    case 'startswith': return value != null ? `sw:${value}` : undefined;
    case 'endswith': return value != null ? `ew:${value}` : undefined;
    case 'equals': {
      if (value == null) return undefined;
      if (isBooleanField) return `eq:${String(value).toLowerCase()}`; // eq:true/eq:false
      return `eq:${value}`;
    }
    case 'notequals': return value != null ? `ne:${value}` : undefined;
    case 'in': {
      const arr = Array.isArray(value) ? value : [value];
      return `in:${toCsv(arr)}`;
    }
    case 'lessthan': return value != null ? `lt:${value}` : undefined;
    case 'lessthanorequalto': return value != null ? `lte:${value}` : undefined;
    case 'greaterthan': return value != null ? `gt:${value}` : undefined;
    case 'greaterthanorequalto': return value != null ? `gte:${value}` : undefined;
    // Date match modes
    case 'dateis': {
      const d = normalizeDate(value);
      // Use a same-day range to ensure equality matches full day regardless of stored time component
      return d ? `deq:${d}` : undefined;
    }
    case 'dateisnot': {
      const d = normalizeDate(value);
      return d ? `dne:${d}` : undefined;
    }
    case 'datebefore': {
      const d = normalizeDate(value);
      return d ? `dlt:${d}` : undefined;
    }
    case 'dateafter': {
      const d = normalizeDate(value);
      return d ? `dgt:${d}` : undefined;
    }
    case 'between': {
      const a = Array.isArray(value) ? value : [];
      if (a.length === 2) {
        const s = normalizeDate(a[0]);
        const e = normalizeDate(a[1]);
        if (s && e) return `dbetween:${s},${e}`;
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Build API column filter descriptors from PrimeNG table lazy-load event.
 * Provide a mapper to convert UI field names to API column names.
 */
export function buildColumnFiltersFromEvent(event: any, toApiField: FieldMapper): ColumnFilterDescriptor[] {
  const descriptors: ColumnFilterDescriptor[] = [];
  const filters = event?.filters || event?.filterMeta || {};

  // Extract filter descriptors
  Object.keys(filters).forEach((uiField) => {
    const apiField = toApiField(uiField);
    const meta: any = filters[uiField];
    let matchMode: string | undefined;
    let value: any;

    if (meta) {
      if (Array.isArray(meta)) {
        // Legacy array form - take first
        matchMode = meta[0]?.matchMode;
        value = meta[0]?.value;
      } else if (Array.isArray(meta.constraints) && meta.constraints.length) {
        // ColumnFilter menu form with constraints
        const c0 = meta.constraints[0];
        matchMode = c0?.matchMode || meta.matchMode;
        value = c0?.value;
      } else {
        matchMode = meta.matchMode;
        value = meta.value;
      }
    }

    const op = toApiOp(matchMode || '', value, apiField);
    if (op) {
      descriptors.push({ columnName: apiField, filter: op });
    }
  });

  // Extract sorting - support multi or single
  if (Array.isArray(event?.multiSortMeta) && event.multiSortMeta.length) {
    event.multiSortMeta.forEach((s: any) => {
      const apiField = toApiField(s.field);
      const dir: 1 | -1 = s.order;
      let desc = descriptors.find(d => d.columnName === apiField);
      if (!desc) {
        desc = { columnName: apiField };
        descriptors.push(desc);
      }
      desc.sort = dir === -1 ? 'desc' : 'asc';
    });
  } else if (event?.sortField) {
    const apiField = toApiField(event.sortField);
    const dir: 1 | -1 = event.sortOrder;
    let desc = descriptors.find(d => d.columnName === apiField);
    if (!desc) {
      desc = { columnName: apiField };
      descriptors.push(desc);
    }
    desc.sort = dir === -1 ? 'desc' : 'asc';
  }

  return descriptors;
}
