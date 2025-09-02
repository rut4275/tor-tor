import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./rules.component.css'],
  template: `
    <div class="page-container">
      <h1>כללים</h1>
      <p>עמוד זה יפותח בהמשך...</p>
    </div>
  `
})
export class RulesComponent {}