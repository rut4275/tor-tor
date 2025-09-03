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
        detectSessionInUrl: false,
      },
    }
  );

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
  }
}
