import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { DialogState } from './form-dialog-base';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LowerCasePipe, BrnDialogContent, HlmDialogImports, HlmButtonImports, HlmIconImports],
  template: `
    <hlm-dialog [state]="state()" (stateChanged)="stateChanged.emit($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" [name]="icon()" />
            <h2 class="text-sm font-semibold">¿Eliminar {{ label() | lowercase }}?</h2>
          </div>
          <p class="text-sm text-muted-foreground py-2">
            Se eliminará <strong>{{ description() }}</strong>. Esta acción no se puede deshacer.
          </p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline"
              class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white"
              hlmDialogClose>
              Cancelar
            </button>
            <button hlmBtn variant="destructive" (click)="confirmed.emit()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class DeleteConfirmDialogComponent {
  readonly icon        = input.required<string>();
  readonly label       = input.required<string>();
  readonly description = input<string>('');
  readonly state       = input<DialogState>(null);

  readonly stateChanged = output<string>();
  readonly confirmed    = output<void>();
}
