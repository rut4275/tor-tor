import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  styleUrls: ['./layout.component.css'],
  template: `
    <div class="app-layout" [class.rtl]="true">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      // בדיקת אימות
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) {
        this.router.navigate(['/login']);
        return;
      }

      // ניווט ליומן רק אם אנחנו בדף הבית
      if (this.router.url === '/') {
        this.router.navigate(['/calendar']);
      }
    } catch (error) {
      console.error('Error getting session:', error);
      this.router.navigate(['/login']);
    }
  }
}