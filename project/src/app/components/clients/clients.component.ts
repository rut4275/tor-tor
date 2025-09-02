import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./clients.component.css'],
  template: `
    <div class="page-container">
      <h1>לקוחות</h1>
      <p>עמוד זה יפותח בהמשך...</p>
    </div>
  `
})
export class ClientsComponent {}