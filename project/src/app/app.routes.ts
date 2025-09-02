import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LoginComponent } from './components/auth/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: LayoutComponent,
    children: [
      { path: 'calendar', component: CalendarComponent },
      { path: 'treatments', component: CalendarComponent }, // TODO: רכיב טיפולים
      { path: 'clients', component: CalendarComponent }, // TODO: רכיב לקוחות
      { path: 'rules', component: CalendarComponent }, // TODO: רכיב כללים
      { path: 'working-hours', component: CalendarComponent }, // TODO: רכיב שעות עבודה
      { path: 'settings', component: CalendarComponent }, // TODO: רכיב הגדרות
      { path: '', redirectTo: '/calendar', pathMatch: 'full' }
    ]
  }
];