import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-working-hours',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./working-hours.component.css'],
  template: `
    <div class="page-container">
      <h1>שעות עבודה</h1>
      <p>עמוד זה יפותח בהמשך...</p>
    </div>
  `
})
export class WorkingHoursComponent {}