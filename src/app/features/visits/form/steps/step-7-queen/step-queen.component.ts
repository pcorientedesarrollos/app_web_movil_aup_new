import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';

@Component({
  selector: 'app-step-queen',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-queen.component.html',
})
export class StepQueenComponent implements OnInit, OnDestroy {
  private fb      = inject(FormBuilder);
  readonly store  = inject(VisitFormStore);
  private destroy = new Subject<void>();

  form = this.fb.group({
    reinasReemplazadas: [this.store.formData().reinasReemplazadas ?? 0],
    origenReina:        [this.store.formData().origenReina        ?? 'PROPIA'],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({ reinasReemplazadas: +v.reinasReemplazadas!, origenReina: v.origenReina as any });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }
}
