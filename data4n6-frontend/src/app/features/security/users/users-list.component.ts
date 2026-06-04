import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideUsers } from '@ng-icons/lucide';

@Component({
  selector: 'app-users-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmIconImports],
  providers: [provideIcons({ lucideUsers })],
  template: `
    <div class="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <ng-icon hlmIcon size="lg" name="lucideUsers" class="opacity-25" />
      <p class="text-sm">Usuarios — próximamente</p>
    </div>
  `,
})
export class UsersListComponent {}
