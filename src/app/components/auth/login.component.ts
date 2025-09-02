import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./login.component.css'],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>כניסה למערכת</h1>
          <p>מערכת קביעת תורים מתקדמת</p>
        </div>

        <form (ngSubmit)="login()" class="login-form">
          <div class="form-group">
            <label>אימייל</label>
            <input 
              type="email" 
              [(ngModel)]="email"
              name="email"
              required
              placeholder="הכנס אימייל"
            >
          </div>

          <div class="form-group">
            <label>סיסמה</label>
            <input 
              type="password" 
              [(ngModel)]="password"
              name="password"
              required
              placeholder="הכנס סיסמה"
            >
          </div>

          <button 
            type="submit" 
            class="login-btn"
            [disabled]="loading"
          >
            {{ loading ? 'מתחבר...' : 'התחבר' }}
          </button>

          <div class="register-link">
            <p>
              עדיין אין לך חשבון? 
              <a href="#" (click)="toggleMode()">הרשמה</a>
            </p>
          </div>
        </form>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async login() {
    this.loading = true;
    this.error = '';
    
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password
      });

      if (error) {
        this.error = 'שגיאה בהתחברות. בדוק את הפרטים ונסה שוב.';
      } else {
        this.router.navigate(['/calendar']);
      }
    } catch (err) {
      this.error = 'אירעה שגיאה בלתי צפויה.';
    } finally {
      this.loading = false;
    }
  }

  toggleMode() {
    // TODO: להוסיף עמוד הרשמה
    console.log('מעבר להרשמה');
  }
}