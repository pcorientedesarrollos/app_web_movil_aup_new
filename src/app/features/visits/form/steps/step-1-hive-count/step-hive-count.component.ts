import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';

@Component({
  selector: 'app-step-hive-count',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-hive-count.component.html',
})
export class StepHiveCountComponent implements OnInit, OnDestroy {
  private fb      = inject(FormBuilder);
  readonly store  = inject(VisitFormStore);
  private destroy = new Subject<void>();

  form = this.fb.group({
    colmenasInicial:        [this.store.formData().colmenasInicial        ?? 0],
    causasMuerteEnjambre:   [this.store.formData().causasMuerteEnjambre   ?? false],
    causasTraslado:         [this.store.formData().causasTraslado         ?? false],
    causasDivisiones:       [this.store.formData().causasDivisiones       ?? 0],
    causasNucleos:          [this.store.formData().causasNucleos          ?? 0],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({
        colmenasInicial:      +v.colmenasInicial!,
        colmenasFinal:        this.store.hiveCount(),
        causasMuerteEnjambre: !!v.causasMuerteEnjambre,
        causasTraslado:       !!v.causasTraslado,
        causasDivisiones:     +v.causasDivisiones!,
        causasNucleos:        +v.causasNucleos!,
      });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }

  toggle(ctrl: 'causasMuerteEnjambre' | 'causasTraslado'): void {
    const current = this.form.get(ctrl)!.value;
    this.form.get(ctrl)!.setValue(!current);
  }

  isChecked(ctrl: string): boolean {
    return !!this.form.get(ctrl)!.value;
  }
}
