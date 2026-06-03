import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-person-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="p-8 text-center text-muted-foreground">
      <p class="text-sm">🚧 Componente en migración a Tailwind + Spartan</p>
    </div>
  `,
})
export class PersonFormComponent {}
