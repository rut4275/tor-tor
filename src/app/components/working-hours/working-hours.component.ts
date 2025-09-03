import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface WorkingHour {
  id: number;
  user_id: string;
  weekday_id: number;
  start_time: string;
  end_time: string;
  preference_id: number;
  weekdays?: { name: string };
  preferences?: { level: string };
}

interface Weekday {
  id: number;
  name: string;
}

interface Preference {
  id: number;
  level: string;
}

@Component({
  selector: 'app-working-hours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./working-hours.component.css'],
  template: `
    <div class="working-hours-container">
      <div class="working-hours-header">
        <h1>שעות עבודה</h1>
       
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
            <button 
              class="add-hours-btn"
              (click)="openAddHoursModal(day)"
              title="הוסף שעות עבודה"
            >
              <i class="material-icons">add</i>
            </button>
          </div>
          
          <div class="day-working-hours">
            <div 
              *ngFor="let workingHour of getWorkingHoursForDay(day.id)"
              class="working-hour-block"
              [style.top.px]="getWorkingHourTop(workingHour.start_time)"
              [style.height.px]="getWorkingHourHeight(workingHour.start_time, workingHour.end_time)"
              [class]="getPreferenceClass(workingHour.preference_id)"
              (click)="editWorkingHour(workingHour)"
            >
              <div class="working-hour-time">
                {{ formatTime(workingHour.start_time) }} - {{ formatTime(workingHour.end_time) }}
              </div>
              <div class="working-hour-preference">
                {{ getPreferenceLevel(workingHour.preference_id) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- מודל הוספת/עריכת שעות עבודה -->
    <div 
      *ngIf="showWorkingHoursModal" 
      class="modal-overlay"
      (click)="closeWorkingHoursModal()"
    >
      <div 
        class="modal-content"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3>{{ isEditMode ? 'עריכת שעות עבודה' : 'הוספת שעות עבודה' }}</h3>
          <div class="header-actions" *ngIf="isEditMode">
            <button 
              class="delete-btn"
              (click)="deleteWorkingHour()"
              title="מחיקה"
            >
              <i class="material-icons">delete</i>
            </button>
          </div>
          <button 
            class="close-btn"
            (click)="closeWorkingHoursModal()"
          >
            ×
          </button>
        </div>
        
        <form class="working-hours-form">
          <div class="form-group">
            <label>יום בשבוע</label>
            <input 
              type="text" 
              [value]="selectedDay?.name || ''"
              readonly
              class="readonly-input"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>שעת התחלה *</label>
              <input 
                type="time" 
                [(ngModel)]="newWorkingHour.start_time"
                name="start_time"
                required
              >
            </div>

            <div class="form-group">
              <label>שעת סיום *</label>
              <input 
                type="time" 
                [(ngModel)]="newWorkingHour.end_time"
                name="end_time"
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label>רמת העדפה *</label>
            <select [(ngModel)]="newWorkingHour.preference_id" name="preference" required>
              <option value="">בחר רמת העדפה</option>
              <option 
                *ngFor="let preference of preferences" 
                [value]="preference.id"
              >
                {{ preference.level }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button 
              type="button"
              class="cancel-btn"
              (click)="closeWorkingHoursModal()"
            >
              ביטול
            </button>
            <button 
              type="button"
              class="save-btn"
              (click)="saveWorkingHour()"
              [disabled]="!isFormValid()"
            >
              {{ isEditMode ? 'עדכן' : 'שמור' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- מודל אישור מחיקה -->
    <div 
      *ngIf="showDeleteConfirmModal" 
      class="modal-overlay"
      (click)="closeDeleteConfirmModal()"
    >
      <div 
        class="modal-content delete-modal"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3>אישור מחיקה</h3>
          <button 
            class="close-btn"
            (click)="closeDeleteConfirmModal()"
          >
            ×
          </button>
        </div>
        
        <div class="delete-content">
          <p>האם אתה בטוח שברצונך למחוק את {{ deleteType === 'working-hour' ? 'שעות העבודה' : 'רמת ההעדפה' }}?</p>
          <div class="item-to-delete" *ngIf="deleteType === 'working-hour' && workingHourToDelete">
            <strong>{{ selectedDay?.name }} - {{ formatTime(workingHourToDelete.start_time) }} עד {{ formatTime(workingHourToDelete.end_time) }}</strong>
          </div>
          <div class="item-to-delete" *ngIf="deleteType === 'preference' && preferenceToDelete">
            <strong>{{ preferenceToDelete.level }}</strong>
          </div>
          <p class="warning-text">פעולה זו לא ניתנת לביטול</p>
          
          <div class="delete-actions">
            <button 
              class="cancel-delete-btn"
              (click)="closeDeleteConfirmModal()"
            >
              ביטול
            </button>
            <button 
              class="confirm-delete-btn"
              (click)="confirmDelete()"
            >
              מחק
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WorkingHoursComponent implements OnInit {
  weekDays: Weekday[] = [];
  workingHours: WorkingHour[] = [];
  preferences: Preference[] = [];
  timeSlots: string[] = [];
  currentUser: any = null;
  
  showWorkingHoursModal = false;
  showPreferencesModal = false;
  showDeleteConfirmModal = false;
  isEditMode = false;
  selectedDay: Weekday | null = null;
  editingWorkingHourId: number | null = null;
  workingHourToDelete: WorkingHour | null = null;
  preferenceToDelete: Preference | null = null;
  deleteType: 'working-hour' | 'preference' = 'working-hour';
  
  newWorkingHour = {
    start_time: '',
    end_time: '',
    preference_id: ''
  };
  
  newPreferenceLevel = '';

  constructor(private supabase: SupabaseService) {
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
      this.loadWeekdays(),
      this.loadWorkingHours(),
      this.loadPreferences()
    ]);
  }

  async loadWeekdays() {
    const { data, error } = await this.supabase.client
      .from('weekdays')
      .select('*')
      .order('id');

    if (!error && data) {
      this.weekDays = data;
    } else {
      // יצירת ימי השבוע אם לא קיימים
      await this.createDefaultWeekdays();
    }
  }

  async createDefaultWeekdays() {
    const defaultDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    
    for (const dayName of defaultDays) {
      await this.supabase.client
        .from('weekdays')
        .insert({
          name: dayName,
        });
    }
    
    await this.loadWeekdays();
  }

  async loadWorkingHours() {
    const { data, error } = await this.supabase.client
      .from('working_hours')
      .select(`
        *,
        weekdays(name),
        preferences(level)
      `)
      .eq('user_id',this.currentUser.id)
      .order('weekday_id')
      .order('start_time');

    if (!error && data) {
      this.workingHours = data;
    }
  }

  async loadPreferences() {
    const { data, error } = await this.supabase.client
      .from('preferences')
      .select('*')
      .order('id');

    if (!error && data) {
      this.preferences = data;
    } else {
      // יצירת העדפות ברירת מחדל אם לא קיימות
      await this.createDefaultPreferences();
    }
  }

  async createDefaultPreferences() {
    const defaultPreferences = ['גבוהה', 'בינונית', 'נמוכה'];
    
    for (const level of defaultPreferences) {
      await this.supabase.client
        .from('preferences')
        .insert({
          level: level,
        });
    }
    
    await this.loadPreferences();
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 6; hour < 24; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  getWorkingHoursForDay(weekdayId: number): WorkingHour[] {
    return this.workingHours.filter(wh => wh.weekday_id === weekdayId);
  }

  getWorkingHourTop(startTime: string): number {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = (hours - 6) * 60 + minutes;
    return totalMinutes;
  }

  getWorkingHourHeight(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  }

  getPreferenceClass(preferenceId: number): string {
    const preference = this.preferences.find(p => p.id === preferenceId);
    if (!preference) return 'preference-default';
    
    switch (preference.level.toLowerCase()) {
      case 'גבוהה':
        return 'preference-high';
      case 'בינונית':
        return 'preference-medium';
      case 'נמוכה':
        return 'preference-low';
      default:
        return 'preference-default';
    }
  }

  getPreferenceLevel(preferenceId: number): string {
    const preference = this.preferences.find(p => p.id === preferenceId);
    return preference?.level || '';
  }

  formatTime(time: string): string {
    return time ? time.slice(0, 5) : '';
  }

  openAddHoursModal(day: Weekday) {
    this.selectedDay = day;
    this.showWorkingHoursModal = true;
    this.isEditMode = false;
    this.editingWorkingHourId = null;
    this.newWorkingHour = {
      start_time: '09:00',
      end_time: '17:00',
      preference_id: ''
    };
  }

  closeWorkingHoursModal() {
    this.showWorkingHoursModal = false;
    this.isEditMode = false;
    this.selectedDay = null;
    this.editingWorkingHourId = null;
  }

  editWorkingHour(workingHour: WorkingHour) {
    this.isEditMode = true;
    this.editingWorkingHourId = workingHour.id;
    this.selectedDay = this.weekDays.find(d => d.id === workingHour.weekday_id) || null;
    this.showWorkingHoursModal = true;
    
    this.newWorkingHour = {
      start_time: workingHour.start_time,
      end_time: workingHour.end_time,
      preference_id: workingHour.preference_id.toString()
    };
  }

  async saveWorkingHour() {
    if (!this.currentUser || !this.selectedDay || !this.isFormValid()) {
      return;
    }

    const workingHourData = {
      user_id: this.currentUser.id,
      weekday_id: this.selectedDay.id,
      start_time: this.newWorkingHour.start_time,
      end_time: this.newWorkingHour.end_time,
      preference_id: parseInt(this.newWorkingHour.preference_id)
    };

    if (this.isEditMode && this.editingWorkingHourId) {
      const { error } = await this.supabase.client
        .from('working_hours')
        .update(workingHourData)
        .eq('id', this.editingWorkingHourId);
      
      if (!error) {
        this.closeWorkingHoursModal();
        await this.loadWorkingHours();
      }
    } else {
      const { error } = await this.supabase.client
        .from('working_hours')
        .insert(workingHourData);
      
      if (!error) {
        this.closeWorkingHoursModal();
        await this.loadWorkingHours();
      }
    }
  }

  deleteWorkingHour() {
    if (!this.editingWorkingHourId) return;
    
    this.workingHourToDelete = this.workingHours.find(wh => wh.id === this.editingWorkingHourId) || null;
    this.deleteType = 'working-hour';
    this.showDeleteConfirmModal = true;
    this.showWorkingHoursModal = false;
  }

  // openPreferencesModal() {
  //   this.showPreferencesModal = true;
  // }

  // closePreferencesModal() {
  //   this.showPreferencesModal = false;
  //   this.newPreferenceLevel = '';
  // }



  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.workingHourToDelete = null;
    this.preferenceToDelete = null;
  }

  async confirmDelete() {
    if (this.deleteType === 'working-hour' && this.workingHourToDelete) {
      const { error } = await this.supabase.client
        .from('working_hours')
        .delete()
        .eq('id', this.workingHourToDelete.id);
      
      if (!error) {
        await this.loadWorkingHours();
      }
    } 
    
    this.closeDeleteConfirmModal();
  }

  isFormValid(): boolean {
    return !!(this.newWorkingHour.start_time && 
              this.newWorkingHour.end_time && 
              this.newWorkingHour.preference_id);
  }

  trackPreference(index: number, preference: Preference): number {
    return preference.id;
  }
}