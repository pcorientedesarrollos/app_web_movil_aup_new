import { Component, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-step-visit-data',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-visit-data.component.html',
})
export class StepVisitDataComponent implements OnInit, OnDestroy {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthService);
  readonly store  = inject(VisitFormStore);
  private destroy = new Subject<void>();

  readonly apiaries = computed(() =>
    (this.auth.currentUser()?.apiarios ?? []).map(a => ({
      id: a.id,
      label: `${a.nombre} · ${a.colmenas} COLMENAS`,
    }))
  );

  form = this.fb.group({
    fecha:    [this.store.formData().fecha    ?? this.todayStr()],
    tipo:     [this.store.formData().tipo     ?? 'RUTINA'],
    apiarios: [this.store.formData().apiarios ?? [] as string[]],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({ fecha: v.fecha!, tipo: v.tipo as any, apiarios: v.apiarios! });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }

  toggleApiary(id: string): void {
    const current: string[] = this.form.get('apiarios')!.value ?? [];
    const updated = current.includes(id) ? current.filter(a => a !== id) : [...current, id];
    this.form.get('apiarios')!.setValue(updated);
  }

  isApiarySelected(id: string): boolean {
    return (this.form.get('apiarios')!.value ?? []).includes(id);
  }

  private todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  next(): void { this.store.nextStep(); }
}
