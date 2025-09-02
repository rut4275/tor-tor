import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./settings.component.css'],
  template: `
    <div class="page-container">
      <h1>הגדרות</h1>
      <p>עמוד זה יפותח בהמשך...</p>
    </div>
  `
})
export class SettingsComponent {}