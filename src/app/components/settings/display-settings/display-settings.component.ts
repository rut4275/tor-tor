import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-display-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="breadcrumb">
        <span class="breadcrumb-item" (click)="goToSettings()">הגדרות</span>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">הגדרות תצוגה</span>
      </div>
      
      <h1>הגדרות תצוגה</h1>
      <p>עמוד זה יפותח בהמשך...</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .breadcrumb {
      margin-bottom: 2rem;
      font-size: 1rem;
      color: #666;
    }

    .breadcrumb-item {
      color: #ca5184;
      cursor: pointer;
      text-decoration: underline;
    }

    .breadcrumb-item:hover {
      color: #e674a3;
    }

    .breadcrumb-separator {
      margin: 0 0.5rem;
      color: #999;
    }

    .breadcrumb-current {
      color: #333;
      font-weight: 600;
    }

    h1 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 2rem;
      font-weight: 700;
    }
  `]
})
export class DisplaySettingsComponent {
  constructor(private router: Router) {}

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}