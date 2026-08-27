import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SignaturePadComponent } from '../../shared/signature-pad/signature-pad.component';
import { AnnualInspectionApiService } from '../../core/services/annual-inspection-api.service';
import {
  AnnualInspectionRecord,
  AnnualQuestion,
  AnnualQuestionSection,
} from '../../core/models/annual-inspection.model';
import {
  APIARY_ANNUAL_SECTIONS,
  GENERAL_ANNUAL_SECTIONS,
} from './annual-inspection.questions';

type FormKind = 'general' | 'apiary';

@Component({
  selector: 'app-annual-inspection-form',
  standalone: true,
  imports: [ReactiveFormsModule, SignaturePadComponent],
  templateUrl: './annual-inspection-form.component.html',
})
export class AnnualInspectionFormComponent implements OnInit {
  private api = inject(AnnualInspectionApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly kind = this.route.snapshot.data['kind'] as FormKind;
  readonly apiaryId = this.route.snapshot.paramMap.get('id');
  readonly sections: AnnualQuestionSection[] = this.kind === 'general'
    ? GENERAL_ANNUAL_SECTIONS
    : APIARY_ANNUAL_SECTIONS;

  readonly form = new FormGroup<Record<string, FormControl<unknown>>>({});
  readonly record = signal<AnnualInspectionRecord | null>(null);
  readonly currentStep = signal(0);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly sending = signal(false);
  readonly error = signal('');
  readonly lastSaved = signal<string | null>(null);

  readonly currentSection = computed(() => this.sections[this.currentStep()]);
  readonly progress = computed(() => Math.round(((this.currentStep() + 1) / this.sections.length) * 100));
  readonly isReadOnly = computed(() => {
    const status = this.record()?.estado;
    return status === 'ENVIADO' || status === 'REVISADO';
  });

  constructor() {
    for (const section of this.sections) {
      for (const question of section.questions) {
        this.form.addControl(
          question.key,
          new FormControl<unknown>(
            question.type === 'checkbox' ? [] : null,
            question.mustBeTrue
              ? [this.trueAnswer]
              : question.required
                ? [this.requiredAnswer]
                : [],
          ),
        );
      }
    }
  }

  async ngOnInit(): Promise<void> {
    try {
      const response = this.kind === 'general'
        ? await this.api.getGeneral()
        : await this.api.getApiary(this.apiaryId!);
      this.record.set(response.data);
      this.lastSaved.set(response.data.updatedAt);
      this.patchAnswers(response.data);
      if (this.isReadOnly()) this.form.disable();
    } catch (error: any) {
      this.error.set(error?.error?.message ?? 'No fue posible cargar el formulario anual.');
    } finally {
      this.loading.set(false);
    }
  }

  get title(): string {
    return this.kind === 'general'
      ? 'Cuestionario Anual para la Inspección Interna de apiarios'
      : 'ANEXO';
  }

  get identityRows(): { label: string; value: string }[] {
    const data = this.record()?.datosIdentificacion ?? {};
    const labels = this.kind === 'general'
      ? [
          ['productor', 'Productor'],
          ['codigo', 'Código'],
          ['comunidad', 'Comunidad'],
          ['municipio', 'Municipio'],
          ['estado', 'Estado'],
          ['status', 'Status'],
          ['numeroApiarios', 'Número de apiarios'],
        ]
      : [
          ['nombreApicultor', 'Nombre del Apicultor'],
          ['codigo', 'Código'],
          ['nombreApiario', 'Nombre del apiario'],
          ['numeroColmenas', 'Número de colmenas'],
        ];

    return labels.map(([key, label]) => ({
      label,
      value: data[key] === undefined || data[key] === null || data[key] === '' ? '—' : String(data[key]),
    }));
  }

  control(question: AnnualQuestion): FormControl<unknown> {
    return this.form.controls[question.key];
  }

  isInvalid(question: AnnualQuestion): boolean {
    const control = this.control(question);
    return control.invalid && control.touched;
  }

  selectOption(question: AnnualQuestion, option: string): void {
    if (this.isReadOnly()) return;
    this.control(question).setValue(option);
    this.control(question).markAsTouched();
  }

  setBoolean(question: AnnualQuestion, value: boolean): void {
    if (this.isReadOnly()) return;
    this.control(question).setValue(value);
    this.control(question).markAsTouched();
  }

  toggleCheckbox(question: AnnualQuestion, option: string): void {
    if (this.isReadOnly()) return;
    const control = this.control(question);
    const current = Array.isArray(control.value) ? [...control.value as string[]] : [];
    const index = current.indexOf(option);
    if (index >= 0) current.splice(index, 1);
    else current.push(option);
    control.setValue(current);
    control.markAsTouched();
  }

  isSelected(question: AnnualQuestion, option: string): boolean {
    const value = this.control(question).value;
    return Array.isArray(value) ? value.includes(option) : value === option;
  }

  setSignature(question: AnnualQuestion, value: string): void {
    this.control(question).setValue(value);
    this.control(question).markAsTouched();
  }

  clearSignature(question: AnnualQuestion): void {
    if (this.isReadOnly()) return;
    this.control(question).setValue(null);
  }

  signatureValue(question: AnnualQuestion): string {
    const value = this.control(question).value;
    return typeof value === 'string' ? value : '';
  }

  async next(): Promise<void> {
    if (!this.validateCurrentSection()) return;
    await this.saveDraft();
    if (this.error()) return;
    this.currentStep.update((step) => Math.min(step + 1, this.sections.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  previous(): void {
    if (this.currentStep() === 0) {
      this.goOverview();
      return;
    }
    this.error.set('');
    this.currentStep.update((step) => Math.max(step - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async saveAndExit(): Promise<void> {
    await this.saveDraft();
    if (!this.error()) this.goOverview();
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.form.markAllAsTouched();
    this.validateConditionalAnswers();
    if (this.form.invalid) {
      const invalidStep = this.sections.findIndex((section) =>
        section.questions.some((question) => this.control(question).invalid)
      );
      if (invalidStep >= 0) this.currentStep.set(invalidStep);
      this.error.set('Revisa los campos requeridos antes de enviar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.sending.set(true);
    try {
      const respuestas = { ...this.form.getRawValue(), formularioCompleto: true };
      if (this.kind === 'general') {
        await this.api.saveGeneral(respuestas);
        await this.api.sendGeneral();
      } else {
        await this.api.saveApiary(this.apiaryId!, respuestas);
        await this.api.sendApiary(this.apiaryId!);
      }
      this.goOverview();
    } catch (error: any) {
      this.error.set(error?.error?.message ?? error?.error?.error?.details ?? 'No fue posible enviar el formulario.');
    } finally {
      this.sending.set(false);
    }
  }

  goOverview(): void {
    this.router.navigate(['/annual-inspection']);
  }

  private async saveDraft(): Promise<void> {
    if (this.isReadOnly()) return;
    this.error.set('');
    this.saving.set(true);
    try {
      const respuestas = { ...this.form.getRawValue(), formularioCompleto: false };
      const response = this.kind === 'general'
        ? await this.api.saveGeneral(respuestas)
        : await this.api.saveApiary(this.apiaryId!, respuestas);
      this.record.set(response.data);
      this.lastSaved.set(response.data.updatedAt ?? new Date().toISOString());
    } catch (error: any) {
      this.error.set(error?.error?.message ?? error?.error?.error?.details ?? 'No fue posible guardar el borrador.');
    } finally {
      this.saving.set(false);
    }
  }

  private validateCurrentSection(): boolean {
    const controls = this.currentSection().questions.map((question) => this.control(question));
    controls.forEach((control) => control.markAsTouched());
    if (controls.some((control) => control.invalid)) {
      this.error.set('Completa los campos requeridos de esta sección para continuar.');
      return false;
    }
    this.error.set('');
    return true;
  }

  private patchAnswers(record: AnnualInspectionRecord): void {
    const defaults: Record<string, unknown> = {};
    const identity = record.datosIdentificacion ?? {};
    if (this.kind === 'general') {
      defaults['fechaInspeccion'] = this.todayStr();
      defaults['localidad'] = identity['comunidad'] ?? '';
      defaults['municipio'] = identity['municipio'] ?? '';
    } else {
      defaults['localidad'] = identity['localidad'] ?? '';
      defaults['municipio'] = identity['municipio'] ?? '';
      defaults['totalCajas'] = identity['numeroColmenas'] ?? null;
    }
    this.form.patchValue({ ...defaults, ...(record.respuestas ?? {}) });
  }

  private todayStr(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private requiredAnswer(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '') return { required: true };
    if (Array.isArray(value) && value.length === 0) return { required: true };
    return null;
  }

  private trueAnswer(control: AbstractControl): ValidationErrors | null {
    return control.value === true ? null : { requiredTrue: true };
  }

  private validateConditionalAnswers(): void {
    if (this.kind === 'apiary') {
      this.setConditionalRequired(
        'aspectosNoCumplen',
        this.form.controls['cumplimientoNormas'].value !== 'a) Cumple',
      );
      return;
    }

    const dictamen = this.form.controls['dictamen'].value;
    this.setConditionalRequired('condicionesEstablecidas', dictamen === 'Aprobado con condiciones');
    this.setConditionalRequired('causaSancion', dictamen === 'Sancionado');
    this.setConditionalRequired('inicioSancion', dictamen === 'Sancionado');
    this.setConditionalRequired('terminoSancion', dictamen === 'Sancionado');
    this.setConditionalRequired('causasBaja', dictamen === 'Baja');
  }

  private setConditionalRequired(key: string, required: boolean): void {
    const control = this.form.controls[key];
    const value = control.value;
    const empty = value === null || value === undefined || value === '' ||
      (Array.isArray(value) && value.length === 0);
    const errors = { ...(control.errors ?? {}) };

    if (required && empty) errors['conditionalRequired'] = true;
    else delete errors['conditionalRequired'];

    control.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }
}
