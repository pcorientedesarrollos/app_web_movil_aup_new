import { Injectable, signal, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OfflineService implements OnDestroy {
  readonly isOffline = signal<boolean>(!navigator.onLine);

  private onOnline  = () => this.isOffline.set(false);
  private onOffline = () => this.isOffline.set(true);

  constructor() {
    window.addEventListener('online',  this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online',  this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}
