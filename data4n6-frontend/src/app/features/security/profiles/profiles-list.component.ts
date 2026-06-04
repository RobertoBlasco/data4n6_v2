import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideShieldCheck } from '@ng-icons/lucide';

@Component({
  selector: 'app-profiles-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmIconImports],
  providers: [provideIcons({ lucideShieldCheck })],
  template: `
    <div class="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <ng-icon hlmIcon size="lg" name="lucideShieldCheck" class="opacity-25" />
      <p class="text-sm">Perfiles — próximamente</p>
    </div>
  `,
})
export class ProfilesListComponent {}
