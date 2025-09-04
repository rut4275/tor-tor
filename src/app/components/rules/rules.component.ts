import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface SystemRule {
  id: number;
  rule_text: string;
  description: string;
}

interface UserRule {
  id: number;
  rule_id?: number;
  user_id: string;
  rule_text: string;
  description: string;
  is_hard: boolean;
  is_approved: boolean;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  score: number;
  created_at: string;
  updated_at: string;
  system_rules?: { rule_text: string; description: string };
}

interface ParsedField {
  type: 'text' | 'number' | 'time';
  placeholder: string;
  value: string;
}

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./rules.component.css'],
  template: `
    <div class="rules-container">
      <div class="rules-header">
        <h1>כללים</h1>
        <div class="header-actions">
          <button 
            class="add-rule-btn"
            (click)="openAddRuleModal()"
          >
            + כלל חדש
          </button>
        </div>
      </div>

      <div class="rules-list">
        <div 
          *ngFor="let rule of userRules" 
          class="rule-card"
          [class.system-rule]="rule.rule_id"
          [class.inactive]="!rule.is_active"
        >
          <div class="rule-header">
            <div class="rule-type">
              <i class="material-icons" *ngIf="rule.rule_id">settings</i>
              <i class="material-icons" *ngIf="!rule.rule_id">edit</i>
              <span>{{ rule.rule_id ? 'כלל מובנה' : 'כלל מותאם' }}</span>
            </div>
            
            <div class="rule-status">
              <span class="status-badge" [class.hard]="rule.is_hard" [class.soft]="!rule.is_hard">
                {{ rule.is_hard ? 'קשיח' : 'רך' }}
              </span>
              <span class="approval-badge" [class.approved]="rule.is_approved" [class.pending]="!rule.is_approved">
                {{ rule.is_approved ? 'מאושר' : 'ממתין' }}
              </span>
              <span class="active-badge" [class.active]="rule.is_active" [class.inactive]="!rule.is_active">
                {{ rule.is_active ? 'פעיל' : 'לא פעיל' }}
              </span>
            </div>
          </div>

          <div class="rule-content">
            <div class="rule-description">{{ rule.description }}</div>
            <div class="rule-text" *ngIf="rule.rule_text !== rule.description">
              <strong>טקסט הכלל:</strong> {{ rule.rule_text }}
            </div>
          </div>

          <div class="rule-details">
            <div class="rule-dates" *ngIf="rule.start_date || rule.end_date">
              <i class="material-icons">date_range</i>
              <span>
                {{ rule.start_date ? formatDate(rule.start_date) : 'ללא תחילה' }} - 
                {{ rule.end_date ? formatDate(rule.end_date) : 'ללא סיום' }}
              </span>
            </div>
            
            <div class="rule-score">
              <i class="material-icons">star</i>
              <span>ניקוד: {{ rule.score }}</span>
            </div>
          </div>

          <div class="rule-actions">
            <button 
              class="edit-btn"
              (click)="editRule(rule)"
              title="עריכה"
            >
              <i class="material-icons">edit</i>
            </button>
            <button 
              class="toggle-btn"
              (click)="toggleRuleActive(rule)"
              [title]="rule.is_active ? 'השבת' : 'הפעל'"
            >
              <i class="material-icons">{{ rule.is_active ? 'pause' : 'play_arrow' }}</i>
            </button>
            <button 
              class="delete-btn"
              (click)="deleteRule(rule)"
              title="מחיקה"
            >
              <i class="material-icons">delete</i>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="userRules.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="material-icons">rule</i>
        </div>
        <h3>אין כללים מוגדרים</h3>
        <p>עדיין לא הוספת כללים למערכת</p>
        <button 
          class="add-first-rule-btn"
          (click)="openAddRuleModal()"
        >
          הוסף כלל ראשון
        </button>
      </div>
    </div>

    <!-- מודל הוספת/עריכת כלל -->
    <div 
      *ngIf="showRuleModal" 
      class="modal-overlay"
      (click)="closeRuleModal()"
    >
      <div 
        class="modal-content"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3 [class.edit-mode]="isEditMode">{{ isEditMode ? 'עריכת כלל' : 'כלל חדש' }}</h3>
          <button 
            class="close-btn"
            (click)="closeRuleModal()"
          >
            ×
          </button>
        </div>
        
        <div class="modal-content-body">
          <div class="rule-type-selection" *ngIf="!isEditMode">
            <h4>סוג הכלל</h4>
            <div class="type-options">
              <label class="type-option">
                <input 
                  type="radio" 
                  name="ruleType" 
                  value="system"
                  [(ngModel)]="selectedRuleType"
                  (change)="onRuleTypeChange()"
                >
                <div class="option-content">
                  <i class="material-icons">settings</i>
                  <div class="option-text">
                    <span class="option-title">כלל מובנה</span>
                    <span class="option-description">בחר מתוך כללים קיימים במערכת</span>
                  </div>
                </div>
              </label>
              
              <label class="type-option">
                <input 
                  type="radio" 
                  name="ruleType" 
                  value="custom"
                  [(ngModel)]="selectedRuleType"
                  (change)="onRuleTypeChange()"
                >
                <div class="option-content">
                  <i class="material-icons">edit</i>
                  <div class="option-text">
                    <span class="option-title">כלל מותאם</span>
                    <span class="option-description">צור כלל משלך</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="system-rule-selection" *ngIf="selectedRuleType === 'system' && !isEditMode">
            <h4>בחר כלל מובנה</h4>
            <div class="system-rules-list">
              <div 
                *ngFor="let systemRule of systemRules" 
                class="system-rule-item"
                [class.selected]="selectedSystemRule?.id === systemRule.id"
                (click)="selectSystemRule(systemRule)"
              >
                <div class="system-rule-description">{{ systemRule.description }}</div>
              </div>
            </div>
          </div>

          <div class="rule-form" *ngIf="selectedRuleType">
            <div class="dynamic-fields" *ngIf="selectedRuleType === 'system' && selectedSystemRule && parsedFields.length > 0">
              <h4>מלא את הפרטים</h4>
              <div class="field-group" *ngFor="let field of parsedFields; let i = index">
                <label>{{ field.placeholder }}</label>
                <input 
                  [type]="field.type"
                  [(ngModel)]="field.value"
                  [name]="'field_' + i"
                  [placeholder]="field.placeholder"
                  required
                >
              </div>
            </div>

            <div class="form-group" *ngIf="selectedRuleType === 'custom'">
              <label>תיאור הכלל *</label>
              <textarea 
                [(ngModel)]="newRule.description"
                name="description"
                required
                placeholder="תאר את הכלל... מומלץ לציין באיזה תאריכים הכלל תקף"
                rows="4"
                maxlength="1000"
              ></textarea>
              <small class="char-count">{{ newRule.description.length }}/1000 תווים</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>תאריך התחלה</label>
                <input 
                  type="date" 
                  [(ngModel)]="newRule.start_date"
                  name="start_date"
                >
              </div>

              <div class="form-group">
                <label>תאריך סיום</label>
                <input 
                  type="date" 
                  [(ngModel)]="newRule.end_date"
                  name="end_date"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>ניקוד חשיבות (0-100)</label>
                <input 
                  type="number" 
                  [(ngModel)]="newRule.score"
                  name="score"
                  min="0"
                  max="100"
                  placeholder="50"
                >
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="newRule.is_hard"
                    name="is_hard"
                  >
                  <span class="checkbox-text">כלל קשיח</span>
                  <small class="checkbox-help">כלל שאסור לעבור עליו (לעומת כלל רך שעדיף לא לעבור עליו)</small>
                </label>
              </div>
            </div>

            <div class="preview-section" *ngIf="getPreviewText()">
              <h4>תצוגה מקדימה:</h4>
              <div class="rule-preview">
                <div class="preview-description">{{ getPreviewText() }}</div>
                <div class="preview-rule-text" *ngIf="getPreviewRuleText() !== getPreviewText()">
                  <strong>טקסט הכלל:</strong> {{ getPreviewRuleText() }}
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="button"
                class="cancel-btn"
                (click)="closeRuleModal()"
              >
                ביטול
              </button>
              <button 
                type="button"
                class="save-btn"
                (click)="saveRule()"
                [disabled]="!isFormValid()"
              >
                {{ isEditMode ? 'עדכן' : 'שמור' }}
              </button>
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
          <div class="warning-icon">
            <i class="material-icons">warning</i>
          </div>
          <p>האם אתה בטוח שברצונך למחוק את הכלל:</p>
          <div class="rule-to-delete" *ngIf="ruleToDelete">
            <strong>"{{ ruleToDelete.description }}"</strong>
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
              (click)="confirmDeleteRule()"
            >
              מחק כלל
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RulesComponent implements OnInit {
  systemRules: SystemRule[] = [];
  userRules: UserRule[] = [];
  currentUser: any = null;
  
  showRuleModal = false;
  showDeleteConfirmModal = false;
  isEditMode = false;
  editingRuleId: number | null = null;
  ruleToDelete: UserRule | null = null;
  
  selectedRuleType: 'system' | 'custom' = 'system';
  selectedSystemRule: SystemRule | null = null;
  parsedFields: ParsedField[] = [];
  showAdvancedSettings = false;

  newRule = {
    description: '',
    start_date: '',
    end_date: '',
    score: 50,
    is_hard: false
  };

  constructor(private supabase: SupabaseService) {}

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
      this.loadSystemRules(),
      this.loadUserRules()
    ]);
  }

  async loadSystemRules() {
    const { data, error } = await this.supabase.getSystemRules();
    if (!error && data) {
      this.systemRules = data;
    }
  }

  async loadUserRules() {
    const { data, error } = await this.supabase.getUserRules(this.currentUser.id);
    if (!error && data) {
      this.userRules = data;
    }
  }

  openAddRuleModal() {
    this.showRuleModal = true;
    this.isEditMode = false;
    this.editingRuleId = null;
    this.selectedRuleType = 'system';
    this.selectedSystemRule = null;
    this.parsedFields = [];
    this.newRule = {
      description: '',
      start_date: '',
      end_date: '',
      score: 50,
      is_hard: false
    };
  }

  closeRuleModal() {
    this.showRuleModal = false;
    this.isEditMode = false;
    this.editingRuleId = null;
    this.selectedSystemRule = null;
    this.parsedFields = [];
  }

  onRuleTypeChange() {
    this.selectedSystemRule = null;
    this.parsedFields = [];
  }

  selectSystemRule(systemRule: SystemRule) {
    this.selectedSystemRule = systemRule;
    this.parseSystemRuleFields(systemRule.description);
  }

  parseSystemRuleFields(description: string) {
    this.parsedFields = [];
    const regex = /#([^\s]+)/g;
    let match;
    
    while ((match = regex.exec(description)) !== null) {
      const fieldName = match[1];
      let type: 'text' | 'number' | 'time' = 'text';
      let placeholder = fieldName;
      
      if (fieldName.toLowerCase().includes('שעה') || fieldName.toLowerCase().includes('זמן')) {
        type = 'time';
        placeholder = 'בחר שעה';
      } else if (fieldName.toLowerCase().includes('מספר') || 
                 fieldName.toLowerCase().includes('דקות') || 
                 fieldName.toLowerCase().includes('ימים') ||
                 fieldName.toLowerCase().includes('כמות')) {
        type = 'number';
        placeholder = 'הכנס מספר';
      } else {
        placeholder = `הכנס ${fieldName}`;
      }
      
      this.parsedFields.push({
        type,
        placeholder,
        value: ''
      });
    }
  }

  editRule(rule: UserRule) {
    this.isEditMode = true;
    this.editingRuleId = rule.id;
    this.showRuleModal = true;
    
    if (rule.rule_id) {
      this.selectedRuleType = 'system';
      this.selectedSystemRule = this.systemRules.find(sr => sr.id === rule.rule_id) || null;
      if (this.selectedSystemRule) {
        this.parseSystemRuleFields(this.selectedSystemRule.description);
        // Try to extract values from the saved rule text
        this.extractFieldValues(rule.description, rule.rule_text);
      }
    } else {
      this.selectedRuleType = 'custom';
    }
    
    this.newRule = {
      description: rule.description,
      start_date: rule.start_date || '',
      end_date: rule.end_date || '',
      score: rule.score,
      is_hard: rule.is_hard
    };
  }

  extractFieldValues(description: string, ruleText: string) {
    // This is a simplified extraction - in a real app you might want more sophisticated parsing
    const descriptionParts = description.split(' ');
    const originalParts = this.selectedSystemRule?.description.split(' ') || [];
    
    let fieldIndex = 0;
    for (let i = 0; i < originalParts.length && fieldIndex < this.parsedFields.length; i++) {
      if (originalParts[i].startsWith('#')) {
        if (descriptionParts[i]) {
          this.parsedFields[fieldIndex].value = descriptionParts[i];
          fieldIndex++;
        }
      }
    }
  }

  async toggleRuleActive(rule: UserRule) {
    const { error } = await this.supabase.updateUserRule(rule.id, {
      is_active: !rule.is_active
    });
    
    if (!error) {
      await this.loadUserRules();
    }
  }

  deleteRule(rule: UserRule) {
    this.ruleToDelete = rule;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.ruleToDelete = null;
  }

  async confirmDeleteRule() {
    if (!this.ruleToDelete) return;

    const { error } = await this.supabase.deleteUserRule(this.ruleToDelete.id);
    
    if (!error) {
      await this.loadUserRules();
      this.closeDeleteConfirmModal();
    }
  }

  async saveRule() {
    if (!this.currentUser || !this.isFormValid()) {
      return;
    }

    let ruleData: any = {
      user_id: this.currentUser.id,
      start_date: this.newRule.start_date || null,
      end_date: this.newRule.end_date || null,
      score: this.newRule.score,
      is_hard: this.newRule.is_hard,
      is_active: true
    };

    if (this.selectedRuleType === 'system' && this.selectedSystemRule) {
      // System rule
      const processedTexts = this.processSystemRuleText();
      ruleData.rule_id = this.selectedSystemRule.id;
      ruleData.description = processedTexts.description;
      ruleData.rule_text = processedTexts.ruleText;
      ruleData.is_approved = true; // System rules are pre-approved
    } else {
      // Custom rule
      ruleData.description = this.newRule.description.trim();
      ruleData.rule_text = this.newRule.description.trim();
      ruleData.is_approved = false; // Custom rules need approval
    }

    if (this.isEditMode && this.editingRuleId) {
      const { error } = await this.supabase.updateUserRule(this.editingRuleId, ruleData);
      
      if (!error) {
        await this.loadUserRules();
        this.closeRuleModal();
      }
    } else {
      const { error } = await this.supabase.createUserRule(ruleData);
      
      if (!error) {
        await this.loadUserRules();
        this.closeRuleModal();
      }
    }
  }

  processSystemRuleText(): { description: string; ruleText: string } {
    if (!this.selectedSystemRule) {
      return { description: '', ruleText: '' };
    }

    let description = this.selectedSystemRule.description;
    let ruleText = this.selectedSystemRule.rule_text;
    
    const regex = /#([^\s]+)/g;
    let fieldIndex = 0;
    
    description = description.replace(regex, () => {
      if (fieldIndex < this.parsedFields.length) {
        return this.parsedFields[fieldIndex++].value;
      }
      return '';
    });
    
    fieldIndex = 0;
    ruleText = ruleText.replace(regex, () => {
      if (fieldIndex < this.parsedFields.length) {
        return this.parsedFields[fieldIndex++].value;
      }
      return '';
    });
    
    return { description, ruleText };
  }

  getPreviewText(): string {
    if (this.selectedRuleType === 'system' && this.selectedSystemRule) {
      return this.processSystemRuleText().description;
    } else if (this.selectedRuleType === 'custom') {
      return this.newRule.description;
    }
    return '';
  }

  getPreviewRuleText(): string {
    if (this.selectedRuleType === 'system' && this.selectedSystemRule) {
      return this.processSystemRuleText().ruleText;
    } else if (this.selectedRuleType === 'custom') {
      return this.newRule.description;
    }
    return '';
  }

  isFormValid(): boolean {
    if (this.selectedRuleType === 'system') {
      return !!(this.selectedSystemRule && this.parsedFields.every(field => field.value.trim()));
    } else {
      return !!this.newRule.description.trim();
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL');
  }

  getFieldLabel(fieldName: string): string {
    // המרת שם השדה לתווית ידידותית למשתמש
    const labels: { [key: string]: string } = {
      'שעה1': 'שעת התחלה',
      'שעה2': 'שעת סיום',
      'שעה': 'שעה',
      'זמן1': 'זמן התחלה',
      'זמן2': 'זמן סיום',
      'מספר': 'מספר',
      'דקות': 'דקות',
      'ימים': 'ימים',
      'כמות': 'כמות',
      'יום': 'יום בשבוע'
    };
    
    return labels[fieldName] || fieldName;
  }
}