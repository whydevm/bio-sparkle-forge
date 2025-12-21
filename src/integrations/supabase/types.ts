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
      badges: {
        Row: {
          badge_type: string
          created_at: string | null
          description: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          badge_type: string
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          badge_type?: string
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profile_music: {
        Row: {
          cover_url: string | null
          created_at: string | null
          id: string
          order_index: number | null
          profile_id: string
          title: string
          type: string | null
          url: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          profile_id: string
          title: string
          type?: string | null
          url: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          profile_id?: string
          title?: string
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_music_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          profile_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          profile_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string | null
          audio_shuffle: boolean | null
          avatar_decoration_url: string | null
          avatar_url: string | null
          background_type: string | null
          background_url: string | null
          bio: string | null
          bio_color: string | null
          bio_font: string | null
          border_enabled: boolean | null
          coding_badges: string[] | null
          created_at: string | null
          custom_cursor: string | null
          cycling_bio_enabled: boolean | null
          discord_avatar_enabled: boolean | null
          discord_avatar_url: string | null
          discord_decoration_url: string | null
          display_name: string | null
          display_name_color: string | null
          display_name_font: string | null
          entry_text: string | null
          entry_text_font: string | null
          glow_badges: boolean | null
          glow_socials: boolean | null
          glow_username: boolean | null
          id: string
          location: string | null
          monochrome_icons: boolean | null
          profile_blur: number | null
          profile_opacity: number | null
          show_audio_player: boolean | null
          updated_at: string | null
          user_id: string
          username: string
          username_effect: string | null
          view_count: number | null
        }
        Insert: {
          about_me?: string | null
          audio_shuffle?: boolean | null
          avatar_decoration_url?: string | null
          avatar_url?: string | null
          background_type?: string | null
          background_url?: string | null
          bio?: string | null
          bio_color?: string | null
          bio_font?: string | null
          border_enabled?: boolean | null
          coding_badges?: string[] | null
          created_at?: string | null
          custom_cursor?: string | null
          cycling_bio_enabled?: boolean | null
          discord_avatar_enabled?: boolean | null
          discord_avatar_url?: string | null
          discord_decoration_url?: string | null
          display_name?: string | null
          display_name_color?: string | null
          display_name_font?: string | null
          entry_text?: string | null
          entry_text_font?: string | null
          glow_badges?: boolean | null
          glow_socials?: boolean | null
          glow_username?: boolean | null
          id?: string
          location?: string | null
          monochrome_icons?: boolean | null
          profile_blur?: number | null
          profile_opacity?: number | null
          show_audio_player?: boolean | null
          updated_at?: string | null
          user_id: string
          username: string
          username_effect?: string | null
          view_count?: number | null
        }
        Update: {
          about_me?: string | null
          audio_shuffle?: boolean | null
          avatar_decoration_url?: string | null
          avatar_url?: string | null
          background_type?: string | null
          background_url?: string | null
          bio?: string | null
          bio_color?: string | null
          bio_font?: string | null
          border_enabled?: boolean | null
          coding_badges?: string[] | null
          created_at?: string | null
          custom_cursor?: string | null
          cycling_bio_enabled?: boolean | null
          discord_avatar_enabled?: boolean | null
          discord_avatar_url?: string | null
          discord_decoration_url?: string | null
          display_name?: string | null
          display_name_color?: string | null
          display_name_font?: string | null
          entry_text?: string | null
          entry_text_font?: string | null
          glow_badges?: boolean | null
          glow_socials?: boolean | null
          glow_username?: boolean | null
          id?: string
          location?: string | null
          monochrome_icons?: boolean | null
          profile_blur?: number | null
          profile_opacity?: number | null
          show_audio_player?: boolean | null
          updated_at?: string | null
          user_id?: string
          username?: string
          username_effect?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          custom_icon_url: string | null
          icon: string | null
          id: string
          label: string
          order_index: number | null
          platform: string
          profile_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          custom_icon_url?: string | null
          icon?: string | null
          id?: string
          label: string
          order_index?: number | null
          platform: string
          profile_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          custom_icon_url?: string | null
          icon?: string | null
          id?: string
          label?: string
          order_index?: number | null
          platform?: string
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          granted_at: string | null
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_view_count: {
        Args: { profile_username: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
