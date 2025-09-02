import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./treatments.component.css'],
  template: `
    <div class="page-container">
      <h1>טיפולים</h1>
      <p>עמוד זה יפותח בהמשך...</p>
    </div>
  `
})
export class TreatmentsComponent {}