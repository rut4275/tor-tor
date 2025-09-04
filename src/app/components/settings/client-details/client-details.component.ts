import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

interface ClientQuestion {
  id: number;
  user_id: string;
  question: string;
  answer_type_id: number;
  selection_option?: string;
  answer_types?: { name: string };
}

interface AnswerType {
  id: number;
  name: string;
}

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./client-details.component.css'],
  template: `
    <div class="page-container">
      <div class="breadcrumb">
        <span class="breadcrumb-item" (click)="goToSettings()">הגדרות</span>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">איסוף פרטים מלקוח חדש</span>
      </div>
      
      <div class="page-header">
        <h1>איסוף פרטים מלקוח חדש</h1>
        <p class="page-description">הגדר שאלות שהבוט ישאל לקוחות חדשים</p>
        <button 
          class="add-question-btn"
          (click)="openNewQuestionModal()"
        >
          + שאלה חדשה
        </button>
      </div>

      <div class="questions-list">
        <div 
          *ngFor="let question of clientQuestions; let i = index" 
          class="question-card"
        >
          <div class="question-number">{{ i + 1 }}</div>
          
          <div class="question-content">
            <div class="question-text">{{ question.question }}</div>
            <div class="answer-type">
              <i class="material-icons">help_outline</i>
              <span>סוג תשובה: {{ question.answer_types?.name || 'לא ידוע' }}</span>
            </div>
          </div>
          
          <div class="question-actions">
            <button 
              class="edit-btn"
              (click)="editQuestion(question)"
              title="עריכה"
            >
              <i class="material-icons">edit</i>
            </button>
            <button 
              class="delete-btn"
              (click)="deleteQuestion(question)"
              title="מחיקה"
            >
              <i class="material-icons">delete</i>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="clientQuestions.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="material-icons">quiz</i>
        </div>
        <h3>אין שאלות מוגדרות</h3>
        <p>עדיין לא הגדרת שאלות לאיסוף פרטים מלקוחות חדשים</p>
        <button 
          class="add-first-question-btn"
          (click)="openNewQuestionModal()"
        >
          הוסף שאלה ראשונה
        </button>
      </div>
    </div>

    <!-- מודל שאלה חדשה/עריכה -->
    <div 
      *ngIf="showQuestionModal" 
      class="modal-overlay"
      (click)="closeQuestionModal()"
    >
      <div 
        class="modal-content"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3 [class.edit-mode]="isEditMode">{{ isEditMode ? 'עריכת שאלה' : 'שאלה חדשה' }}</h3>
          <button 
            class="close-btn"
            (click)="closeQuestionModal()"
          >
            ×
          </button>
        </div>
        
        <form class="question-form">
          <div class="form-group">
            <label>השאלה *</label>
            <textarea 
              [(ngModel)]="newQuestion.question"
              name="question"
              required
              placeholder="הכנס את השאלה שהבוט ישאל..."
              rows="3"
              maxlength="500"
            ></textarea>
            <small class="char-count">{{ newQuestion.question.length }}/500 תווים</small>
          </div>

          <div class="form-group">
            <label>סוג תשובה מצופה *</label>
            <select [(ngModel)]="newQuestion.answer_type_id" name="answer_type" required>
              <option value="">בחר סוג תשובה</option>
              <option 
                *ngFor="let answerType of answerTypes" 
                [value]="answerType.id"
              >
                {{ answerType.name }}
              </option>
            </select>
          </div>

          <div class="form-group" *ngIf="isSelectionType()">
            <label>אופציות לבחירה *</label>
            <textarea 
              [(ngModel)]="newQuestion.selection_option"
              name="selection_option"
              required
              placeholder="הכנס את האופציות מופרדות בפסיק, לדוגמה: אופציה 1, אופציה 2, אופציה 3"
              rows="3"
              maxlength="1000"
            ></textarea>
            <small class="field-help">הפרד בין האופציות בפסיק. לדוגמה: כן, לא, אולי</small>
            <small class="char-count">{{ newQuestion.selection_option.length }}/1000 תווים</small>
          </div>

          <div class="preview-section" *ngIf="newQuestion.question.trim()">
            <h4>תצוגה מקדימה:</h4>
            <div class="question-preview">
              <div class="bot-message">
                <i class="material-icons">smart_toy</i>
                <span>{{ newQuestion.question }}</span>
              </div>
              <div class="answer-type-hint">
                <small>המשתמש יענה: {{ getAnswerTypeDescription(newQuestion.answer_type_id) }}</small>
              </div>
              <div class="selection-options-preview" *ngIf="isSelectionType() && newQuestion.selection_option.trim()">
                <div class="options-title">אופציות לבחירה:</div>
                <div class="options-list">
                  <span 
                    *ngFor="let option of getSelectionOptions(); let last = last"
                    class="option-item"
                  >
                    {{ option }}<span *ngIf="!last">, </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="button"
              class="cancel-btn"
              (click)="closeQuestionModal()"
            >
              ביטול
            </button>
            <button 
              type="button"
              class="save-btn"
              (click)="saveQuestion()"
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
          <div class="warning-icon">
            <i class="material-icons">warning</i>
          </div>
          <p>האם אתה בטוח שברצונך למחוק את השאלה:</p>
          <div class="question-to-delete" *ngIf="questionToDelete">
            <strong>"{{ questionToDelete.question }}"</strong>
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
              (click)="confirmDeleteQuestion()"
            >
              מחק שאלה
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientDetailsComponent implements OnInit {
  clientQuestions: ClientQuestion[] = [];
  answerTypes: AnswerType[] = [];
  currentUser: any = null;
  
  showQuestionModal = false;
  showDeleteConfirmModal = false;
  isEditMode = false;
  editingQuestionId: number | null = null;
  questionToDelete: ClientQuestion | null = null;

  newQuestion = {
    question: '',
    answer_type_id: '',
    selection_option: ''
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
      this.loadClientQuestions(),
      this.loadAnswerTypes()
    ]);
  }

  async loadClientQuestions() {
    const { data, error } = await this.supabase.getClientQuestions(this.currentUser.id);
    if (!error && data) {
      this.clientQuestions = data;
    }
  }

  async loadAnswerTypes() {
    const { data, error } = await this.supabase.getAnswerTypes();
    if (!error && data) {
      this.answerTypes = data;
    }
  }

  openNewQuestionModal() {
    this.showQuestionModal = true;
    this.isEditMode = false;
    this.editingQuestionId = null;
    this.newQuestion = {
      question: '',
      answer_type_id: '',
      selection_option: ''
    };
  }

  closeQuestionModal() {
    this.showQuestionModal = false;
    this.isEditMode = false;
    this.editingQuestionId = null;
  }

  editQuestion(question: ClientQuestion) {
    this.isEditMode = true;
    this.editingQuestionId = question.id;
    this.showQuestionModal = true;
    
    this.newQuestion = {
      question: question.question,
      answer_type_id: question.answer_type_id.toString(),
      selection_option: question.selection_option || ''
    };
  }

  deleteQuestion(question: ClientQuestion) {
    this.questionToDelete = question;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.questionToDelete = null;
  }

  async confirmDeleteQuestion() {
    if (!this.questionToDelete) return;

    const { error } = await this.supabase.deleteClientQuestion(this.questionToDelete.id);
    
    if (!error) {
      await this.loadClientQuestions();
      this.closeDeleteConfirmModal();
    }
  }

  async saveQuestion() {
    if (!this.currentUser || !this.isFormValid()) {
      return;
    }

    const questionData = {
      user_id: this.currentUser.id,
      question: this.newQuestion.question.trim(),
      answer_type_id: parseInt(this.newQuestion.answer_type_id),
      selection_option: this.isSelectionType() ? this.newQuestion.selection_option.trim() : null
    };

    if (this.isEditMode && this.editingQuestionId) {
      const { error } = await this.supabase.updateClientQuestion(this.editingQuestionId, questionData);
      
      if (!error) {
        await this.loadClientQuestions();
        this.closeQuestionModal();
      }
    } else {
      const { error } = await this.supabase.createClientQuestion(questionData);
      
      if (!error) {
        await this.loadClientQuestions();
        this.closeQuestionModal();
      }
    }
  }

  isFormValid(): boolean {
    const basicValid = !!(this.newQuestion.question.trim() && this.newQuestion.answer_type_id);
    
    if (this.isSelectionType()) {
      return basicValid && !!this.newQuestion.selection_option.trim();
    }
    
    return basicValid;
  }

  isSelectionType(): boolean {
    if (!this.newQuestion.answer_type_id) return false;
    
    const answerType = this.answerTypes.find(at => at.id === parseInt(this.newQuestion.answer_type_id));
    return answerType?.name === 'בחירה';
  }

  getSelectionOptions(): string[] {
    if (!this.newQuestion.selection_option.trim()) return [];
    
    return this.newQuestion.selection_option
      .split(',')
      .map(option => option.trim())
      .filter(option => option.length > 0);
  }

  getAnswerTypeDescription(answerTypeId: string): string {
    if (!answerTypeId) return 'לא נבחר';
    
    const answerType = this.answerTypes.find(at => at.id === parseInt(answerTypeId));
    return answerType?.name || 'לא ידוע';
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}