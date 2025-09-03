import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Treatment {
  id: number;
  name: string;
  duration_minutes: number;
  fixed_duration: boolean;
  fixed_price: boolean;
  price: number;
  price_per_minutes: number;
  min_interval_minutes: number;
  user_id: string;
}

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./treatments.component.css'],
  template: `
    <div class="treatments-container">
      <div class="treatments-header">
        <h1>סוגי טיפולים</h1>
        <button 
          class="add-treatment-btn"
          (click)="openNewTreatmentModal()"
        >
          + טיפול חדש
        </button>
      </div>

      <div class="search-section">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            (input)="filterTreatments()"
            placeholder="חיפוש טיפול (שם, מחיר, משך)"
            class="search-input"
          >
          <i class="material-icons search-icon">search</i>
        </div>
        
        <div class="filter-stats">
          <span>{{ filteredTreatments.length }} מתוך {{ treatments.length }} טיפולים</span>
        </div>
      </div>

      <div class="treatments-grid">
        <div 
          *ngFor="let treatment of filteredTreatments" 
          class="treatment-card"
          (click)="openTreatmentDetails(treatment)"
        >
          <div class="treatment-icon">
             <i class="material-icons">spa</i>
          </div>
          
          <div class="treatment-info">
            <h3 class="treatment-name">{{ treatment.name }}</h3>
            
            <div class="treatment-details">
              <div class="detail-item" *ngIf="treatment.fixed_duration">
                <i class="material-icons detail-icon">schedule</i>
                <span class="detail-text">
                  {{ treatment.duration_minutes }} דקות
                </span>
              </div>
              
              <div class="detail-item" *ngIf="!treatment.fixed_duration && treatment.min_interval_minutes > 0">
                <i class="material-icons detail-icon">timer</i>
                <span class="detail-text">
                  יחידת זמן: {{ treatment.min_interval_minutes }} דקות
                </span>
              </div>
              
              <div class="detail-item" *ngIf="treatment.fixed_price">
                <i class="material-icons detail-icon">attach_money</i>
                <span class="detail-text">
                  ₪{{ treatment.price }}
                </span>
              </div>
              
              <div class="detail-item" *ngIf="!treatment.fixed_price">
                <i class="material-icons detail-icon">calculate</i>
                <span class="detail-text">
                  ₪{{ treatment.price }} לכל {{ treatment.price_per_minutes }} דקות
                </span>
              </div>
            </div>
          </div>
          
          <div class="treatment-actions">
            <button 
              class="edit-btn"
              (click)="editTreatment(treatment, $event)"
              title="עריכה"
            >
              <i class="material-icons">edit</i>
            </button>
            <button 
              class="delete-btn"
              (click)="deleteTreatment(treatment, $event)"
              title="מחיקה"
            >
              <i class="material-icons">delete</i>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="filteredTreatments.length === 0" class="empty-state">
        <h3>לא נמצאו טיפולים</h3>
        <p *ngIf="searchTerm">נסה לשנות את מונחי החיפוש</p>
        <p *ngIf="!searchTerm">עדיין לא הוספת טיפולים למערכת</p>
        <button 
          class="add-first-treatment-btn"
          (click)="openNewTreatmentModal()"
        >
          הוסף טיפול ראשון
        </button>
      </div>
    </div>

    <!-- מודל טיפול חדש/עריכה -->
    <div 
      *ngIf="showTreatmentModal" 
      class="modal-overlay"
      (click)="closeTreatmentModal()"
    >
      <div 
        class="modal-content"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3 [class.edit-mode]="isEditMode">{{ isEditMode ? 'עריכת טיפול' : 'טיפול חדש' }}</h3>
          <button 
            class="close-btn"
            (click)="closeTreatmentModal()"
          >
            ×
          </button>
        </div>
        
        <form class="treatment-form">
          <div class="form-group">
            <label>שם הטיפול *</label>
            <input 
              type="text" 
              [(ngModel)]="newTreatment.name"
              name="name"
              required
              placeholder="הכנס שם טיפול"
              maxlength="100"
            >
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="newTreatment.fixed_duration"
                name="fixed_duration"
              >
              <span class="checkbox-text">אורך קבוע</span>
              <small class="checkbox-help">אם לא מסומן, הלקוח יוכל לבחור אורך טיפול</small>
            </label>
          </div>

          <div class="form-group" *ngIf="newTreatment.fixed_duration">
            <label>אורך הטיפול בדקות *</label>
            <input 
              type="number" 
              [(ngModel)]="newTreatment.duration_minutes"
              name="duration_minutes"
              required
              min="1"
              max="1000"
              placeholder="60"
            >
          </div>

          <div class="form-group" *ngIf="!newTreatment.fixed_duration">
            <label>יחידת זמן להזמנת תור (דקות) *</label>
            <input 
              type="number" 
              [(ngModel)]="newTreatment.min_interval_minutes"
              name="min_interval_minutes"
              required
              min="1"
              max="1000"
              placeholder="15"
            >
            <small class="field-help">בחרו את אורך הזמן במינימום להזמנת תור. למשל, אם נבחר 15 דקות – הלקוח יוכל לבחור תורים ב-15, 30, 45 דקות וכן הלאה</small>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="newTreatment.fixed_price"
                name="fixed_price"
              >
              <span class="checkbox-text">מחיר קבוע</span>
              <small class="checkbox-help">אם לא מסומן, המחיר יחושב לפי זמן</small>
            </label>
          </div>

          <div class="form-group" *ngIf="!newTreatment.fixed_price">
            <label>מחיר לכל כמה דקות *</label>
            <input 
              type="number" 
              [(ngModel)]="newTreatment.price_per_minutes"
              name="price_per_minutes"
              required
              min="1"
              max="1000"
              placeholder="30"
            >
            <small class="field-help">המחיר שהוגדר למעלה יהיה עבור כמה דקות?</small>
          </div>

          <div class="form-group">
            <label>מחיר הטיפול (₪) *</label>
            <input 
              type="number" 
              [(ngModel)]="newTreatment.price"
              name="price"
              required
              min="0"
              step="0.01"
              placeholder="150"
            >
          </div>

          <div class="form-actions">
            <button 
              type="button"
              class="cancel-btn"
              (click)="closeTreatmentModal()"
            >
              ביטול
            </button>
            <button 
              type="button"
              class="save-btn"
              (click)="saveTreatment()"
              [disabled]="!isFormValid()"
            >
              {{ isEditMode ? 'עדכן' : 'שמור' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- מודל פרטי טיפול -->
    <div 
      *ngIf="showTreatmentDetailsModal" 
      class="modal-overlay"
      (click)="closeTreatmentDetailsModal()"
    >
      <div 
        class="modal-content treatment-details-modal"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3>פרטי טיפול</h3>
          <div class="header-actions">
            <button 
              class="edit-treatment-btn"
              (click)="editTreatment(selectedTreatment!, $event)"
            >
              <i class="material-icons">edit</i> עריכה
            </button>
            <button 
              class="close-btn"
              (click)="closeTreatmentDetailsModal()"
            >
              ×
            </button>
          </div>
        </div>
        
        <div class="treatment-details-content" *ngIf="selectedTreatment">
          <div class="treatment-profile">
            <div class="treatment-icon-large">
              {{ getTreatmentIcon(selectedTreatment.name) }}
            </div>
            <div class="treatment-main-info">
              <h2>{{ selectedTreatment.name }}</h2>
              <div class="treatment-summary">
                <div class="summary-item">
                  <span class="summary-label">משך:</span>
                  <span class="summary-value">
                    {{ selectedTreatment.duration_minutes }} דקות
                    <span class="type-badge" [class.variable]="!selectedTreatment.fixed_duration">
                      {{ selectedTreatment.fixed_duration ? 'קבוע' : 'משתנה' }}
                    </span>
                  </span>
                </div>
                
                <div class="summary-item">
                  <span class="summary-label">מחיר:</span>
                  <span class="summary-value">
                    ₪{{ selectedTreatment.price }}
                    <span class="type-badge" [class.variable]="!selectedTreatment.fixed_price">
                      {{ selectedTreatment.fixed_price ? 'קבוע' : 'משתנה' }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="treatment-specs" *ngIf="!selectedTreatment.fixed_price || !selectedTreatment.fixed_duration">
            <h4>הגדרות מתקדמות</h4>
            
            <div class="spec-grid">
              <div class="spec-item" *ngIf="!selectedTreatment.fixed_price && selectedTreatment.price_per_minutes > 0">
                <i class="material-icons spec-icon">bar_chart</i>
                <div class="spec-content">
                  <div class="spec-title">תמחור לפי זמן</div>
                  <div class="spec-value">₪{{ selectedTreatment.price }} לכל {{ selectedTreatment.price_per_minutes }} דקות</div>
                </div>
              </div>
              
              <div class="spec-item" *ngIf="!selectedTreatment.fixed_duration && selectedTreatment.min_interval_minutes > 0">
                <i class="material-icons spec-icon">timer</i>
                <div class="spec-content">
                  <div class="spec-title">מינימום זמן לתור</div>
                  <div class="spec-value">{{ selectedTreatment.min_interval_minutes }} דקות</div>
                </div>
              </div>
            </div>
          </div>

          <div class="treatment-stats">
            <h4>סטטיסטיקות</h4>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">{{ getTreatmentAppointmentCount(selectedTreatment.id) }}</div>
                <div class="stat-label">תורים השבוע</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ getTreatmentRevenue(selectedTreatment.id) }}</div>
                <div class="stat-label">הכנסות השבוע</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ getAverageDuration(selectedTreatment.id) }}</div>
                <div class="stat-label">משך ממוצע</div>
              </div>
            </div>
          </div>
        </div>
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
          <p>האם אתה בטוח שברצונך למחוק את הטיפול:</p>
          <div class="treatment-to-delete">
            <strong>{{ treatmentToDelete?.name }}</strong>
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
              (click)="confirmDeleteTreatment()"
            >
              מחק טיפול
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TreatmentsComponent implements OnInit {
  treatments: Treatment[] = [];
  filteredTreatments: Treatment[] = [];
  searchTerm = '';
  showTreatmentModal = false;
  showTreatmentDetailsModal = false;
  showDeleteConfirmModal = false;
  selectedTreatment: Treatment | null = null;
  treatmentToDelete: Treatment | null = null;
  currentUser: any = null;
  isEditMode = false;
  editingTreatmentId: number | null = null;

  newTreatment = {
    name: '',
    duration_minutes: 60,
    fixed_duration: true,
    fixed_price: true,
    price: 0,
    price_per_minutes: 30,
    min_interval_minutes: 15
  };

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadTreatments();
  }

  async loadCurrentUser() {
    this.currentUser = await this.supabase.getCurrentUser();
  }

  async loadTreatments() {
    if (!this.currentUser) return;

    const { data, error } = await this.supabase.getTreatments(this.currentUser.id);
    if (!error && data) {
      this.treatments = data;
      this.filteredTreatments = [...this.treatments];
    }
  }

  filterTreatments() {
    if (!this.searchTerm.trim()) {
      this.filteredTreatments = [...this.treatments];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredTreatments = this.treatments.filter(treatment => 
      treatment.name.toLowerCase().includes(term) ||
      treatment.price.toString().includes(term) ||
      treatment.duration_minutes.toString().includes(term)
    );
  }

  getTreatmentIcon(name: string): string {
    const icons: { [key: string]: string } = {
      'פדיקור': 'self_care',
      'מניקור': 'colorize',
      'עיסוי': 'spa',
      'פנים': 'face',
      'גבות': 'visibility',
      'ריסים': 'remove_red_eye',
      'שיער': 'content_cut',
      'לק': 'brush',
      'ג\'ל': 'palette'
    };

    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerName.includes(key.toLowerCase())) {
        return icon;
      }
    }
    return 'star';
  }

  openNewTreatmentModal() {
    this.showTreatmentModal = true;
    this.isEditMode = false;
    this.editingTreatmentId = null;
    this.newTreatment = {
      name: '',
      duration_minutes: 60,
      fixed_duration: true,
      fixed_price: true,
      price: 0,
      price_per_minutes: 30,
      min_interval_minutes: 15
    };
  }

  closeTreatmentModal() {
    this.showTreatmentModal = false;
    this.isEditMode = false;
    this.editingTreatmentId = null;
  }

  async saveTreatment() {
    if (!this.currentUser || !this.newTreatment.name || !this.newTreatment.duration_minutes) {
      return;
    }

    const treatmentData = {
      ...this.newTreatment,
      user_id: this.currentUser.id
    };

    if (this.isEditMode && this.editingTreatmentId) {
      // עריכת טיפול קיים
      const { error } = await this.supabase.client
        .from('treatments')
        .update(treatmentData)
        .eq('id', this.editingTreatmentId);
      
      if (!error) {
        this.closeTreatmentModal();
        await this.loadTreatments();
      }
    } else {
      // יצירת טיפול חדש
      const { error } = await this.supabase.client
        .from('treatments')
        .insert(treatmentData);
      
      if (!error) {
        this.closeTreatmentModal();
        await this.loadTreatments();
      }
    }
  }

  editTreatment(treatment: Treatment, event: Event) {
    event.stopPropagation();
    this.isEditMode = true;
    this.editingTreatmentId = treatment.id;
    this.showTreatmentModal = true;
    this.showTreatmentDetailsModal = false;
    
    this.newTreatment = {
      name: treatment.name,
      duration_minutes: treatment.duration_minutes,
      fixed_duration: treatment.fixed_duration,
      fixed_price: treatment.fixed_price,
      price: treatment.price,
      price_per_minutes: treatment.price_per_minutes,
      min_interval_minutes: treatment.min_interval_minutes
    };
  }

  deleteTreatment(treatment: Treatment, event: Event) {
    event.stopPropagation();
    this.treatmentToDelete = treatment;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.treatmentToDelete = null;
  }

  async confirmDeleteTreatment() {
    if (!this.treatmentToDelete) return;

    const { error } = await this.supabase.client
      .from('treatments')
      .delete()
      .eq('id', this.treatmentToDelete.id);
    
    if (!error) {
      this.closeDeleteConfirmModal();
      await this.loadTreatments();
    }
  }

  openTreatmentDetails(treatment: Treatment) {
    this.selectedTreatment = treatment;
    this.showTreatmentDetailsModal = true;
  }

  closeTreatmentDetailsModal() {
    this.showTreatmentDetailsModal = false;
    this.selectedTreatment = null;
  }

  // פונקציות סטטיסטיקה (זמניות - יחזרו נתונים אמיתיים בעתיד)
  getTreatmentAppointmentCount(treatmentId: number): number {
    return Math.floor(Math.random() * 10);
  }

  getTreatmentRevenue(treatmentId: number): string {
    const revenue = Math.floor(Math.random() * 5000);
    return `₪${revenue}`;
  }

  getAverageDuration(treatmentId: number): string {
    const duration = Math.floor(Math.random() * 60) + 30;
    return `${duration} דק'`;
  }

  isFormValid(): boolean {
    if (!this.newTreatment.name || this.newTreatment.price < 0) {
      return false;
    }

    // אם אורך קבוע, צריך duration_minutes
    if (this.newTreatment.fixed_duration && !this.newTreatment.duration_minutes) {
      return false;
    }

    // אם אורך לא קבוע, צריך min_interval_minutes
    if (!this.newTreatment.fixed_duration && !this.newTreatment.min_interval_minutes) {
      return false;
    }

    // אם מחיר לא קבוע, צריך price_per_minutes
    if (!this.newTreatment.fixed_price && !this.newTreatment.price_per_minutes) {
      return false;
    }

    return true;
  }
}