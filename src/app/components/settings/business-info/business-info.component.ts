import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

interface BusinessInfo {
  id: number;
  user_id: string;
  business_details: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-business-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./business-info.component.css'],
  template: `
    <div class="page-container">
      <div class="breadcrumb">
        <span class="breadcrumb-item" (click)="goToSettings()">הגדרות</span>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">מידע על העסק</span>
      </div>
      
      <div class="page-header">
        <h1>מידע על העסק</h1>
        <p class="page-description">הכנס פרטים על העסק שלך כדי שהבוט יוכל לענות לשאלות לקוחות</p>
      </div>

      <div class="business-info-form">
        <div class="form-section">
          <div class="section-header">
            <h3>פרטי העסק</h3>
            <p class="section-description">
              הכנס כאן את כל המידע הרלוונטי על העסק שלך. הבוט ישתמש במידע זה כדי לענות לשאלות לקוחות.
            </p>
          </div>

          <div class="suggestions-section">
            <h4>הצעות לפרטים שכדאי לכלול:</h4>
            <div class="suggestions-grid">
              <div class="suggestion-item" (click)="addSuggestion('כתובת')">
                <i class="material-icons">location_on</i>
                <span>כתובת העסק</span>
              </div>
              <div class="suggestion-item" (click)="addSuggestion('שעות פעילות')">
                <i class="material-icons">schedule</i>
                <span>שעות פעילות</span>
              </div>
              <div class="suggestion-item" (click)="addSuggestion('דרכי הגעה')">
                <i class="material-icons">directions</i>
                <span>דרכי הגעה</span>
              </div>
              <div class="suggestion-item" (click)="addSuggestion('חניה')">
                <i class="material-icons">local_parking</i>
                <span>מידע על חניה</span>
              </div>
              <div class="suggestion-item" (click)="addSuggestion('שאלות נפוצות')">
                <i class="material-icons">help</i>
                <span>שאלות נפוצות</span>
              </div>
              <div class="suggestion-item" (click)="addSuggestion('מחירים')">
                <i class="material-icons">attach_money</i>
                <span>מחירון</span>
              </div>
              <div class="suggestion-item" (click)="addSuggestion('ביטולים')">
                <i class="material-icons">cancel</i>
                <span>מדיניות ביטולים</span>
              </div>
              <div class="suggestion-item" (click)="addSuggestion('תשלומים')">
                <i class="material-icons">payment</i>
                <span>אמצעי תשלום</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="businessDetails">פרטי העסק *</label>
            <textarea 
              id="businessDetails"
              [(ngModel)]="businessDetails"
              name="businessDetails"
              placeholder="הכנס כאן את כל הפרטים הרלוונטיים על העסק שלך...

דוגמאות למה שכדאי לכלול:

📍 כתובת: רחוב הרצל 123, תל אביב
🕒 שעות פעילות: ראשון-חמישי 9:00-18:00, שישי 9:00-14:00
🚗 חניה: חניה חינם ברחוב או חניון בבניין
🚌 תחבורה ציבורית: אוטובוס קווים 4, 18, 25

💰 מחירון:
- מניקור רגיל: 80 ש״ח
- פדיקור רגיל: 120 ש״ח
- ג'ל: 150 ש״ח

❓ שאלות נפוצות:
- האם צריך להביא משהו? לא, יש לנו את כל הציוד
- כמה זמן לוקח טיפול? בין 45-90 דקות בהתאם לסוג
- איך מבטלים תור? עד 24 שעות מראש

💳 תשלומים: מזומן, אשראי, ביט, פייבוקס"
              rows="20"
              maxlength="5000"
              class="business-textarea"
              (input)="onBusinessDetailsChange()"
            ></textarea>
            <div class="char-count">
              <span [class.warning]="businessDetails.length > 4500">
                {{ businessDetails.length }}/5000 תווים
              </span>
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
              (click)="saveBusinessInfo()"
              [disabled]="isSaving || businessDetails.length === 0"
            >
              <i class="material-icons" *ngIf="!isSaving">save</i>
              <i class="material-icons spinning" *ngIf="isSaving">sync</i>
              {{ isSaving ? 'שומר...' : 'שמור פרטי העסק' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BusinessInfoComponent implements OnInit {
  businessDetails = '';
  currentUser: any = null;
  businessInfo: BusinessInfo | null = null;
  isSaving = false;
  saveStatus: 'success' | 'error' | null = null;
  saveStatusMessage = '';

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadBusinessInfo();
  }

  async loadCurrentUser() {
    this.currentUser = await this.supabase.getCurrentUser();
  }

  async loadBusinessInfo() {
    if (!this.currentUser) return;

    const { data, error } = await this.supabase.getBusinessInfo(this.currentUser.id);
    
    if (!error && data) {
      this.businessInfo = data;
      this.businessDetails = data.business_details || '';
    } else if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected for new users
      console.error('Error loading business info:', error);
    }
  }

  addSuggestion(suggestionType: string) {
    const suggestions: { [key: string]: string } = {
      'כתובת': '\n\n📍 כתובת: [הכנס כתובת]\n🚗 חניה: [מידע על חניה]\n🚌 תחבורה ציבורית: [קווי אוטובוס/רכבת]',
      'שעות פעילות': '\n\n🕒 שעות פעילות:\n- ראשון-חמישי: [שעות]\n- שישי: [שעות]\n- שבת: [פתוח/סגור]',
      'דרכי הגעה': '\n\n🗺️ דרכי הגעה:\n- ברכב: [הוראות נסיעה]\n- בתחבורה ציבורית: [פרטי קווים]\n- רגלית: [נקודות ציון]',
      'חניה': '\n\n🚗 חניה:\n- חניה חינם ברחוב\n- חניון בבניין (בתשלום)\n- חניה כחול לבן בסביבה',
      'שאלות נפוצות': '\n\n❓ שאלות נפוצות:\n- האם צריך להביא משהו? [תשובה]\n- כמה זמן לוקח טיפול? [תשובה]\n- איך מבטלים תור? [תשובה]',
      'מחירים': '\n\n💰 מחירון:\n- [שם טיפול]: [מחיר] ש״ח\n- [שם טיפול]: [מחיר] ש״ח\n- הנחות: [פרטי הנחות]',
      'ביטולים': '\n\n🚫 מדיניות ביטולים:\n- ביטול עד 24 שעות מראש - ללא חיוב\n- ביטול פחות מ-24 שעות - [מדיניות]\n- אי הגעה - [מדיניות]',
      'תשלומים': '\n\n💳 אמצעי תשלום:\n- מזומן\n- כרטיס אשראי\n- ביט\n- פייבוקס\n- העברה בנקאית'
    };

    const suggestion = suggestions[suggestionType];
    if (suggestion) {
      this.businessDetails += suggestion;
    }
  }

  onBusinessDetailsChange() {
    // Clear save status when user types
    this.saveStatus = null;
  }

  async saveBusinessInfo() {
    if (!this.currentUser || this.businessDetails.length === 0) {
      return;
    }

    this.isSaving = true;
    this.saveStatus = null;

    try {
      if (this.businessInfo) {
        // עדכון מידע קיים
        const { error } = await this.supabase.updateBusinessInfo(
          this.currentUser.id,
          { business_details: this.businessDetails.trim() }
        );
        
        if (error) throw error;
      } else {
        // יצירת מידע חדש
        const { error } = await this.supabase.createBusinessInfo({
          user_id: this.currentUser.id,
          business_details: this.businessDetails.trim()
        });
        
        if (error) throw error;
      }

      this.saveStatus = 'success';
      this.saveStatusMessage = 'פרטי העסק נשמרו בהצלחה!';
      
      // Reload business info to get updated data
      await this.loadBusinessInfo();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.saveStatus = null;
      }, 3000);
      
    } catch (error) {
      console.error('Error saving business info:', error);
      this.saveStatus = 'error';
      this.saveStatusMessage = 'שגיאה בשמירת הפרטים. נסה שוב.';
      
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