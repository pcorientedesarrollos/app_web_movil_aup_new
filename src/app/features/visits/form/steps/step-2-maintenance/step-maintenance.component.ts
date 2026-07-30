import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';

@Component({
  selector: 'app-step-maintenance',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-maintenance.component.html',
})
export class StepMaintenanceComponent implements OnInit, OnDestroy {
  private fb      = inject(FormBuilder);
  readonly store  = inject(VisitFormStore);
  private destroy = new Subject<void>();

  readonly apiarioOpts = ['Desyerbe', 'Recolección de basura', 'Agua'];
  readonly equipoOpts  = ['Herramientas', 'Banca', 'Extractor', 'Otro'];

  form = this.fb.group({
    mantenimientoApiario: [this.store.formData().mantenimientoApiario ?? [] as string[]],
    mantenimientoEquipo:  [this.store.formData().mantenimientoEquipo  ?? [] as string[]],
    mantenimientoOtroDesc:[this.store.formData().mantenimientoOtroDesc ?? ''],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({
        mantenimientoApiario: v.mantenimientoApiario!,
        mantenimientoEquipo:  v.mantenimientoEquipo!,
        mantenimientoOtroDesc: v.mantenimientoOtroDesc!,
      });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }

  toggle(ctrl: string, value: string): void {
    const arr: string[] = this.form.get(ctrl)!.value ?? [];
    const updated = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    this.form.get(ctrl)!.setValue(updated);
  }

  isChecked(ctrl: string, value: string): boolean {
    return ((this.form.get(ctrl)!.value ?? []) as string[]).includes(value);
  }

  get showOtroDesc(): boolean {
    return this.isChecked('mantenimientoEquipo', 'Otro');
  }
}
