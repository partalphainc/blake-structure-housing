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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_url: string
          id: string
          lease_id: string | null
          notes: string | null
          uploaded_by: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_url: string
          id?: string
          lease_id?: string | null
          notes?: string | null
          uploaded_by: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          lease_id?: string | null
          notes?: string | null
          uploaded_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_reports: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          occupancy_rate: number | null
          property_id: string
          report_month: string
          total_expenses: number | null
          total_revenue: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          occupancy_rate?: number | null
          property_id: string
          report_month: string
          total_expenses?: number | null
          total_revenue?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          occupancy_rate?: number | null
          property_id?: string
          report_month?: string
          total_expenses?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string
          document_url: string | null
          end_date: string | null
          id: string
          payment_frequency: string | null
          rent_amount: number
          start_date: string
          status: string | null
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          end_date?: string | null
          id?: string
          payment_frequency?: string | null
          rent_amount: number
          start_date: string
          status?: string | null
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          end_date?: string | null
          id?: string
          payment_frequency?: string | null
          rent_amount?: number
          start_date?: string
          status?: string | null
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          image_urls: string[] | null
          priority: string | null
          resolved_at: string | null
          status: string | null
          tenant_id: string
          title: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          image_urls?: string[] | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          tenant_id: string
          title: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          image_urls?: string[] | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          lease_id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          recorded_by: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          lease_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          recorded_by?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          lease_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          recorded_by?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          city: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          property_type: string | null
          state: string | null
          status: string | null
          total_units: number | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          property_type?: string | null
          state?: string | null
          status?: string | null
          total_units?: number | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          property_type?: string | null
          state?: string | null
          status?: string | null
          total_units?: number | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          amenities: string[] | null
          created_at: string
          deposit: number | null
          id: string
          insurance_eligible: boolean | null
          is_furnished: boolean | null
          minimum_stay: string | null
          property_id: string
          rate_monthly: number | null
          rate_weekly: number | null
          status: string | null
          unit_name: string
          unit_type: string | null
          utilities_included: boolean | null
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string
          deposit?: number | null
          id?: string
          insurance_eligible?: boolean | null
          is_furnished?: boolean | null
          minimum_stay?: string | null
          property_id: string
          rate_monthly?: number | null
          rate_weekly?: number | null
          status?: string | null
          unit_name: string
          unit_type?: string | null
          utilities_included?: boolean | null
        }
        Update: {
          amenities?: string[] | null
          created_at?: string
          deposit?: number | null
          id?: string
          insurance_eligible?: boolean | null
          is_furnished?: boolean | null
          minimum_stay?: string | null
          property_id?: string
          rate_monthly?: number | null
          rate_weekly?: number | null
          status?: string | null
          unit_name?: string
          unit_type?: string | null
          utilities_included?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      is_owner_of_property: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      is_tenant_of_unit: {
        Args: { _unit_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "resident" | "investor" | "admin"
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
      app_role: ["resident", "investor", "admin"],
    },
  },
} as const
