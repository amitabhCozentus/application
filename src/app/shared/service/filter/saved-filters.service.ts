import { Injectable, signal, computed } from '@angular/core';
import { GlobalFiltersState } from '../../model/filters.model';

export interface SavedFilter {
  id: string;
  name: string;
  criteria: GlobalFiltersState;
  createdDate: Date;
}

@Injectable({ providedIn: 'root' })
export class SavedFiltersService {
  private readonly _saved = signal<SavedFilter[]>([]);
  readonly saved = computed(() => this._saved());

  // Track which saved filter is currently applied (affects button highlight)
  readonly appliedSavedId = signal<string | null>(null);

  save(name: string, criteria: GlobalFiltersState, id?: string) {
    const now = new Date();
    const newId = id ?? cryptoRandomId();
    const item: SavedFilter = {
      id: newId,
      name: name.trim(),
      criteria: structuredClone(criteria),
      createdDate: now,
    };
    this._saved.update((list) => {
      const idx = list.findIndex((x) => x.id === newId);
      if (idx >= 0) {
        const copy = list.slice();
        copy[idx] = item;
        return copy;
      }
      return [item, ...list];
    });
    return newId;
  }

  delete(id: string) {
    this._saved.update((list) => list.filter((x) => x.id !== id));
    if (this.appliedSavedId() === id) this.appliedSavedId.set(null);
  }

  getById(id: string) {
    return this._saved().find((x) => x.id === id) ?? null;
  }
}

function cryptoRandomId() {
  try {
    const arr = new Uint32Array(2);
    crypto.getRandomValues(arr);
    return Array.from(arr).map((n) => n.toString(36)).join('');
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
