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
      assets: {
        Row: {
          asset_type: string
          created_at: string
          downloads: number | null
          file_name: string
          file_url: string
          id: string
          uploader_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          downloads?: number | null
          file_name: string
          file_url: string
          id?: string
          uploader_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          downloads?: number | null
          file_name?: string
          file_url?: string
          id?: string
          uploader_id?: string
        }
        Relationships: []
      }
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
      link_clicks: {
        Row: {
          clicked_at: string
          country_code: string | null
          id: string
          link_id: string
          profile_id: string
        }
        Insert: {
          clicked_at?: string
          country_code?: string | null
          id?: string
          link_id: string
          profile_id: string
        }
        Update: {
          clicked_at?: string
          country_code?: string | null
          id?: string
          link_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "social_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_clicks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      profile_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_profile_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          country_code: string | null
          id: string
          profile_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          country_code?: string | null
          id?: string
          profile_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          country_code?: string | null
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
          audio_sticky: boolean | null
          avatar_decoration_url: string | null
          avatar_url: string | null
          background_effect: string | null
          background_type: string | null
          background_url: string | null
          badge_border: boolean | null
          badge_colors: Json | null
          banner_url: string | null
          bio: string | null
          bio_color: string | null
          bio_font: string | null
          border_enabled: boolean | null
          click_sounds: boolean | null
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
          entry_animation: string | null
          entry_text: string | null
          entry_text_font: string | null
          glow_badges: boolean | null
          glow_socials: boolean | null
          glow_username: boolean | null
          id: string
          link_colors: Json | null
          link_shiny: boolean | null
          location: string | null
          monochrome_icons: boolean | null
          parallax_enabled: boolean | null
          parallax_intensity: number | null
          parallax_inverted: boolean | null
          profile_blur: number | null
          profile_opacity: number | null
          projects_description: string | null
          projects_title: string | null
          scroll_text: string | null
          show_audio_player: boolean | null
          show_join_date: boolean | null
          show_likes: boolean | null
          show_views: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
          username: string
          username_effect: string | null
          view_count: number | null
          views_animation: boolean | null
        }
        Insert: {
          about_me?: string | null
          audio_shuffle?: boolean | null
          audio_sticky?: boolean | null
          avatar_decoration_url?: string | null
          avatar_url?: string | null
          background_effect?: string | null
          background_type?: string | null
          background_url?: string | null
          badge_border?: boolean | null
          badge_colors?: Json | null
          banner_url?: string | null
          bio?: string | null
          bio_color?: string | null
          bio_font?: string | null
          border_enabled?: boolean | null
          click_sounds?: boolean | null
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
          entry_animation?: string | null
          entry_text?: string | null
          entry_text_font?: string | null
          glow_badges?: boolean | null
          glow_socials?: boolean | null
          glow_username?: boolean | null
          id?: string
          link_colors?: Json | null
          link_shiny?: boolean | null
          location?: string | null
          monochrome_icons?: boolean | null
          parallax_enabled?: boolean | null
          parallax_intensity?: number | null
          parallax_inverted?: boolean | null
          profile_blur?: number | null
          profile_opacity?: number | null
          projects_description?: string | null
          projects_title?: string | null
          scroll_text?: string | null
          show_audio_player?: boolean | null
          show_join_date?: boolean | null
          show_likes?: boolean | null
          show_views?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          username: string
          username_effect?: string | null
          view_count?: number | null
          views_animation?: boolean | null
        }
        Update: {
          about_me?: string | null
          audio_shuffle?: boolean | null
          audio_sticky?: boolean | null
          avatar_decoration_url?: string | null
          avatar_url?: string | null
          background_effect?: string | null
          background_type?: string | null
          background_url?: string | null
          badge_border?: boolean | null
          badge_colors?: Json | null
          banner_url?: string | null
          bio?: string | null
          bio_color?: string | null
          bio_font?: string | null
          border_enabled?: boolean | null
          click_sounds?: boolean | null
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
          entry_animation?: string | null
          entry_text?: string | null
          entry_text_font?: string | null
          glow_badges?: boolean | null
          glow_socials?: boolean | null
          glow_username?: boolean | null
          id?: string
          link_colors?: Json | null
          link_shiny?: boolean | null
          location?: string | null
          monochrome_icons?: boolean | null
          parallax_enabled?: boolean | null
          parallax_intensity?: number | null
          parallax_inverted?: boolean | null
          profile_blur?: number | null
          profile_opacity?: number | null
          projects_description?: string | null
          projects_title?: string | null
          scroll_text?: string | null
          show_audio_player?: boolean | null
          show_join_date?: boolean | null
          show_likes?: boolean | null
          show_views?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
          username_effect?: string | null
          view_count?: number | null
          views_animation?: boolean | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          order_index: number | null
          profile_id: string
          tags: string[] | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          profile_id: string
          tags?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          profile_id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_cards: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          extra_data: Json | null
          follower_count: number | null
          id: string
          identifier: string
          order_index: number | null
          platform: string
          profile_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          extra_data?: Json | null
          follower_count?: number | null
          id?: string
          identifier: string
          order_index?: number | null
          platform: string
          profile_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          extra_data?: Json | null
          follower_count?: number | null
          id?: string
          identifier?: string
          order_index?: number | null
          platform?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_cards_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string | null
          custom_color: string | null
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
          custom_color?: string | null
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
          custom_color?: string | null
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
