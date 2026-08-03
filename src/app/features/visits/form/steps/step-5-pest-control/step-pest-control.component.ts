import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';

@Component({
  selector: 'app-step-pest-control',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-pest-control.component.html',
})
export class StepPestControlComponent implements OnInit, OnDestroy {
  private fb      = inject(FormBuilder);
  readonly store  = inject(VisitFormStore);
  private destroy = new Subject<void>();

  readonly pests = ['Xulab', 'PEC', 'Polilla'];

  form = this.fb.group({
    plagasDetectadas: [this.store.formData().plagasDetectadas ?? [] as string[]],
    metodoControl:    [this.store.formData().metodoControl    ?? ''],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({ plagasDetectadas: v.plagasDetectadas!, metodoControl: v.metodoControl! });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }

  toggle(value: string): void {
    const arr: string[] = this.form.get('plagasDetectadas')!.value ?? [];
    const updated = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    this.form.get('plagasDetectadas')!.setValue(updated);
  }

  isChecked(value: string): boolean {
    return ((this.form.get('plagasDetectadas')!.value ?? []) as string[]).includes(value);
  }
}
