import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

interface BotMessage {
  id: number;
  code: number;
  message: string;
  description: string;
}

interface UserBotMessage {
  id: string;
  user_id: string;
  message_id: number;
  custom_message: string;
  // created_at: string;
  // updated_at: string;
}

interface DisplayMessage {
  id: number;
  code: number;
  message: string;
  description: string;
  originalMessage: string;
  isCustom: boolean;
  customMessageId?: string;
}

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./chat-messages.component.css'],
  template: `
    <div class="page-container">
      <div class="breadcrumb">
        <span class="breadcrumb-item" (click)="goToSettings()">הגדרות</span>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">הודעות הצ'אט</span>
      </div>
      
      <div class="page-header">
        <h1>הודעות הצ'אט</h1>
        <p class="page-description">נהל את ההודעות האוטומטיות של הבוט</p>
      </div>

      <div class="messages-grid">
        <div 
          *ngFor="let message of displayMessages" 
          class="message-card"
          [class.custom]="message.isCustom"
          (click)="openEditModal(message)"
        >
          <div class="message-header">
            <div class="message-code">קוד: {{ message.code }}</div>
            <div class="message-status" *ngIf="message.isCustom">
              <i class="material-icons">edit</i>
              <span>ערוך</span>
            </div>
          </div>
          
          <div class="message-description">
            {{ message.description }}
          </div>
          
          <div class="message-content">
            {{ message.message }}
          </div>
        </div>
      </div>

      <div *ngIf="displayMessages.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="material-icons">chat</i>
        </div>
        <h3>אין הודעות זמינות</h3>
        <p>לא נמצאו הודעות בוט במערכת</p>
      </div>
    </div>

    <!-- מודל עריכת הודעה -->
    <div 
      *ngIf="showEditModal" 
      class="modal-overlay"
      (click)="closeEditModal()"
    >
      <div 
        class="modal-content"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3>עריכת הודעה</h3>
          <button 
            class="close-btn"
            (click)="closeEditModal()"
          >
            ×
          </button>
        </div>
        
        <div class="edit-content" *ngIf="selectedMessage">
          <div class="message-info">
            <div class="info-item">
              <label>קוד הודעה:</label>
              <span>{{ selectedMessage.code }}</span>
            </div>
            
            <div class="info-item">
              <label>תיאור:</label>
              <span>{{ selectedMessage.description }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>הודעה מותאמת אישית:</label>
            <textarea 
              [(ngModel)]="editedMessage"
              name="editedMessage"
              rows="4"
              placeholder="הכנס את ההודעה המותאמת אישית..."
              class="message-textarea"
            ></textarea>
          </div>

          <div class="default-message-section">
            <h4>הודעה ברירת מחדל:</h4>
            <div class="default-message">
              {{ selectedMessage.originalMessage }}
            </div>
            <button 
              type="button"
              class="restore-btn"
              (click)="restoreDefault()"
            >
              <i class="material-icons">restore</i>
              שחזר הודעה ברירת מחדל
            </button>
          </div>

          <div class="form-actions">
            <button 
              type="button"
              class="cancel-btn"
              (click)="closeEditModal()"
            >
              ביטול
            </button>
            <button 
              type="button"
              class="save-btn"
              (click)="saveMessage()"
              [disabled]="!editedMessage.trim()"
            >
              שמור שינויים
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChatMessagesComponent implements OnInit {
  botMessages: BotMessage[] = [];
  userBotMessages: UserBotMessage[] = [];
  displayMessages: DisplayMessage[] = [];
  currentUser: any = null;
  
  showEditModal = false;
  selectedMessage: DisplayMessage | null = null;
  editedMessage = '';

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadMessages();
  }

  async loadCurrentUser() {
    this.currentUser = await this.supabase.getCurrentUser();
  }

  async loadMessages() {
    if (!this.currentUser) return;

    await Promise.all([
      this.loadBotMessages(),
      this.loadUserBotMessages()
    ]);

    this.buildDisplayMessages();
  }

  async loadBotMessages() {
    const { data, error } = await this.supabase.getBotMessages(this.currentUser.id);
    if (!error && data) {
      this.botMessages = data;
    }
  }

  async loadUserBotMessages() {
    const { data, error } = await this.supabase.getUserBotMessages(this.currentUser.id);
    if (!error && data) {
      this.userBotMessages = data;
    }
  }

  buildDisplayMessages() {
    this.displayMessages = this.botMessages.map(botMessage => {
      const userMessage = this.userBotMessages.find(
        um => um.message_id === botMessage.id
      );

      return {
        id: botMessage.id,
        code: botMessage.code,
        message: userMessage ? userMessage.custom_message : botMessage.message,
        description: botMessage.description,
        originalMessage: botMessage.message,
        isCustom: !!userMessage,
        customMessageId: userMessage?.id
      };
    });
  }

  openEditModal(message: DisplayMessage) {
    this.selectedMessage = message;
    this.editedMessage = message.message;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedMessage = null;
    this.editedMessage = '';
  }

  restoreDefault() {
    if (this.selectedMessage) {
      this.editedMessage = this.selectedMessage.originalMessage;
    }
  }

  async saveMessage() {
    if (!this.selectedMessage || !this.currentUser || !this.editedMessage.trim()) {
      return;
    }

    try {
      if (this.selectedMessage.isCustom && this.selectedMessage.customMessageId) {
        // עדכון הודעה קיימת
        const { error } = await this.supabase.updateUserBotMessage(
          this.selectedMessage.customMessageId,
          { custom_message: this.editedMessage.trim() }
        );
        
        if (error) throw error;
      } else {
        // יצירת הודעה חדשה
        const { error } = await this.supabase.createUserBotMessage({
          user_id: this.currentUser.id,
          message_id: this.selectedMessage.id,
          custom_message: this.editedMessage.trim()
        });
        
        if (error) throw error;
      }

      // רענון הנתונים
      await this.loadMessages();
      this.closeEditModal();
      
    } catch (error) {
      console.error('Error saving message:', error);
      // כאן אפשר להוסיף הודעת שגיאה למשתמש
    }
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}