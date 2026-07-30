import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';

@Component({
  selector: 'app-step-feeding',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-feeding.component.html',
})
export class StepFeedingComponent implements OnInit, OnDestroy {
  private fb      = inject(FormBuilder);
  readonly store  = inject(VisitFormStore);
  private destroy = new Subject<void>();

  form = this.fb.group({
    tipoAlimento:    [this.store.formData().tipoAlimento    ?? ''],
    cantidadAlimento:[this.store.formData().cantidadAlimento ?? 0],
    origenMiel:      [this.store.formData().origenMiel      ?? 'PROPIA'],
    marcosReserva:   [this.store.formData().marcosReserva   ?? 'MAS_4'],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({
        tipoAlimento:     v.tipoAlimento!,
        cantidadAlimento: +v.cantidadAlimento!,
        origenMiel:       v.origenMiel as any,
        marcosReserva:    v.marcosReserva as any,
      });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }
}
