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
      about_content: {
        Row: {
          description: string
          id: string
          name: string | null
          profile_image: string | null
          read_line: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description: string
          id?: string
          name?: string | null
          profile_image?: string | null
          read_line?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string
          id?: string
          name?: string | null
          profile_image?: string | null
          read_line?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          active: boolean | null
          category: string
          created_at: string | null
          created_by: string | null
          date: string
          excerpt: string
          id: string
          linkedin_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string | null
          created_by?: string | null
          date: string
          excerpt: string
          id?: string
          linkedin_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          excerpt?: string
          id?: string
          linkedin_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      book_content: {
        Row: {
          cover_image: string | null
          description: string
          id: string
          purchase_link: string | null
          sample_link: string | null
          subtitle: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cover_image?: string | null
          description: string
          id?: string
          purchase_link?: string | null
          sample_link?: string | null
          subtitle: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cover_image?: string | null
          description?: string
          id?: string
          purchase_link?: string | null
          sample_link?: string | null
          subtitle?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      book_features: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string
          display_order: number
          icon: string
          id: string
          title: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description: string
          display_order: number
          icon: string
          id?: string
          title: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string
          display_order?: number
          icon?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      book_reviews: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_order: number
          id: string
          rating: number
          review_text: string
          reviewer_name: string
          reviewer_title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_order: number
          id?: string
          rating?: number
          review_text: string
          reviewer_name: string
          reviewer_title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number
          id?: string
          rating?: number
          review_text?: string
          reviewer_name?: string
          reviewer_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          email: string
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          updated_at: string | null
          updated_by: string | null
          whatsapp: string
          youtube_url: string | null
        }
        Insert: {
          email: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp: string
          youtube_url?: string | null
        }
        Update: {
          email?: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          cta_primary: string
          cta_secondary: string
          headline: string
          id: string
          stat1_label: string
          stat1_number: string
          stat2_label: string
          stat2_number: string
          stat3_label: string
          stat3_number: string
          subtitle: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cta_primary: string
          cta_secondary: string
          headline: string
          id?: string
          stat1_label: string
          stat1_number: string
          stat2_label: string
          stat2_number: string
          stat3_label: string
          stat3_number: string
          subtitle: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cta_primary?: string
          cta_secondary?: string
          headline?: string
          id?: string
          stat1_label?: string
          stat1_number?: string
          stat2_label?: string
          stat2_number?: string
          stat3_label?: string
          stat3_number?: string
          subtitle?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ia_content_map: {
        Row: {
          ativo: boolean | null
          competencia: Database["public"]["Enums"]["competencia_tipo"]
          created_at: string
          descricao: string | null
          id: string
          ordem: number | null
          tipo: string
          titulo: string
          url: string
        }
        Insert: {
          ativo?: boolean | null
          competencia: Database["public"]["Enums"]["competencia_tipo"]
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number | null
          tipo: string
          titulo: string
          url: string
        }
        Update: {
          ativo?: boolean | null
          competencia?: Database["public"]["Enums"]["competencia_tipo"]
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number | null
          tipo?: string
          titulo?: string
          url?: string
        }
        Relationships: []
      }
      ia_maturity_leads: {
        Row: {
          competencias: Json | null
          concluido: boolean | null
          created_at: string
          email: string
          finalidade: Database["public"]["Enums"]["finalidade_tipo"]
          id: string
          nivel_maturidade:
            | Database["public"]["Enums"]["maturidade_nivel"]
            | null
          nome: string
          recomendacoes: Json | null
          respostas: Json | null
          score_avancado: number | null
          score_basico: number | null
          score_geral: number | null
          score_intermediario: number | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          competencias?: Json | null
          concluido?: boolean | null
          created_at?: string
          email: string
          finalidade: Database["public"]["Enums"]["finalidade_tipo"]
          id?: string
          nivel_maturidade?:
            | Database["public"]["Enums"]["maturidade_nivel"]
            | null
          nome: string
          recomendacoes?: Json | null
          respostas?: Json | null
          score_avancado?: number | null
          score_basico?: number | null
          score_geral?: number | null
          score_intermediario?: number | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          competencias?: Json | null
          concluido?: boolean | null
          created_at?: string
          email?: string
          finalidade?: Database["public"]["Enums"]["finalidade_tipo"]
          id?: string
          nivel_maturidade?:
            | Database["public"]["Enums"]["maturidade_nivel"]
            | null
          nome?: string
          recomendacoes?: Json | null
          respostas?: Json | null
          score_avancado?: number | null
          score_basico?: number | null
          score_geral?: number | null
          score_intermediario?: number | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      ia_maturity_questions: {
        Row: {
          competencia: Database["public"]["Enums"]["competencia_tipo"]
          created_at: string
          finalidade: Database["public"]["Enums"]["finalidade_tipo"]
          id: string
          nivel: Database["public"]["Enums"]["nivel_tipo"]
          ordem: number
          pergunta: string
        }
        Insert: {
          competencia: Database["public"]["Enums"]["competencia_tipo"]
          created_at?: string
          finalidade: Database["public"]["Enums"]["finalidade_tipo"]
          id?: string
          nivel: Database["public"]["Enums"]["nivel_tipo"]
          ordem: number
          pergunta: string
        }
        Update: {
          competencia?: Database["public"]["Enums"]["competencia_tipo"]
          created_at?: string
          finalidade?: Database["public"]["Enums"]["finalidade_tipo"]
          id?: string
          nivel?: Database["public"]["Enums"]["nivel_tipo"]
          ordem?: number
          pergunta?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string
          display_order: number
          icon: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description: string
          display_order: number
          icon: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string
          display_order?: number
          icon?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
    }
    Enums: {
      app_role: "admin" | "user"
      competencia_tipo:
        | "estrategia"
        | "processos"
        | "dados"
        | "ferramentas"
        | "pessoas"
        | "etica"
        | "seguranca"
        | "governanca"
      finalidade_tipo: "PF" | "PJ"
      maturidade_nivel: "Iniciante" | "Em evolução" | "Avançado"
      nivel_tipo: "BASICO" | "INTERMEDIARIO" | "AVANCADO"
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
      competencia_tipo: [
        "estrategia",
        "processos",
        "dados",
        "ferramentas",
        "pessoas",
        "etica",
        "seguranca",
        "governanca",
      ],
      finalidade_tipo: ["PF", "PJ"],
      maturidade_nivel: ["Iniciante", "Em evolução", "Avançado"],
      nivel_tipo: ["BASICO", "INTERMEDIARIO", "AVANCADO"],
    },
  },
} as const
