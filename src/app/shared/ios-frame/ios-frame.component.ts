import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-ios-frame',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Single unified wrapper: full-screen on mobile, centered device on desktop -->
    <div class="min-h-screen bg-cream-pure md:bg-brown-light md:flex md:items-center md:justify-center md:p-8">
      <div class="w-full min-h-screen flex flex-col bg-cream-pure
                  md:w-[402px] md:min-h-0 md:h-[874px]
                  md:rounded-[44px] md:overflow-hidden md:shadow-ios-frame">
        <!-- Status bar — desktop only -->
        <div class="hidden md:flex h-10 bg-cream-pure/90 flex-shrink-0 z-50 items-center px-6 pointer-events-none">
          <span class="font-mono text-xs text-brown-muted font-medium">9:41</span>
          <div class="ml-auto flex items-center gap-2">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="3" width="3" height="9" rx="1" fill="#8A7550"/>
              <rect x="4.5" y="2" width="3" height="10" rx="1" fill="#8A7550"/>
              <rect x="9" y="0" width="3" height="12" rx="1" fill="#8A7550"/>
              <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#241A0C"/>
            </svg>
            <div class="flex items-center gap-0.5">
              <div class="w-6 h-3 border border-brown-muted rounded-sm relative">
                <div class="absolute inset-0.5 right-1 bg-brown rounded-[2px]"></div>
                <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0.5 w-0.5 h-1.5 bg-brown-muted rounded-r-sm"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- Single router outlet -->
        <div class="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class IosFrameComponent {}
