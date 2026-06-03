import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `<div class="p-8 text-center text-muted-foreground text-sm">🚧 En construcción</div>`,
})
export class WarehousesComponent {}
