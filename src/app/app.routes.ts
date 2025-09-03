import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LoginComponent } from './components/auth/login.component';
import { ClientsComponent } from './components/clients/clients.component';
import { TreatmentsComponent } from './components/treatments/treatments.component';
import { WorkingHoursComponent } from './components/working-hours/working-hours.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ChatMessagesComponent } from './components/settings/chat-messages/chat-messages.component';
import { ClientDetailsComponent } from './components/settings/client-details/client-details.component';
import { AppointmentDetailsComponent } from './components/settings/appointment-details/appointment-details.component';
import { DisplaySettingsComponent } from './components/settings/display-settings/display-settings.component';
import { BusinessInfoComponent } from './components/settings/business-info/business-info.component';

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
      { path: 'settings', component: SettingsComponent },
      { path: 'settings/chat-messages', component: ChatMessagesComponent },
      { path: 'settings/client-details', component: ClientDetailsComponent },
      { path: 'settings/appointment-details', component: AppointmentDetailsComponent },
      { path: 'settings/display-settings', component: DisplaySettingsComponent },
      { path: 'settings/business-info', component: BusinessInfoComponent },
      { path: '', redirectTo: '/calendar', pathMatch: 'full' }
    ]
  }
];
