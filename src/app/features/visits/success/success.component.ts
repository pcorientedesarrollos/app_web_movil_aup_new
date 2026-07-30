import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './success.component.html',
})
export class SuccessComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  readonly isOffline = signal(false);

  ngOnInit(): void {
    this.isOffline.set(this.route.snapshot.queryParams['offline'] === '1');
  }
}
