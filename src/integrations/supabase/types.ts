export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer: {
        Row: {
          address: string | null
          custname: string | null
          custno: string
          payterm: string | null
        }
        Insert: {
          address?: string | null
          custname?: string | null
          custno: string
          payterm?: string | null
        }
        Update: {
          address?: string | null
          custname?: string | null
          custno?: string
          payterm?: string | null
        }
        Relationships: []
      }
      department: {
        Row: {
          deptcode: string
          deptname: string | null
          stamp: string | null
          status: string | null
        }
        Insert: {
          deptcode: string
          deptname?: string | null
          stamp?: string | null
          status?: string | null
        }
        Update: {
          deptcode?: string
          deptname?: string | null
          stamp?: string | null
          status?: string | null
        }
        Relationships: []
      }
      employee: {
        Row: {
          birthdate: string | null
          empno: string
          firstname: string | null
          gender: string | null
          hiredate: string | null
          lastname: string | null
          sepdate: string | null
          stamp: string | null
          status: string | null
        }
        Insert: {
          birthdate?: string | null
          empno: string
          firstname?: string | null
          gender?: string | null
          hiredate?: string | null
          lastname?: string | null
          sepdate?: string | null
          stamp?: string | null
          status?: string | null
        }
        Update: {
          birthdate?: string | null
          empno?: string
          firstname?: string | null
          gender?: string | null
          hiredate?: string | null
          lastname?: string | null
          sepdate?: string | null
          stamp?: string | null
          status?: string | null
        }
        Relationships: []
      }
      job: {
        Row: {
          jobcode: string
          jobdesc: string | null
          stamp: string | null
          status: string | null
        }
        Insert: {
          jobcode: string
          jobdesc?: string | null
          stamp?: string | null
          status?: string | null
        }
        Update: {
          jobcode?: string
          jobdesc?: string | null
          stamp?: string | null
          status?: string | null
        }
        Relationships: []
      }
      jobhistory: {
        Row: {
          deptcode: string | null
          effdate: string
          empno: string
          jobcode: string
          salary: number | null
          stamp: string | null
          status: string | null
        }
        Insert: {
          deptcode?: string | null
          effdate: string
          empno: string
          jobcode: string
          salary?: number | null
          stamp?: string | null
          status?: string | null
        }
        Update: {
          deptcode?: string | null
          effdate?: string
          empno?: string
          jobcode?: string
          salary?: number | null
          stamp?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobhistory_deptcode_fkey"
            columns: ["deptcode"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["deptcode"]
          },
          {
            foreignKeyName: "jobhistory_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["empno"]
          },
          {
            foreignKeyName: "jobhistory_jobcode_fkey"
            columns: ["jobcode"]
            isOneToOne: false
            referencedRelation: "job"
            referencedColumns: ["jobcode"]
          },
        ]
      }
      payment: {
        Row: {
          amount: number | null
          orno: string
          paydate: string | null
          transno: string | null
        }
        Insert: {
          amount?: number | null
          orno: string
          paydate?: string | null
          transno?: string | null
        }
        Update: {
          amount?: number | null
          orno?: string
          paydate?: string | null
          transno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["transno"]
          },
        ]
      }
      pricehist: {
        Row: {
          effdate: string
          prodcode: string
          unitprice: number | null
        }
        Insert: {
          effdate: string
          prodcode: string
          unitprice?: number | null
        }
        Update: {
          effdate?: string
          prodcode?: string
          unitprice?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricehist_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["prodcode"]
          },
        ]
      }
      product: {
        Row: {
          description: string | null
          prodcode: string
          unit: string | null
        }
        Insert: {
          description?: string | null
          prodcode: string
          unit?: string | null
        }
        Update: {
          description?: string | null
          prodcode?: string
          unit?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          custno: string | null
          empno: string | null
          salesdate: string | null
          transno: string
        }
        Insert: {
          custno?: string | null
          empno?: string | null
          salesdate?: string | null
          transno: string
        }
        Update: {
          custno?: string | null
          empno?: string | null
          salesdate?: string | null
          transno?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_custno_fkey"
            columns: ["custno"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["custno"]
          },
          {
            foreignKeyName: "sales_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["empno"]
          },
        ]
      }
      salesdetail: {
        Row: {
          prodcode: string
          quantity: number | null
          transno: string
        }
        Insert: {
          prodcode: string
          quantity?: number | null
          transno: string
        }
        Update: {
          prodcode?: string
          quantity?: number | null
          transno?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesdetail_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["prodcode"]
          },
          {
            foreignKeyName: "salesdetail_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["transno"]
          },
        ]
      }
      user_profiles: {
        Row: {
          can_add_department: boolean
          can_add_employee: boolean
          can_add_job: boolean
          can_add_jobhistory: boolean
          can_delete_department: boolean
          can_delete_employee: boolean
          can_delete_job: boolean
          can_delete_jobhistory: boolean
          can_edit_department: boolean
          can_edit_employee: boolean
          can_edit_job: boolean
          can_edit_jobhistory: boolean
          created_at: string | null
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          can_add_department?: boolean
          can_add_employee?: boolean
          can_add_job?: boolean
          can_add_jobhistory?: boolean
          can_delete_department?: boolean
          can_delete_employee?: boolean
          can_delete_job?: boolean
          can_delete_jobhistory?: boolean
          can_edit_department?: boolean
          can_edit_employee?: boolean
          can_edit_job?: boolean
          can_edit_jobhistory?: boolean
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          can_add_department?: boolean
          can_add_employee?: boolean
          can_add_job?: boolean
          can_add_jobhistory?: boolean
          can_delete_department?: boolean
          can_delete_employee?: boolean
          can_delete_job?: boolean
          can_delete_jobhistory?: boolean
          can_edit_department?: boolean
          can_edit_employee?: boolean
          can_edit_job?: boolean
          can_edit_jobhistory?: boolean
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_blocked: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
