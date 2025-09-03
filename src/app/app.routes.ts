import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LoginComponent } from './components/auth/login.component';
import { ClientsComponent } from './components/clients/clients.component';
import { TreatmentsComponent } from './components/treatments/treatments.component';
import { WorkingHoursComponent } from './components/working-hours/working-hours.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: LayoutComponent,
    children: [
      { path: 'calendar', component: CalendarComponent },
      { path: 'treatments', component: TreatmentsComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'rules', component: CalendarComponent }, // TODO: רכיב כללים
      { path: 'working-hours', component: WorkingHoursComponent },
      { path: 'settings', component: CalendarComponent }, // TODO: רכיב הגדרות
      { path: '', redirectTo: '/calendar', pathMatch: 'full' }
    ]
  }
];
