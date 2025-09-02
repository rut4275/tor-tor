import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./sidebar.component.css'],
  template: `
    <div class="sidebar">
      <div class="logo">
        <h2>מערכת תורים</h2>
      </div>
      
      <nav class="nav-menu">
        <a 
          routerLink="/calendar" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="material-icons">calendar_today</span>
          <span> היומן שלי</span>
        </a>
        
        <a 
          routerLink="/treatments" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="material-icons">spa</span>
          <span>טיפולים</span>
        </a>
        
        <a 
          routerLink="/clients" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="material-icons">group</span>
          <span>לקוחות</span>
        </a>
        
        <a 
          routerLink="/rules" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="material-icons">rule</span>
          <span>כללים</span>
        </a>
        
        <a 
          routerLink="/working-hours" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="material-icons">schedule</span>
          <span>שעות עבודה</span>
        </a>
        
        <a 
          routerLink="/settings" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="material-icons">settings</span>
          <span>הגדרות</span>
        </a>
      </nav>
    </div>
  `
})
export class SidebarComponent {}