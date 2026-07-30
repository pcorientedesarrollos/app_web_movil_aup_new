import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';

@Component({
  selector: 'app-step-varroa',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-varroa.component.html',
})
export class StepVarroaComponent implements OnInit, OnDestroy {
  private fb      = inject(FormBuilder);
  readonly store  = inject(VisitFormStore);
  private destroy = new Subject<void>();

  readonly treatments = ['Timol', 'Ácido oxálico', 'Ácido fórmico', 'Corte de cría de zángano'];

  form = this.fb.group({
    tratamientoVarroa: [this.store.formData().tratamientoVarroa ?? [] as string[]],
    dosisVarroa:       [this.store.formData().dosisVarroa       ?? ''],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({ tratamientoVarroa: v.tratamientoVarroa!, dosisVarroa: v.dosisVarroa! });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }

  toggle(value: string): void {
    const arr: string[] = this.form.get('tratamientoVarroa')!.value ?? [];
    const updated = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    this.form.get('tratamientoVarroa')!.setValue(updated);
  }

  isChecked(value: string): boolean {
    return ((this.form.get('tratamientoVarroa')!.value ?? []) as string[]).includes(value);
  }
}
