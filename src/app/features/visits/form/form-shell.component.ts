import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VisitFormStore } from './store/visit-form.store';
import { StepVisitDataComponent }  from './steps/step-0-visit-data/step-visit-data.component';
import { StepHiveCountComponent }  from './steps/step-1-hive-count/step-hive-count.component';
import { StepMaintenanceComponent } from './steps/step-2-maintenance/step-maintenance.component';
import { StepFeedingComponent }    from './steps/step-3-feeding/step-feeding.component';
import { StepVarroaComponent }     from './steps/step-4-varroa/step-varroa.component';
import { StepPestControlComponent } from './steps/step-5-pest-control/step-pest-control.component';
import { StepWaxComponent }        from './steps/step-6-wax/step-wax.component';
import { StepQueenComponent }      from './steps/step-7-queen/step-queen.component';
import { StepHarvestComponent }    from './steps/step-8-harvest/step-harvest.component';
import { StepNotesComponent }      from './steps/step-9-notes/step-notes.component';

@Component({
  selector: 'app-form-shell',
  standalone: true,
  imports: [
    StepVisitDataComponent, StepHiveCountComponent, StepMaintenanceComponent,
    StepFeedingComponent, StepVarroaComponent, StepPestControlComponent,
    StepWaxComponent, StepQueenComponent, StepHarvestComponent, StepNotesComponent,
  ],
  templateUrl: './form-shell.component.html',
})
export class FormShellComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(VisitFormStore);

  readonly STEP_TITLES = [
    'Datos de la Visita',
    'Conteo de Colmenas',
    'Mantenimiento',
    'Alimentación',
    'Tratamiento Varroa',
    'Control de Plagas',
    'Cera',
    'Reemplazo de Reina',
    'Cosecha',
    'Notas y Firma',
  ];

  get stepTitle(): string {
    return this.STEP_TITLES[this.store.currentStep()];
  }

  goBack(): void {
    if (this.store.currentStep() === 0) {
      this.router.navigate(['/visits']);
    } else {
      this.store.prevStep();
    }
  }

  async ngOnInit(): Promise<void> {
    const visitaId = this.route.snapshot.queryParams['visitaId'];
    const nueva    = this.route.snapshot.queryParams['nueva'];
    if (visitaId) {
      await this.store.iniciarReporte(visitaId);
    } else if (nueva === '1') {
      await this.store.iniciarNuevaVisita();
    } else {
      await this.store.loadDraft();
    }
  }
}
