export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: Record<never, never>
    Views: Record<never, never>
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          reason: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string | null
          id: string
          text: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          text: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_challenge: {
        Row: {
          created_at: string
          date: string
          question_ids: string[]
        }
        Insert: {
          created_at?: string
          date: string
          question_ids: string[]
        }
        Update: {
          created_at?: string
          date?: string
          question_ids?: string[]
        }
        Relationships: []
      }
      error_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          question_id: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["error_status"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          question_id?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["error_status"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          question_id?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["error_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_reply: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          created_at: string
          description: string
          email: string | null
          id: string
          status: Database["public"]["Enums"]["feedback_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          category?: Database["public"]["Enums"]["feedback_category"]
          created_at?: string
          description: string
          email?: string | null
          id?: string
          status?: Database["public"]["Enums"]["feedback_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          category?: Database["public"]["Enums"]["feedback_category"]
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          status?: Database["public"]["Enums"]["feedback_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      match_answers: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          match_id: string
          player_id: string
          points: number
          question_idx: number
          response_ms: number
          tense_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          match_id: string
          player_id: string
          points?: number
          question_idx: number
          response_ms: number
          tense_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          match_id?: string
          player_id?: string
          points?: number
          question_idx?: number
          response_ms?: number
          tense_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_answers_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      match_queue: {
        Row: {
          enqueued_at: string
          id: string
          league: Database["public"]["Enums"]["league"]
          tier: Database["public"]["Enums"]["rank_tier"]
          user_id: string
        }
        Insert: {
          enqueued_at?: string
          id?: string
          league: Database["public"]["Enums"]["league"]
          tier: Database["public"]["Enums"]["rank_tier"]
          user_id: string
        }
        Update: {
          enqueued_at?: string
          id?: string
          league?: Database["public"]["Enums"]["league"]
          tier?: Database["public"]["Enums"]["rank_tier"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          is_squad: boolean
          league: Database["public"]["Enums"]["league"]
          player_ids: string[]
          scores: Json
          state: Database["public"]["Enums"]["match_state"]
          tier: Database["public"]["Enums"]["rank_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_squad?: boolean
          league: Database["public"]["Enums"]["league"]
          player_ids: string[]
          scores?: Json
          state?: Database["public"]["Enums"]["match_state"]
          tier: Database["public"]["Enums"]["rank_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_squad?: boolean
          league?: Database["public"]["Enums"]["league"]
          player_ids?: string[]
          scores?: Json
          state?: Database["public"]["Enums"]["match_state"]
          tier?: Database["public"]["Enums"]["rank_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          accuracy_rate: number | null
          created_at: string
          difficulty: number
          flagged_count: number
          id: string
          league: Database["public"]["Enums"]["league"]
          prompt: Json
          status: Database["public"]["Enums"]["question_status"]
          tense_id: string
          type: string
          updated_at: string
        }
        Insert: {
          accuracy_rate?: number | null
          created_at?: string
          difficulty: number
          flagged_count?: number
          id?: string
          league?: Database["public"]["Enums"]["league"]
          prompt: Json
          status?: Database["public"]["Enums"]["question_status"]
          tense_id: string
          type: string
          updated_at?: string
        }
        Update: {
          accuracy_rate?: number | null
          created_at?: string
          difficulty?: number
          flagged_count?: number
          id?: string
          league?: Database["public"]["Enums"]["league"]
          prompt?: Json
          status?: Database["public"]["Enums"]["question_status"]
          tense_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_answers: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          points: number
          question_id: string | null
          response_ms: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          points?: number
          question_id?: string | null
          response_ms: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          points?: number
          question_id?: string | null
          response_ms?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          accuracy: number | null
          created_at: string
          duration_ms: number | null
          id: string
          mode: Database["public"]["Enums"]["session_mode"]
          score: number
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          mode: Database["public"]["Enums"]["session_mode"]
          score?: number
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          mode?: Database["public"]["Enums"]["session_mode"]
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_data: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "user_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          ban_reason: string | null
          created_at: string
          daily_rank_matches: number
          email: string
          id: string
          is_banned: boolean
          is_premium: boolean
          last_active_at: string | null
          league: Database["public"]["Enums"]["league"]
          nickname: string | null
          rank_points: number
          rank_tier: Database["public"]["Enums"]["rank_tier"]
          role: Database["public"]["Enums"]["app_role"]
          suspended_until: string | null
          updated_at: string
        }
        Insert: {
          ban_reason?: string | null
          created_at?: string
          daily_rank_matches?: number
          email: string
          id: string
          is_banned?: boolean
          is_premium?: boolean
          last_active_at?: string | null
          league?: Database["public"]["Enums"]["league"]
          nickname?: string | null
          rank_points?: number
          rank_tier?: Database["public"]["Enums"]["rank_tier"]
          role?: Database["public"]["Enums"]["app_role"]
          suspended_until?: string | null
          updated_at?: string
        }
        Update: {
          ban_reason?: string | null
          created_at?: string
          daily_rank_matches?: number
          email?: string
          id?: string
          is_banned?: boolean
          is_premium?: boolean
          last_active_at?: string | null
          league?: Database["public"]["Enums"]["league"]
          nickname?: string | null
          rank_points?: number
          rank_tier?: Database["public"]["Enums"]["rank_tier"]
          role?: Database["public"]["Enums"]["app_role"]
          suspended_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: { min_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "support" | "moderator" | "admin"
      error_status: "open" | "resolved" | "dismissed"
      feedback_category: "bug" | "feature" | "content" | "other"
      feedback_status: "new" | "unread" | "answered" | "closed"
      league: "elementary" | "intermediate" | "advanced"
      match_state: "queued" | "in_progress" | "completed"
      question_status: "active" | "draft" | "pending_review" | "archived"
      rank_tier: "iron" | "bronze" | "silver" | "gold" | "platinum"
      session_mode: "normal" | "rank" | "squad" | "daily"
    }
    CompositeTypes: Record<never, never>
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["user", "support", "moderator", "admin"],
      error_status: ["open", "resolved", "dismissed"],
      feedback_category: ["bug", "feature", "content", "other"],
      feedback_status: ["new", "unread", "answered", "closed"],
      league: ["elementary", "intermediate", "advanced"],
      match_state: ["queued", "in_progress", "completed"],
      question_status: ["active", "draft", "pending_review", "archived"],
      rank_tier: ["iron", "bronze", "silver", "gold", "platinum"],
      session_mode: ["normal", "rank", "squad", "daily"],
    },
  },
} as const
