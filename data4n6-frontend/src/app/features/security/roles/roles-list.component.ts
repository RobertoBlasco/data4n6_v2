import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideShield } from '@ng-icons/lucide';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmIconImports],
  providers: [provideIcons({ lucideShield })],
  template: `
    <div class="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <ng-icon hlmIcon size="lg" name="lucideShield" class="opacity-25" />
      <p class="text-sm">Roles — próximamente</p>
    </div>
  `,
})
export class RolesListComponent {}
