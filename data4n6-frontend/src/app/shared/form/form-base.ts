import { signal } from '@angular/core';

type DialogState = 'open' | 'closed' | null;

export abstract class FormBase {
  protected abstract readonly icon: string;
  protected abstract readonly labelSingular: string;
  protected abstract entityDescription(): string;

  protected readonly headerClass = 'bg-primary text-primary-foreground';

  readonly loading     = signal(false);
  readonly saving      = signal(false);
  readonly loadError   = signal<string | null>(null);
  readonly saveError   = signal<string | null>(null);
  readonly savedOk     = signal(false);
  readonly deleteState = signal<DialogState>(null);

  openDelete(): void { this.deleteState.set('open'); }

  onDeleteStateChanged(state: string): void {
    if (state === 'closed') this.deleteState.set(null);
  }
}
