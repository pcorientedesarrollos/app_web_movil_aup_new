import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IosFrameComponent } from './shared/ios-frame/ios-frame.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IosFrameComponent],
  template: `<app-ios-frame />`,
})
export class AppComponent {}
