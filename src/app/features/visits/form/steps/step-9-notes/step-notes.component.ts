import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { VisitFormStore } from '../../store/visit-form.store';
import { SignaturePadComponent } from '../../../../../shared/signature-pad/signature-pad.component';
import { OfflineService } from '../../../../../core/services/offline.service';

@Component({
  selector: 'app-step-notes',
  standalone: true,
  imports: [ReactiveFormsModule, SignaturePadComponent],
  templateUrl: './step-notes.component.html',
})
export class StepNotesComponent implements OnInit, OnDestroy {
  private fb       = inject(FormBuilder);
  readonly store   = inject(VisitFormStore);
  readonly offline = inject(OfflineService);
  private router   = inject(Router);
  private destroy  = new Subject<void>();

  readonly submitError = signal('');

  form = this.fb.group({
    notas: [this.store.formData().notas ?? ''],
    observacionesInspector: [this.store.formData().observacionesInspector ?? ''],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({
        notas: v.notas!,
        ...(this.store.isAdminEdit()
          ? { observacionesInspector: v.observacionesInspector! }
          : {}),
      });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }

  onSignatureChange(dataUrl: string): void {
    this.store.patchData({ firma: dataUrl });
  }

  get summaryRows(): { label: string; value: string }[] {
    const d = this.store.formData();
    return [
      { label: 'Fecha',       value: d.fecha       ?? '—' },
      { label: 'Tipo',        value: d.tipo === 'RUTINA' ? 'Rutinaria' : (d.tipo ?? '—') },
      { label: 'Colmenas',    value: String(this.store.hiveCount()) },
      { label: 'Cosecha miel',value: d.cosechaMiel  ? `${d.cosechaMielKg} kg` : 'No' },
      { label: 'Tratamiento', value: (d.tratamientoVarroa ?? []).join(', ') || 'Ninguno' },
      { label: 'Apiario',     value: d.apiarioId ?? '—' },
    ];
  }

  async submit(): Promise<void> {
    this.submitError.set('');
    this.store.patchData({
      notas: this.form.get('notas')!.value!,
      ...(this.store.isAdminEdit()
        ? { observacionesInspector: this.form.get('observacionesInspector')!.value! }
        : {}),
    });
    this.store.setSubmitting(true);
    try {
      if (this.store.isAdminEdit()) {
        await this.store.guardarEdicionAdmin();
        this.router.navigate(['/admin/reporte', this.store.reporteId()], {
          queryParams: { actualizado: '1' },
        });
        return;
      }
      const wasOffline = await this.store.enviarReporte();
      if (!wasOffline) await this.store.clearDraft();
      this.router.navigate(['/success'], {
        queryParams: { offline: wasOffline ? '1' : '0' }
      });
    } catch (err: any) {
      this.submitError.set(err?.error?.error?.details ?? err?.message ?? 'Error al enviar el reporte. Intenta de nuevo.');
    } finally {
      this.store.setSubmitting(false);
    }
  }

  saveDraft(): void {
    this.store.patchData({ notas: this.form.get('notas')!.value! });
    this.router.navigate(['/dashboard']);
  }
}
