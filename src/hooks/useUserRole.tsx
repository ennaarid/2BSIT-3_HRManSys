
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { UserRole as UserRoleType, UserPermissionRecord } from "@/types/supabase";

export type UserRole = 'admin' | 'user' | 'blocked';

export type TablePermission = {
  table_name: string;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [permissions, setPermissions] = useState<TablePermission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoleAndPermissions = async () => {
    try {
      if (!user) {
        setRole('user');
        setPermissions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch user role using RPC instead of direct table query
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role_by_id', { user_id: user.id })
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error("Error fetching user role:", roleError);
      }

      // Fetch user permissions using RPC instead of direct table query
      const { data: permissionsData, error: permissionsError } = await supabase
        .rpc('get_user_permissions', { user_id: user.id });

      if (permissionsError) {
        console.error("Error fetching user permissions:", permissionsError);
      }

      setRole((roleData?.role || 'user') as UserRole);
      setPermissions(permissionsData || []);
    } catch (error) {
      console.error("Error in useUserRole:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoleAndPermissions();
  }, [user]);

  // Check if user is an admin
  const isAdmin = role === 'admin';
  
  // Check if user is blocked
  const isBlocked = role === 'blocked';

  // Check permission for a specific table and action
  const hasPermission = (tableName: string, action: 'add' | 'edit' | 'delete'): boolean => {
    if (isAdmin) return true;
    if (isBlocked) return false;
    
    const tablePermission = permissions.find(p => p.table_name === tableName);
    if (!tablePermission) return true; // Default to true if no specific permissions are set
    
    switch (action) {
      case 'add': return tablePermission.can_add;
      case 'edit': return tablePermission.can_edit;
      case 'delete': return tablePermission.can_delete;
      default: return false;
    }
  };

  // Update a user's role
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { data, error } = await supabase
        .rpc('update_user_role', { 
          p_user_id: userId,
          p_role: newRole
        });

      if (error) throw error;
      
      toast.success(`User role updated to ${newRole}`);
      return true;
    } catch (error: any) {
      toast.error('Error updating user role: ' + error.message);
      return false;
    }
  };

  // Update a user's permissions for a specific table
  const updateUserPermission = async (
    userId: string, 
    tableName: string, 
    permission: { can_add?: boolean; can_edit?: boolean; can_delete?: boolean }
  ) => {
    try {
      const { data, error } = await supabase
        .rpc('update_user_permission', {
          p_user_id: userId,
          p_table_name: tableName,
          p_can_add: permission.can_add !== undefined ? permission.can_add : null,
          p_can_edit: permission.can_edit !== undefined ? permission.can_edit : null,
          p_can_delete: permission.can_delete !== undefined ? permission.can_delete : null
        });

      if (error) throw error;
      
      toast.success(`User permissions updated for ${tableName} table`);
      return true;
    } catch (error: any) {
      toast.error('Error updating user permissions: ' + error.message);
      return false;
    }
  };
  
  // Restore a soft-deleted record
  const restoreRecord = async (tableName: string, recordId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('restore_record', { 
          p_table_name: tableName, 
          p_record_id: recordId 
        });
      
      if (error) throw error;
      
      toast.success(`Record restored successfully`);
      return true;
    } catch (error: any) {
      toast.error('Error restoring record: ' + error.message);
      return false;
    }
  };

  return { 
    role, 
    isAdmin, 
    isBlocked, 
    loading, 
    permissions,
    hasPermission,
    updateUserRole,
    updateUserPermission,
    restoreRecord,
    refreshUserRole: fetchUserRoleAndPermissions
  };
}
