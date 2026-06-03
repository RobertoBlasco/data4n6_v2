import { signal } from '@angular/core';

export type DialogState = 'open' | 'closed' | null;

export abstract class FormDialogBase<T> {
  protected readonly dialogHeaderClass = 'bg-primary text-primary-foreground';

  readonly formState    = signal<DialogState>(null);
  readonly saving       = signal(false);
  readonly formError    = signal<string | null>(null);
  readonly editingItem  = signal<T | null>(null);
  readonly itemToDelete = signal<T | null>(null);
  readonly deleteState  = signal<DialogState>(null);

  onFormStateChanged(s: string): void   { if (s === 'closed') this.formState.set(null); }
  onDeleteStateChanged(s: string): void { if (s === 'closed') this.deleteState.set(null); }

  openCreate(): void {
    this.editingItem.set(null);
    this.formError.set(null);
    this.formState.set('open');
  }

  openEdit(item: T): void {
    this.editingItem.set(item);
    this.formError.set(null);
    this.formState.set('open');
  }

  openDelete(item: T): void {
    this.itemToDelete.set(item);
    this.deleteState.set('open');
  }
}
