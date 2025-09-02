import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Appointment {
  id: number;
  client_id: number;
  treatment_id: number;
  date: string;
  start_time: string;
  end_time: string;
  clients?: { name: string; phone: string };
  treatments?: { name: string; duration_minutes: number; price: number };
  notes?: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./calendar.component.css'],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <button 
          class="nav-btn" 
          (click)="previousWeek()"
        >
          ←
        </button>
        
        <h2 class="week-title">
          {{ getWeekTitle() }}
        </h2>
        
        <button 
          class="nav-btn" 
          (click)="nextWeek()"
        >
          →
        </button>
        
        <button 
          class="new-appointment-btn"
          (click)="openNewAppointmentModal()"
        >
          + תור חדש
        </button>
      </div>

      <div class="calendar-grid">
        <div class="time-column">
          <div class="time-header"></div>
          <div 
            *ngFor="let hour of timeSlots" 
            class="time-slot"
          >
            {{ hour }}
          </div>
        </div>

        <div 
          *ngFor="let day of weekDays" 
          class="day-column"
        >
          <div class="day-header">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ day.date | date:'dd/MM' }}</div>
          </div>
          
          <div class="day-appointments">
            <div 
              *ngFor="let appointment of getAppointmentsForDay(day.date)"
              class="appointment"
              [style.top.px]="getAppointmentTop(appointment.start_time)"
              [style.height.px]="getAppointmentHeight(appointment.start_time, appointment.end_time)"
              (click)="editAppointment(appointment)"
            >
              <div class="appointment-time">
                {{ appointment.start_time }} - {{ appointment.end_time }}
              </div>
              <div class="appointment-client">
                {{ appointment.clients?.name || 'לקוח לא ידוע' }}
              </div>
              <div class="appointment-treatment">
                {{ appointment.treatments?.name || 'טיפול לא ידוע' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- מודל תור חדש -->
    <div 
      *ngIf="showNewAppointmentModal" 
      class="modal-overlay"
      (click)="closeNewAppointmentModal()"
    >
      <div 
        class="modal-content"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3 [class.edit-mode]="isEditMode">
            {{ isEditMode ? 'עריכת תור' : 'תור חדש' }}
          </h3>
          <button 
            class="close-btn"
            (click)="closeNewAppointmentModal()"
          >
            ×
          </button>
        </div>
        
        <form class="appointment-form">
          <div class="form-group">
            <label>לקוח</label>
            <select [(ngModel)]="newAppointment.client_id" name="client">
              <option value="">בחר לקוח</option>
              <option 
                *ngFor="let client of clients" 
                [value]="client.id"
              >
                {{ client.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>טיפול</label>
            <select [(ngModel)]="newAppointment.treatment_id" name="treatment">
              <option value="">בחר טיפול</option>
              <option 
                *ngFor="let treatment of treatments" 
                [value]="treatment.id"
              >
                {{ treatment.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>תאריך</label>
            <input 
              type="date" 
              [(ngModel)]="newAppointment.date"
              name="date"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>שעת התחלה</label>
              <input 
                type="time" 
                [(ngModel)]="newAppointment.start_time"
                name="start_time"
              >
            </div>

            <div class="form-group">
              <label>שעת סיום</label>
              <input 
                type="time" 
                [(ngModel)]="newAppointment.end_time"
                name="end_time"
              >
            </div>
          </div>

          <div class="form-group">
            <label>הערות</label>
            <textarea 
              [(ngModel)]="newAppointment.notes"
              name="notes"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button 
              type="button"
              class="cancel-btn"
              (click)="closeNewAppointmentModal()"
            >
              ביטול
            </button>
            <button 
              type="button"
              class="save-btn"
              (click)="saveNewAppointment()"
            >
              {{ isEditMode ? 'עדכן' : 'שמור' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  currentWeekStart = new Date();
  weekDays: any[] = [];
  timeSlots: string[] = [];
  appointments: Appointment[] = [];
  clients: any[] = [];
  treatments: any[] = [];
  showNewAppointmentModal = false;
  currentUser: any = null;
  isEditMode = false;
  editingAppointmentId: number | null = null;

  newAppointment = {
    client_id: '',
    treatment_id: '',
    date: '',
    start_time: '',
    end_time: '',
    notes: ''
  };

  constructor(private supabase: SupabaseService) {
    this.initializeWeek();
    this.generateTimeSlots();
  }

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadData();
  }

  async loadCurrentUser() {
    this.currentUser = await this.supabase.getCurrentUser();
  }

  async loadData() {
    if (!this.currentUser) return;

    await Promise.all([
      this.loadAppointments(),
      this.loadClients(),
      this.loadTreatments()
    ]);
  }

  async loadAppointments() {
    const startDate = this.formatDate(this.weekDays[0].date);
    const endDate = this.formatDate(this.weekDays[6].date);

    const { data, error } = await this.supabase.getAppointments(
      this.currentUser.id,
      startDate,
      endDate
    );

    if (!error && data) {
      this.appointments = data;
    }
  }

  async loadClients() {
    const { data, error } = await this.supabase.getClients(this.currentUser.id);
    if (!error && data) {
      this.clients = data;
    }
  }

  async loadTreatments() {
    const { data, error } = await this.supabase.getTreatments(this.currentUser.id);
    if (!error && data) {
      this.treatments = data;
    }
  }

  initializeWeek() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    this.currentWeekStart = monday;
    this.generateWeekDays();
  }

  generateWeekDays() {
    this.weekDays = [];
    const dayNames = ['ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\'', 'א\''];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      
      this.weekDays.push({
        name: dayNames[i],
        date: date,
        fullName: this.getDayFullName(i)
      });
    }
  }

  getDayFullName(dayIndex: number): string {
    const fullNames = ['שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת', 'ראשון'];
    return fullNames[dayIndex];
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 8; hour < 24; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  getWeekTitle(): string {
    const start = this.weekDays[0].date;
    const end = this.weekDays[6].date;
    
    const startFormatted = start.toLocaleDateString('he-IL', { 
      day: 'numeric', 
      month: 'long' 
    });
    const endFormatted = end.toLocaleDateString('he-IL', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.generateWeekDays();
    this.loadAppointments();
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.generateWeekDays();
    this.loadAppointments();
  }

  getAppointmentsForDay(date: Date): Appointment[] {
    const dateStr = this.formatDate(date);
    return this.appointments.filter(apt => apt.date === dateStr);
  }

  getAppointmentTop(startTime: string): number {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = (hours - 8) * 60 + minutes;
    return totalMinutes;
  }

  getAppointmentHeight(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  }

  openNewAppointmentModal() {
    this.showNewAppointmentModal = true;
    this.isEditMode = false;
    this.editingAppointmentId = null;
    this.newAppointment = {
      client_id: '',
      treatment_id: '',
      date: '',
      start_time: '',
      end_time: '',
      notes: ''
    };
  }

  closeNewAppointmentModal() {
    this.showNewAppointmentModal = false;
    this.isEditMode = false;
    this.editingAppointmentId = null;
  }

  async saveNewAppointment() {
    if (!this.currentUser || !this.newAppointment.client_id || !this.newAppointment.treatment_id) {
      return;
    }

    if (this.isEditMode && this.editingAppointmentId) {
      // עריכת תור קיים
      const updateData = {
        client_id: parseInt(this.newAppointment.client_id),
        treatment_id: parseInt(this.newAppointment.treatment_id),
        date: this.newAppointment.date,
        start_time: this.newAppointment.start_time,
        end_time: this.newAppointment.end_time,
        notes: this.newAppointment.notes
      };

      const { error } = await this.supabase.updateAppointment(this.editingAppointmentId, updateData);
      
      if (!error) {
        this.closeNewAppointmentModal();
        await this.loadAppointments();
      }
    } else {
      // יצירת תור חדש
      const appointmentData = {
        ...this.newAppointment,
        user_id: this.currentUser.id,
        client_id: parseInt(this.newAppointment.client_id),
        treatment_id: parseInt(this.newAppointment.treatment_id)
      };

      const { error } = await this.supabase.createAppointment(appointmentData);
      
      if (!error) {
        this.closeNewAppointmentModal();
        await this.loadAppointments();
      }
    }
  }

  editAppointment(appointment: Appointment) {
    this.isEditMode = true;
    this.editingAppointmentId = appointment.id;
    this.showNewAppointmentModal = true;
    
    // מילוי הטופס עם נתוני התור הקיים
    this.newAppointment = {
      client_id: appointment.client_id.toString(),
      treatment_id: appointment.treatment_id.toString(),
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      notes: appointment.notes || ''
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}