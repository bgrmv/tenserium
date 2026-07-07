import { InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import type { Database } from '../types/supabase.types';

export type TypedSupabaseClient = SupabaseClient<Database>;

export const SUPABASE_CLIENT = new InjectionToken<TypedSupabaseClient>('SupabaseClient', {
  providedIn: 'root',
  factory: () => createClient<Database>(environment.supabaseUrl, environment.supabaseAnonKey),
});
