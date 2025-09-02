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
          <span class="nav-icon">📅</span>
          <span>היומן שלי</span>
        </a>
        
        <a 
          routerLink="/treatments" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="nav-icon">💆‍♀️</span>
          <span>טיפולים</span>
        </a>
        
        <a 
          routerLink="/clients" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="nav-icon">👥</span>
          <span>לקוחות</span>
        </a>
        
        <a 
          routerLink="/rules" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="nav-icon">📋</span>
          <span>כללים</span>
        </a>
        
        <a 
          routerLink="/working-hours" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="nav-icon">⏰</span>
          <span>שעות עבודה</span>
        </a>
        
        <a 
          routerLink="/settings" 
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="nav-icon">⚙️</span>
          <span>הגדרות</span>
        </a>
      </nav>
    </div>
  `
})
export class SidebarComponent {}