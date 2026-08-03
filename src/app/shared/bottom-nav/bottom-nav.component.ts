import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="flex items-stretch border-t border-cream-tan bg-cream-pure">
      @for (item of navItems; track item.route) {
        <a [routerLink]="item.route"
           routerLinkActive="text-gold border-t-2 border-gold"
           [routerLinkActiveOptions]="{ exact: item.exact }"
           class="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2
                  text-brown-muted text-[10px] font-semibold uppercase tracking-wider
                  transition-colors border-t-2 border-transparent">
          <span class="text-xl leading-none" [innerHTML]="item.icon"></span>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  `
})
export class BottomNavComponent {
  private san = inject(DomSanitizer);
  private svg(s: string): SafeHtml { return this.san.bypassSecurityTrustHtml(s); }

  readonly navItems = [
    {
      route: '/dashboard',
      label: 'Pendientes',
      exact: true,
      icon: this.svg(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
               <polyline points="9 22 9 12 15 12 15 22"/>
             </svg>`)
    },
    {
      route: '/visits',
      label: 'Mis Apiarios',
      exact: false,
      icon: this.svg(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
               <polyline points="14 2 14 8 20 8"/>
               <line x1="16" y1="13" x2="8" y2="13"/>
               <line x1="16" y1="17" x2="8" y2="17"/>
               <polyline points="10 9 9 9 8 9"/>
             </svg>`)
    },
    {
      route: '/profile',
      label: 'Mi Info',
      exact: false,
      icon: this.svg(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
               <circle cx="12" cy="7" r="4"/>
             </svg>`)
    },
  ];
}
