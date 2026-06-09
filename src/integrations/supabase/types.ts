export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_consultations: {
        Row: {
          ai_response: string
          created_at: string
          id: string
          type: string
          user_id: string
          user_input: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          id?: string
          type: string
          user_id: string
          user_input: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          id?: string
          type?: string
          user_id?: string
          user_input?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_days: number | null
          icon: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          icon?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          icon?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      checkups: {
        Row: {
          checkup_date: string
          created_at: string
          diagnosis: string | null
          doctor: string | null
          hospital: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          checkup_date: string
          created_at?: string
          diagnosis?: string | null
          doctor?: string | null
          hospital?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          checkup_date?: string
          created_at?: string
          diagnosis?: string | null
          doctor?: string | null
          hospital?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_name: string | null
          category: string | null
          content: string
          created_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      hospital_bookings: {
        Row: {
          booking_date: string
          booking_time: string | null
          complaint: string | null
          created_at: string
          hospital_address: string | null
          hospital_name: string
          hospital_phone: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_time?: string | null
          complaint?: string | null
          created_at?: string
          hospital_address?: string | null
          hospital_name: string
          hospital_phone?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string | null
          complaint?: string | null
          created_at?: string
          hospital_address?: string | null
          hospital_name?: string
          hospital_phone?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      initial_questionnaire: {
        Row: {
          ai_analysis: string | null
          created_at: string
          id: string
          responses: Json
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          created_at?: string
          id?: string
          responses: Json
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          created_at?: string
          id?: string
          responses?: Json
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          active: boolean
          created_at: string
          dosage: string | null
          id: string
          name: string
          notes: string | null
          schedule_times: string[] | null
          times_per_day: number | null
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          id?: string
          name: string
          notes?: string | null
          schedule_times?: string[] | null
          times_per_day?: number | null
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          id?: string
          name?: string
          notes?: string | null
          schedule_times?: string[] | null
          times_per_day?: number | null
          user_id?: string
        }
        Relationships: []
      }
      monitoring_logs: {
        Row: {
          ai_feedback: string | null
          ate_breakfast: boolean | null
          ate_dinner: boolean | null
          ate_lunch: boolean | null
          created_at: string
          exercised: boolean | null
          id: string
          mood: string | null
          notes: string | null
          sleep_hours: number | null
          symptoms: string | null
          user_id: string
          water_glasses: number | null
        }
        Insert: {
          ai_feedback?: string | null
          ate_breakfast?: boolean | null
          ate_dinner?: boolean | null
          ate_lunch?: boolean | null
          created_at?: string
          exercised?: boolean | null
          id?: string
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          symptoms?: string | null
          user_id: string
          water_glasses?: number | null
        }
        Update: {
          ai_feedback?: string | null
          ate_breakfast?: boolean | null
          ate_dinner?: boolean | null
          ate_lunch?: boolean | null
          created_at?: string
          exercised?: boolean | null
          id?: string
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          symptoms?: string | null
          user_id?: string
          water_glasses?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          ai_initial_analysis: string | null
          allergies: string | null
          avatar_mood: string | null
          blood_type: string | null
          chronic_conditions: string | null
          created_at: string
          current_medications: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          onboarded: boolean
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          ai_initial_analysis?: string | null
          allergies?: string | null
          avatar_mood?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          current_medications?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          onboarded?: boolean
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          ai_initial_analysis?: string | null
          allergies?: string | null
          avatar_mood?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          current_medications?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          onboarded?: boolean
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          active: boolean
          created_at: string
          id: string
          notes: string | null
          recurring: string | null
          reminder_date: string | null
          reminder_time: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          recurring?: string | null
          reminder_date?: string | null
          reminder_time?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          recurring?: string | null
          reminder_date?: string | null
          reminder_time?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_code: string
          earned_at: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          badge_code: string
          earned_at?: string
          id?: string
          label: string
          user_id: string
        }
        Update: {
          badge_code?: string
          earned_at?: string
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed: boolean | null
          id: string
          progress_days: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          id?: string
          progress_days?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          id?: string
          progress_days?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
  public: {
    Enums: {},
  },
} as const
