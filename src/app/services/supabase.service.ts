import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // יוצרים client יחיד לכל האפליקציה
  private static supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }
  );

  // Cache for current user to prevent multiple requests
  private static currentUserCache: any = null;
  private static currentUserPromise: Promise<any> | null = null;

  constructor() {}

  get client() {
    return SupabaseService.supabase;
  }

  get auth() {
    return SupabaseService.supabase.auth;
  }

  // פונקציות עזר לטבלאות
  async getAppointments(userId: string, startDate: string, endDate: string) {
    return await SupabaseService.supabase
      .from('appointments')
      .select(`
        *,
        clients(name, phone),
        treatments(name, duration_minutes, price)
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
      .order('start_time');
  }

  async createAppointment(appointment: any) {
    return await SupabaseService.supabase
      .from('appointments')
      .insert(appointment);
  }

  async updateAppointment(id: number, updates: any) {
    return await SupabaseService.supabase
      .from('appointments')
      .update(updates)
      .eq('id', id);
  }

  async deleteAppointment(id: number) {
    return await SupabaseService.supabase
      .from('appointments')
      .delete()
      .eq('id', id);
  }

  async getClients(userId: string) {
    return await SupabaseService.supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name');
  }

  async getTreatments(userId: string) {
    return await SupabaseService.supabase
      .from('treatments')
      .select('*')
      .eq('user_id', userId)
      .order('name');
  }

  async createTreatment(treatment: any) {
    return await SupabaseService.supabase
      .from('treatments')
      .insert(treatment);
  }

  async updateTreatment(id: number, updates: any) {
    return await SupabaseService.supabase
      .from('treatments')
      .update(updates)
      .eq('id', id);
  }

  async deleteTreatment(id: number) {
    return await SupabaseService.supabase
      .from('treatments')
      .delete()
      .eq('id', id);
  }
  async createClient(client: any) {
    return await SupabaseService.supabase
      .from('clients')
      .insert(client);
  }
  async updateClient(id: number, updates: any) {
    return await SupabaseService.supabase
      .from('clients')
      .update(updates)
      .eq('id', id);
  }
  async deleteClient(id: number) {
    return await SupabaseService.supabase
      .from('clients')
      .delete()
      .eq('id', id);
  }
  async getClientAppointments(clientId: number) {
    return await SupabaseService.supabase
      .from('appointments')
      .select(`
        *,
        treatments(name, price)
      `)
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });
  }
  async getCurrentUser() {
    // Return cached user if available
    if (SupabaseService.currentUserCache) {
      return SupabaseService.currentUserCache;
    }

    // If there's already a request in progress, wait for it
    if (SupabaseService.currentUserPromise) {
      return await SupabaseService.currentUserPromise;
    }

    // Create new request
    SupabaseService.currentUserPromise = this.fetchCurrentUser();
    
    try {
      const user = await SupabaseService.currentUserPromise;
      SupabaseService.currentUserCache = user;
      return user;
    } finally {
      SupabaseService.currentUserPromise = null;
    }
  }

  private async fetchCurrentUser() {
    try {
      const { data: { user } } = await SupabaseService.supabase.auth.getUser();
      if (user) {
        const { data } = await SupabaseService.supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  // Method to clear cache when user logs out
  clearUserCache() {
    SupabaseService.currentUserCache = null;
    SupabaseService.currentUserPromise = null;
  }

  // Bot Messages functions
  async getBotMessages(userId: string) {
    return await SupabaseService.supabase
      .from('bot_messages')
      .select('*')
      .order('code');
  }

  async getUserBotMessages(userId: string) {
    return await SupabaseService.supabase
      .from('user_bot_messages')
      .select('*')
      .eq('user_id', userId);
  }

  async createUserBotMessage(userBotMessage: any) {
    return await SupabaseService.supabase
      .from('user_bot_messages')
      .insert(userBotMessage);
      // .eq('user_id', userBotMessage.user_id);
  }

  async updateUserBotMessage(id: string, updates: any) {
    return await SupabaseService.supabase
      .from('user_bot_messages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  async deleteUserBotMessage(id: string) {
    return await SupabaseService.supabase
      .from('user_bot_messages')
      .delete()
      .eq('id', id);
  }

  // Answer Types functions
  async getAnswerTypes() {
    return await SupabaseService.supabase
      .from('answer_types')
      .select('*')
      .order('id');
  }

  // Client Questions functions
  async getClientQuestions(userId: string) {
    return await SupabaseService.supabase
      .from('client_questions')
      .select(`
        *,
        answer_types(name)
      `)
      .eq('user_id', userId)
      .order('id');
  }

  async createClientQuestion(question: any) {
    return await SupabaseService.supabase
      .from('client_questions')
      .insert(question);
  }

  async updateClientQuestion(id: number, updates: any) {
    return await SupabaseService.supabase
      .from('client_questions')
      .update(updates)
      .eq('id', id);
  }

  async deleteClientQuestion(id: number) {
    return await SupabaseService.supabase
      .from('client_questions')
      .delete()
      .eq('id', id);
  }

  // Appointment Questions functions
  async getAppointmentQuestions(userId: string) {
    return await SupabaseService.supabase
      .from('appointment_questions')
      .select(`
        *,
        answer_types(name)
      `)
      .eq('user_id', userId)
      .order('id');
  }

  async createAppointmentQuestion(question: any) {
    return await SupabaseService.supabase
      .from('appointment_questions')
      .insert(question);
  }

  async updateAppointmentQuestion(id: number, updates: any) {
    return await SupabaseService.supabase
      .from('appointment_questions')
      .update(updates)
      .eq('id', id);
  }

  async deleteAppointmentQuestion(id: number) {
    return await SupabaseService.supabase
      .from('appointment_questions')
      .delete()
      .eq('id', id);
  }

  // Business Info functions
  async getBusinessInfo(userId: string) {
    return await SupabaseService.supabase
      .from('business_info')
      .select('*')
      .eq('user_id', userId)
      .single();
  }

  async createBusinessInfo(businessInfo: any) {
    return await SupabaseService.supabase
      .from('business_info')
      .insert(businessInfo);
  }

  async updateBusinessInfo(userId: string, updates: any) {
    return await SupabaseService.supabase
      .from('business_info')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  // Calendar Settings functions
  async getCalendarSettings(userId: string) {
    return await SupabaseService.supabase
      .from('calendar_settings')
      .select(`
        *,
        themes(name, primary_color, secondary_color)
      `)
      .eq('user_id', userId)
      .single();
  }

  async createCalendarSettings(settings: any) {
    return await SupabaseService.supabase
      .from('calendar_settings')
      .insert(settings);
  }

  async updateCalendarSettings(userId: string, updates: any) {
    return await SupabaseService.supabase
      .from('calendar_settings')
      .update(updates)
      .eq('user_id', userId);
  }

  // Themes functions
  async getThemes() {
    return await SupabaseService.supabase
      .from('themes')
      .select('*')
      .order('id');
  }
}
