import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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

  form = this.fb.nonNullable.group({
    notas: [this.store.formData().notas ?? ''],
    nombreFirmaApicultor: [this.store.formData().nombreFirmaApicultor ?? '', [Validators.required, Validators.pattern(/\S/)]],
    nombreFirmaInspector: [this.store.formData().nombreFirmaInspector ?? '', [Validators.required, Validators.pattern(/\S/)]],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroy)).subscribe(v => {
      this.store.patchData({
        notas: v.notas,
        nombreFirmaApicultor: v.nombreFirmaApicultor,
        nombreFirmaInspector: v.nombreFirmaInspector,
      });
    });
  }

  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }

  onApicultorSignatureChange(dataUrl: string): void {
    this.store.patchData({ firma: dataUrl });
  }

  onInspectorSignatureChange(dataUrl: string): void {
    this.store.patchData({ firmaInspector: dataUrl });
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
    const nombreFirmaApicultor = this.form.controls.nombreFirmaApicultor.value.trim();
    const nombreFirmaInspector = this.form.controls.nombreFirmaInspector.value.trim();
    this.store.patchData({
      notas: this.form.controls.notas.value,
      nombreFirmaApicultor,
      nombreFirmaInspector,
    });

    const data = this.store.formData();
    if (!data.firma || !nombreFirmaApicultor || !data.firmaInspector || !nombreFirmaInspector) {
      this.form.markAllAsTouched();
      this.submitError.set('Captura la firma y el nombre del apicultor y del inspector.');
      return;
    }

    this.store.setSubmitting(true);
    try {
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
    this.store.patchData({
      notas: this.form.controls.notas.value,
      nombreFirmaApicultor: this.form.controls.nombreFirmaApicultor.value.trim(),
      nombreFirmaInspector: this.form.controls.nombreFirmaInspector.value.trim(),
    });
    this.router.navigate(['/dashboard']);
  }
}
