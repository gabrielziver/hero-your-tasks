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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_quest_completions: {
        Row: {
          completed_at: string
          group_quest_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          group_quest_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          group_quest_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_quest_completions_group_quest_id_fkey"
            columns: ["group_quest_id"]
            isOneToOne: false
            referencedRelation: "group_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      group_quests: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          group_id: string
          id: string
          is_active: boolean
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          group_id: string
          id?: string
          is_active?: boolean
          title: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          group_id?: string
          id?: string
          is_active?: boolean
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_quests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_color: string | null
          avatar_url: string | null
          character_images: Json | null
          created_at: string | null
          id: string
          selected_character: string | null
          username: string
        }
        Insert: {
          avatar_color?: string | null
          avatar_url?: string | null
          character_images?: Json | null
          created_at?: string | null
          id: string
          selected_character?: string | null
          username: string
        }
        Update: {
          avatar_color?: string | null
          avatar_url?: string | null
          character_images?: Json | null
          created_at?: string | null
          id?: string
          selected_character?: string | null
          username?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string | null
          current_month_completions: number | null
          current_streak: number | null
          frequency_data: Json | null
          gold_reward: number
          habit_score: number | null
          id: string
          is_boss_quest: boolean | null
          is_completed: boolean | null
          is_recurring: boolean | null
          last_completion_date: string | null
          monthly_target: number | null
          priority: string
          recurrence_days: number[] | null
          recurrence_type: string | null
          title: string
          trend_indicator: string | null
          user_id: string
          xp_reward: number
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string | null
          current_month_completions?: number | null
          current_streak?: number | null
          frequency_data?: Json | null
          gold_reward?: number
          habit_score?: number | null
          id?: string
          is_boss_quest?: boolean | null
          is_completed?: boolean | null
          is_recurring?: boolean | null
          last_completion_date?: string | null
          monthly_target?: number | null
          priority?: string
          recurrence_days?: number[] | null
          recurrence_type?: string | null
          title: string
          trend_indicator?: string | null
          user_id: string
          xp_reward?: number
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string | null
          current_month_completions?: number | null
          current_streak?: number | null
          frequency_data?: Json | null
          gold_reward?: number
          habit_score?: number | null
          id?: string
          is_boss_quest?: boolean | null
          is_completed?: boolean | null
          is_recurring?: boolean | null
          last_completion_date?: string | null
          monthly_target?: number | null
          priority?: string
          recurrence_days?: number[] | null
          recurrence_type?: string | null
          title?: string
          trend_indicator?: string | null
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      user_pets: {
        Row: {
          created_at: string
          evolution_stage: number
          id: string
          is_active: boolean
          pet_images: Json | null
          pet_name: string | null
          pet_type: string
          pet_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evolution_stage?: number
          id?: string
          is_active?: boolean
          pet_images?: Json | null
          pet_name?: string | null
          pet_type: string
          pet_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evolution_stage?: number
          id?: string
          is_active?: boolean
          pet_images?: Json | null
          pet_name?: string | null
          pet_type?: string
          pet_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          current_streak: number | null
          current_xp: number | null
          gold: number | null
          last_quest_date: string | null
          level: number | null
          quests_completed: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          current_xp?: number | null
          gold?: number | null
          last_quest_date?: string | null
          level?: number | null
          quests_completed?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          current_xp?: number | null
          gold?: number | null
          last_quest_date?: string | null
          level?: number | null
          quests_completed?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_habit_score: { Args: { quest_id: string }; Returns: number }
      complete_group_quest: { Args: { quest_id: string }; Returns: Json }
      complete_quest: { Args: { quest_id: string }; Returns: Json }
      get_user_groups: { Args: { _user_id: string }; Returns: string[] }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      reset_monthly_habit_completions: { Args: never; Returns: undefined }
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
