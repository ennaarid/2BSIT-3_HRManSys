
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error("Error fetching user role:", roleError);
      }

      // Fetch user permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('table_name, can_add, can_edit, can_delete')
        .eq('user_id', user.id);

      if (permissionsError) {
        console.error("Error fetching user permissions:", permissionsError);
      }

      setRole(roleData?.role || 'user');
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
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole,
          updated_at: new Date().toISOString()
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
      // First check if permission record exists
      const { data: existingPerm, error: checkError } = await supabase
        .from('user_permissions')
        .select('id, can_add, can_edit, can_delete')
        .eq('user_id', userId)
        .eq('table_name', tableName)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      let updatedPermission = {};
      
      if (existingPerm) {
        updatedPermission = {
          id: existingPerm.id,
          can_add: permission.can_add !== undefined ? permission.can_add : existingPerm.can_add,
          can_edit: permission.can_edit !== undefined ? permission.can_edit : existingPerm.can_edit,
          can_delete: permission.can_delete !== undefined ? permission.can_delete : existingPerm.can_delete,
          updated_at: new Date().toISOString()
        };
      } else {
        updatedPermission = {
          user_id: userId,
          table_name: tableName,
          can_add: permission.can_add !== undefined ? permission.can_add : true,
          can_edit: permission.can_edit !== undefined ? permission.can_edit : true,
          can_delete: permission.can_delete !== undefined ? permission.can_delete : true
        };
      }

      const { error: updateError } = await supabase
        .from('user_permissions')
        .upsert(updatedPermission);

      if (updateError) throw updateError;
      
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
