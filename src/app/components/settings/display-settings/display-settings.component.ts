import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

interface CalendarSettings {
  id: number;
  user_id: string;
  daily_view: boolean;
  week_from_sunday: boolean;
  theme_id: number;
  view_type: string;
  themes?: { name: string; primary_color: string; secondary_color: string };
}

interface Theme {
  id: number;
  name: string;
  primary_color: string;
  secondary_color: string;
}

@Component({
  selector: 'app-display-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./display-settings.component.css'],
  template: `
    <div class="page-container">
      <div class="breadcrumb">
        <span class="breadcrumb-item" (click)="goToSettings()">הגדרות</span>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">הגדרות תצוגה</span>
      </div>
      
      <div class="page-header">
        <h1>הגדרות תצוגה</h1>
        <p class="page-description">התאם את תצוגת היומן והממשק לפי העדפותיך</p>
      </div>

      <div class="settings-form">
        <div class="settings-section">
          <div class="section-header">
            <h3>תצוגת יומן</h3>
            <p class="section-description">בחר איך תרצה לראות את היומן שלך</p>
          </div>

          <div class="setting-group">
            <label class="setting-label">סוג תצוגה</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  type="radio" 
                  name="daily_view" 
                  [value]="false"
                  [(ngModel)]="settings.daily_view"
                  (change)="onSettingChange()"
                >
                <div class="radio-content">
                  <i class="material-icons">view_week</i>
                  <div class="radio-text">
                    <span class="radio-title">תצוגה שבועית</span>
                    <span class="radio-description">הצג שבוע שלם ביומן</span>
                  </div>
                </div>
              </label>
              
              <label class="radio-option">
                <input 
                  type="radio" 
                  name="daily_view" 
                  [value]="true"
                  [(ngModel)]="settings.daily_view"
                  (change)="onSettingChange()"
                >
                <div class="radio-content">
                  <i class="material-icons">view_day</i>
                  <div class="radio-text">
                    <span class="radio-title">תצוגה יומית</span>
                    <span class="radio-description">הצג יום אחד בכל פעם</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="setting-group" *ngIf="!settings.daily_view">
            <label class="setting-label">התחלת שבוע</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  type="radio" 
                  name="week_from_sunday" 
                  [value]="false"
                  [(ngModel)]="settings.week_from_sunday"
                  (change)="onSettingChange()"
                >
                <div class="radio-content">
                  <i class="material-icons">today</i>
                  <div class="radio-text">
                    <span class="radio-title">שני-ראשון</span>
                    <span class="radio-description">השבוע מתחיל ביום שני</span>
                  </div>
                </div>
              </label>
              
              <label class="radio-option">
                <input 
                  type="radio" 
                  name="week_from_sunday" 
                  [value]="true"
                  [(ngModel)]="settings.week_from_sunday"
                  (change)="onSettingChange()"
                >
                <div class="radio-content">
                  <i class="material-icons">calendar_today</i>
                  <div class="radio-text">
                    <span class="radio-title">ראשון-שבת</span>
                    <span class="radio-description">השבוע מתחיל ביום ראשון</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-label">רמת פירוט</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  type="radio" 
                  name="view_type" 
                  value="compact"
                  [(ngModel)]="settings.view_type"
                  (change)="onSettingChange()"
                >
                <div class="radio-content">
                  <i class="material-icons">view_compact</i>
                  <div class="radio-text">
                    <span class="radio-title">תצוגה מקוצרת</span>
                    <span class="radio-description">הצג רק פרטים בסיסיים</span>
                  </div>
                </div>
              </label>
              
              <label class="radio-option">
                <input 
                  type="radio" 
                  name="view_type" 
                  value="detailed"
                  [(ngModel)]="settings.view_type"
                  (change)="onSettingChange()"
                >
                <div class="radio-content">
                  <i class="material-icons">view_list</i>
                  <div class="radio-text">
                    <span class="radio-title">תצוגה מפורטת</span>
                    <span class="radio-description">הצג את כל הפרטים</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header">
            <h3>ערכת נושא</h3>
            <p class="section-description">בחר את הצבעים והעיצוב של המערכת</p>
          </div>

          <div class="themes-grid">
            <div 
              *ngFor="let theme of themes" 
              class="theme-card"
              [class.selected]="settings.theme_id === theme.id"
              (click)="selectTheme(theme.id)"
            >
              <div class="theme-preview">
                <div 
                  class="color-primary" 
                  [style.background-color]="theme.primary_color"
                ></div>
                <div 
                  class="color-secondary" 
                  [style.background-color]="theme.secondary_color"
                ></div>
              </div>
              <div class="theme-name">{{ theme.name }}</div>
              <div class="theme-selected" *ngIf="settings.theme_id === theme.id">
                <i class="material-icons">check_circle</i>
              </div>
            </div>
          </div>
        </div>

        <div class="save-section">
          <div class="save-status" *ngIf="saveStatus">
            <i class="material-icons" [class.success]="saveStatus === 'success'" [class.error]="saveStatus === 'error'">
              {{ saveStatus === 'success' ? 'check_circle' : 'error' }}
            </i>
            <span>{{ saveStatusMessage }}</span>
          </div>
          
          <button 
            class="save-btn"
            (click)="saveSettings()"
            [disabled]="isSaving || !hasChanges"
          >
            <i class="material-icons" *ngIf="!isSaving">save</i>
            <i class="material-icons spinning" *ngIf="isSaving">sync</i>
            {{ isSaving ? 'שומר...' : 'שמור הגדרות' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class DisplaySettingsComponent implements OnInit {
  currentUser: any = null;
  calendarSettings: CalendarSettings | null = null;
  themes: Theme[] = [];
  isSaving = false;
  saveStatus: 'success' | 'error' | null = null;
  saveStatusMessage = '';
  hasChanges = false;
  originalSettings: any = null;

  settings = {
    daily_view: false,
    week_from_sunday: false,
    theme_id: 1,
    view_type: 'detailed'
  };

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {}

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
      this.loadCalendarSettings(),
      this.loadThemes()
    ]);
  }

  async loadCalendarSettings() {
    const { data, error } = await this.supabase.getCalendarSettings(this.currentUser.id);
    
    if (!error && data) {
      this.calendarSettings = data;
      this.settings = {
        daily_view: data.daily_view,
        week_from_sunday: data.week_from_sunday,
        theme_id: data.theme_id || 1,
        view_type: data.view_type || 'detailed'
      };
    } else if (error && error.code === 'PGRST116') {
      // No settings found, use defaults
      this.settings = {
        daily_view: false,
        week_from_sunday: false,
        theme_id: 1,
        view_type: 'detailed'
      };
    }

    // Store original settings for change detection
    this.originalSettings = { ...this.settings };
  }

  async loadThemes() {
    const { data, error } = await this.supabase.getThemes();
    if (!error && data) {
      this.themes = data;
    }
  }

  selectTheme(themeId: number) {
    this.settings.theme_id = themeId;
    this.onSettingChange();
  }

  onSettingChange() {
    // Check if settings have changed
    this.hasChanges = JSON.stringify(this.settings) !== JSON.stringify(this.originalSettings);
    
    // Clear save status when user makes changes
    this.saveStatus = null;
  }

  async saveSettings() {
    if (!this.currentUser || !this.hasChanges) {
      return;
    }

    this.isSaving = true;
    this.saveStatus = null;

    try {
      if (this.calendarSettings) {
        // עדכון הגדרות קיימות
        const { error } = await this.supabase.updateCalendarSettings(
          this.currentUser.id,
          this.settings
        );
        
        if (error) throw error;
      } else {
        // יצירת הגדרות חדשות
        const { error } = await this.supabase.createCalendarSettings({
          user_id: this.currentUser.id,
          ...this.settings
        });
        
        if (error) throw error;
      }

      this.saveStatus = 'success';
      this.saveStatusMessage = 'ההגדרות נשמרו בהצלחה!';
      this.hasChanges = false;
      this.originalSettings = { ...this.settings };
      
      // Reload settings to get updated data
      await this.loadCalendarSettings();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.saveStatus = null;
      }, 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      this.saveStatus = 'error';
      this.saveStatusMessage = 'שגיאה בשמירת ההגדרות. נסה שוב.';
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        this.saveStatus = null;
      }, 5000);
    } finally {
      this.isSaving = false;
    }
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}