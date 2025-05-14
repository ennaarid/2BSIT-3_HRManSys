
// Define the new user-related tables that we're using
export type UserRole = 'admin' | 'user' | 'blocked';

export interface UserRoleRecord {
  user_id: string;
  role: UserRole;
  updated_at: string;
}

export interface UserPermissionRecord {
  id?: string;
  user_id: string;
  table_name: string;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  updated_at?: string;
}
