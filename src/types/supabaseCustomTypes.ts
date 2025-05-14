
import { Database } from '@/integrations/supabase/types';

// Define the table types that aren't in the generated Database type
export interface ExtendedDatabase extends Database {
  public: {
    Tables: {
      // Include existing tables from Database type
      ...Database['public']['Tables'],
      
      // Add our custom tables
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [{
          foreignKeyName: "user_roles_user_id_fkey";
          columns: ["user_id"];
          referencedRelation: "users";
          referencedColumns: ["id"];
        }];
      };
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          table_name: string;
          can_add: boolean;
          can_edit: boolean;
          can_delete: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          table_name: string;
          can_add: boolean;
          can_edit: boolean;
          can_delete: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          table_name?: string;
          can_add?: boolean;
          can_edit?: boolean;
          can_delete?: boolean;
          updated_at?: string;
        };
        Relationships: [{
          foreignKeyName: "user_permissions_user_id_fkey";
          columns: ["user_id"];
          referencedRelation: "users";
          referencedColumns: ["id"];
        }];
      };
    };
    // Include other properties from Database type
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
};

// Extended types for RPCs
export interface RPCReturnTypes {
  get_user_role_by_id: {
    role: string;
  };
  get_user_roles_all: {
    user_id: string;
    role: string;
  }[];
  get_user_permissions: {
    table_name: string;
    can_add: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }[];
  get_all_user_permissions: {
    user_id: string;
    table_name: string;
    can_add: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }[];
}
