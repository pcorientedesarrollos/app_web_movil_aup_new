import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';

@Component({
  selector: 'app-step-wax',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-wax.component.html',
})
export class StepWaxComponent implements OnInit, OnDestroy {
  private fb      = inject(FormBuilder);
  readonly store  = inject(VisitFormStore);
  private destroy = new Subject<void>();

  form = this.fb.group({
    ceraLaminas:         [this.store.formData().ceraLaminas         ?? 0],
    origenCera:          [this.store.formData().origenCera           ?? 'COMPRADA'],
    marcosIdentificados: [this.store.formData().marcosIdentificados  ?? false],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({
        ceraLaminas:         +v.ceraLaminas!,
        origenCera:          v.origenCera as any,
        marcosIdentificados: !!v.marcosIdentificados,
      });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }
}
