import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineService } from '../../core/services/offline.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (offline.isOffline()) {
      <div class="flex items-center gap-2 px-4 py-2.5 bg-error-bg border-b border-error/20 animate-slide-up">
        <div class="w-2 h-2 rounded-full bg-error animate-pulse-gold flex-shrink-0"></div>
        <p class="text-xs font-medium text-error">
          Sin conexión — los formularios se guardarán localmente
        </p>
      </div>
    }
  `
})
export class OfflineBannerComponent {
  readonly offline = inject(OfflineService);
}
