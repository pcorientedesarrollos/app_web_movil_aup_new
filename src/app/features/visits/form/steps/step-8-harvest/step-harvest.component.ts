import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';

@Component({
  selector: 'app-step-harvest',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-harvest.component.html',
})
export class StepHarvestComponent implements OnInit, OnDestroy {
  private fb      = inject(FormBuilder);
  readonly store  = inject(VisitFormStore);
  private destroy = new Subject<void>();

  form = this.fb.group({
    cosechaMiel:    [this.store.formData().cosechaMiel    ?? false],
    cosechaMielKg:  [this.store.formData().cosechaMielKg  ?? 0],
    cosechaCera:    [this.store.formData().cosechaCera    ?? false],
    cosechaCeraKg:  [this.store.formData().cosechaCeraKg  ?? 0],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({
        cosechaMiel:   !!v.cosechaMiel,
        cosechaMielKg: +v.cosechaMielKg!,
        cosechaCera:   !!v.cosechaCera,
        cosechaCeraKg: +v.cosechaCeraKg!,
      });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }
}
