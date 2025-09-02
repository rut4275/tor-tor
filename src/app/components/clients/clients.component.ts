import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  joined_date: string;
  extra_data?: any;
}

interface Appointment {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  treatments?: { name: string; price: number };
  actual_cost: number;
  notes?: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./clients.component.css'],
  template: `
    <div class="clients-container">
      <div class="clients-header">
        <h1>רשימת לקוחות</h1>
        <button 
          class="add-client-btn"
          (click)="openNewClientModal()"
        >
          + לקוח חדש
        </button>
      </div>

      <div class="search-section">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            (input)="filterClients()"
            placeholder="חיפוש לקוח (שם, טלפון, אימייל)"
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="filter-stats">
          <span>{{ filteredClients.length }} מתוך {{ clients.length }} לקוחות</span>
        </div>
      </div>

      <div class="clients-grid">
        <div 
          *ngFor="let client of filteredClients" 
          class="client-card"
          (click)="openClientDetails(client)"
        >
          <div class="client-avatar">
            {{ getClientInitials(client.name) }}
          </div>
          
          <div class="client-info">
            <h3 class="client-name">{{ client.name }}</h3>
            <p class="client-phone">{{ client.phone }}</p>
            <p class="client-email" *ngIf="client.email">{{ client.email }}</p>
            <p class="client-joined">הצטרף: {{ formatDate(client.joined_date) }}</p>
          </div>
          
          <div class="client-stats">
            <div class="stat">
              <span class="stat-number">{{ getClientAppointmentCount(client.id) }}</span>
              <span class="stat-label">תורים</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="filteredClients.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>לא נמצאו לקוחות</h3>
        <p *ngIf="searchTerm">נסה לשנות את מונחי החיפוש</p>
        <p *ngIf="!searchTerm">עדיין לא הוספת לקוחות למערכת</p>
        <button 
          class="add-first-client-btn"
          (click)="openNewClientModal()"
        >
          הוסף לקוח חדש
        </button>
      </div>
    </div>

    <!-- מודל לקוח חדש -->
    <div 
      *ngIf="showNewClientModal" 
      class="modal-overlay"
      (click)="closeNewClientModal()"
    >
      <div 
        class="modal-content"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3>{{ isEditMode ? 'עריכת לקוח' : 'לקוח חדש' }}</h3>
          <button 
            class="close-btn"
            (click)="closeNewClientModal()"
          >
            ×
          </button>
        </div>
        
        <form class="client-form">
          <div class="form-group">
            <label>שם מלא *</label>
            <input 
              type="text" 
              [(ngModel)]="newClient.name"
              name="name"
              required
              placeholder="הכנס שם מלא"
            >
          </div>

          <div class="form-group">
            <label>טלפון *</label>
            <input 
              type="tel" 
              [(ngModel)]="newClient.phone"
              name="phone"
              required
              placeholder="050-1234567"
            >
          </div>

          <div class="form-group">
            <label>אימייל</label>
            <input 
              type="email" 
              [(ngModel)]="newClient.email"
              name="email"
              placeholder="example@email.com"
            >
          </div>

          <div class="form-group">
            <label>הערות</label>
            <textarea 
              [(ngModel)]="newClient.notes"
              name="notes"
              rows="3"
              placeholder="הערות נוספות על הלקוח"
            ></textarea>
          </div>

          <div class="form-actions">
            <button 
              type="button"
              class="cancel-btn"
              (click)="closeNewClientModal()"
            >
              ביטול
            </button>
            <button 
              type="button"
              class="save-btn"
              (click)="saveClient()"
              [disabled]="!newClient.name || !newClient.phone"
            >
              {{ isEditMode ? 'עדכן' : 'שמור' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- מודל פרטי לקוח -->
    <div 
      *ngIf="showClientDetailsModal" 
      class="modal-overlay"
      (click)="closeClientDetailsModal()"
    >
      <div 
        class="modal-content client-details-modal"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3>פרטי לקוח</h3>
          <div class="header-actions">
            <button 
              class="edit-client-btn"
              (click)="editClient(selectedClient!)"
            >
              ✏️ עריכה
            </button>
            <button 
              class="close-btn"
              (click)="closeClientDetailsModal()"
            >
              ×
            </button>
          </div>
        </div>
        
        <div class="client-details-content" *ngIf="selectedClient">
          <div class="client-profile">
            <div class="client-avatar-large">
              {{ getClientInitials(selectedClient.name) }}
            </div>
            <div class="client-main-info">
              <h2>{{ selectedClient.name }}</h2>
              <p class="phone">📞 {{ selectedClient.phone }}</p>
              <p class="email" *ngIf="selectedClient.email">✉️ {{ selectedClient.email }}</p>
              <p class="joined">הצטרף: {{ formatDate(selectedClient.joined_date) }}</p>
            </div>
          </div>

          <div class="client-stats-section">
            <div class="stat-card">
              <div class="stat-number">{{ clientAppointments.length }}</div>
              <div class="stat-label">סה"כ תורים</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ getTotalSpent() | currency:'ILS':'symbol':'1.0-0' }}</div>
              <div class="stat-label">סה"כ הוצאות</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ getLastVisit() }}</div>
              <div class="stat-label">ביקור אחרון</div>
            </div>
          </div>

          <div class="notes-section" *ngIf="selectedClient.notes">
            <h4>הערות</h4>
            <p class="notes-text">{{ selectedClient.notes }}</p>
          </div>

          <div class="appointments-history">
            <h4>היסטוריית טיפולים</h4>
            
            <div *ngIf="clientAppointments.length === 0" class="no-appointments">
              <p>עדיין לא בוצעו טיפולים ללקוח זה</p>
            </div>

            <div class="appointments-list" *ngIf="clientAppointments.length > 0">
              <div 
                *ngFor="let appointment of clientAppointments" 
                class="appointment-item"
              >
                <div class="appointment-date">
                  <div class="date">{{ formatDate(appointment.date) }}</div>
                  <div class="time">{{ appointment.start_time }} - {{ appointment.end_time }}</div>
                </div>
                
                <div class="appointment-details">
                  <div class="treatment-name">{{ appointment.treatments?.name || 'טיפול לא ידוע' }}</div>
                  <div class="appointment-cost">{{ appointment.actual_cost | currency:'ILS':'symbol':'1.0-0' }}</div>
                </div>
                
                <div class="appointment-notes" *ngIf="appointment.notes">
                  <small>{{ appointment.notes }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';
  showNewClientModal = false;
  showClientDetailsModal = false;
  selectedClient: Client | null = null;
  clientAppointments: Appointment[] = [];
  currentUser: any = null;
  isEditMode = false;
  editingClientId: number | null = null;

  newClient = {
    name: '',
    phone: '',
    email: '',
    notes: ''
  };

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadClients();
  }

  async loadCurrentUser() {
    this.currentUser = await this.supabase.getCurrentUser();
  }

  async loadClients() {
    if (!this.currentUser) return;

    const { data, error } = await this.supabase.getClients(this.currentUser.id);
    if (!error && data) {
      this.clients = data;
      this.filteredClients = [...this.clients];
    }
  }

  filterClients() {
    if (!this.searchTerm.trim()) {
      this.filteredClients = [...this.clients];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client => 
      client.name.toLowerCase().includes(term) ||
      client.phone.includes(term) ||
      (client.email && client.email.toLowerCase().includes(term))
    );
  }

  getClientInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  getClientAppointmentCount(clientId: number): number {
    // זה יחזור מהשרת בעתיד, כרגע נחזיר 0
    return 0;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL');
  }

  openNewClientModal() {
    this.showNewClientModal = true;
    this.isEditMode = false;
    this.editingClientId = null;
    this.newClient = {
      name: '',
      phone: '',
      email: '',
      notes: ''
    };
  }

  closeNewClientModal() {
    this.showNewClientModal = false;
    this.isEditMode = false;
    this.editingClientId = null;
  }

  async saveClient() {
    if (!this.currentUser || !this.newClient.name || !this.newClient.phone) {
      return;
    }

    if (this.isEditMode && this.editingClientId) {
      // עריכת לקוח קיים
      const { error } = await this.supabase.updateClient(this.editingClientId, this.newClient);
      
      if (!error) {
        this.closeNewClientModal();
        await this.loadClients();
      }
    } else {
      // יצירת לקוח חדש
      const clientData = {
        ...this.newClient,
        user_id: this.currentUser.id
      };

      const { error } = await this.supabase.createClient(clientData);
      
      if (!error) {
        this.closeNewClientModal();
        await this.loadClients();
      }
    }
  }

  editClient(client: Client) {
    this.isEditMode = true;
    this.editingClientId = client.id;
    this.showNewClientModal = true;
    this.showClientDetailsModal = false;
    
    this.newClient = {
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || ''
    };
  }

  async openClientDetails(client: Client) {
    this.selectedClient = client;
    this.showClientDetailsModal = true;
    await this.loadClientAppointments(client.id);
  }

  closeClientDetailsModal() {
    this.showClientDetailsModal = false;
    this.selectedClient = null;
    this.clientAppointments = [];
  }

  async loadClientAppointments(clientId: number) {
    if (!this.currentUser) return;

    const { data, error } = await this.supabase.getClientAppointments(clientId);
    if (!error && data) {
      this.clientAppointments = data;
    }
  }

  getTotalSpent(): number {
    return this.clientAppointments.reduce((total, apt) => total + (apt.actual_cost || 0), 0);
  }

  getLastVisit(): string {
    if (this.clientAppointments.length === 0) return 'אין ביקורים';
    
    const lastAppointment = this.clientAppointments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    return this.formatDate(lastAppointment.date);
  }
}