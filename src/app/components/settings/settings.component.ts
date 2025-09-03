import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./settings.component.css'],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h1>הגדרות</h1>
      </div>

      <div class="settings-menu">
        <button 
          class="settings-item"
          (click)="navigateTo('chat-messages')"
        >
          <div class="settings-item-content">
            <i class="material-icons">chat</i>
            <span class="settings-item-title">הודעות הצ'אט</span>
            <span class="settings-item-description">הגדרת הודעות אוטומטיות ותגובות</span>
          </div>
          <i class="material-icons arrow">chevron_left</i>
        </button>

        <button 
          class="settings-item"
          (click)="navigateTo('client-details')"
        >
          <div class="settings-item-content">
            <i class="material-icons">person_add</i>
            <span class="settings-item-title">איסוף פרטים מלקוח חדש</span>
            <span class="settings-item-description">הגדרת שאלות ופרטים לאיסוף מלקוחות חדשים</span>
          </div>
          <i class="material-icons arrow">chevron_left</i>
        </button>

        <button 
          class="settings-item"
          (click)="navigateTo('appointment-details')"
        >
          <div class="settings-item-content">
            <i class="material-icons">event_note</i>
            <span class="settings-item-title">איסוף פרטים לתור חדש</span>
            <span class="settings-item-description">הגדרת שאלות ופרטים לאיסוף בקביעת תור</span>
          </div>
          <i class="material-icons arrow">chevron_left</i>
        </button>

        <button 
          class="settings-item"
          (click)="navigateTo('display-settings')"
        >
          <div class="settings-item-content">
            <i class="material-icons">display_settings</i>
            <span class="settings-item-title">הגדרות תצוגה</span>
            <span class="settings-item-description">צבעים, ערכות נושא והגדרות יומן</span>
          </div>
          <i class="material-icons arrow">chevron_left</i>
        </button>

        <button 
          class="settings-item"
          (click)="navigateTo('business-info')"
        >
          <div class="settings-item-content">
            <i class="material-icons">business</i>
            <span class="settings-item-title">מידע על העסק</span>
            <span class="settings-item-description">פרטי העסק, איש קשר ומידע כללי</span>
          </div>
          <i class="material-icons arrow">chevron_left</i>
        </button>
      </div>
    </div>
  `
})
export class SettingsComponent {
  constructor(private router: Router) {}

  navigateTo(section: string) {
    this.router.navigate(['/settings', section]);
  }
}