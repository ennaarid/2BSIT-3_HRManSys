
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, UserRole, TablePermission } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Key, User, Settings } from "lucide-react";
import UserRoleForm from "@/components/UserManagement/UserRoleForm";
import UserPermissionForm from "@/components/UserManagement/UserPermissionForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserData = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  permissions: TablePermission[];
};

export default function UserManagement() {
  const { user } = useAuth();
  const { isAdmin, updateUserRole, updateUserPermission } = useUserRole();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'role' | 'permissions'>('role');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Get all user roles using RPC
      const { data: userRolesData, error: rolesError } = await supabase
        .rpc('get_user_roles_all');
      
      if (rolesError) throw rolesError;

      // Convert to a map for easier lookup
      const userRoles = new Map();
      userRolesData?.forEach(item => {
        userRoles.set(item.user_id, item.role);
      });

      // Get all user permissions using RPC
      const { data: userPermissionsData, error: permissionsError } = await supabase
        .rpc('get_all_user_permissions');
      
      if (permissionsError) throw permissionsError;

      // Group permissions by user
      const permissionsByUser = new Map<string, TablePermission[]>();
      userPermissionsData?.forEach(p => {
        if (!permissionsByUser.has(p.user_id)) {
          permissionsByUser.set(p.user_id, []);
        }
        permissionsByUser.get(p.user_id)?.push({
          table_name: p.table_name,
          can_add: p.can_add,
          can_edit: p.can_edit,
          can_delete: p.can_delete
        });
      });

      // Combine the data
      const userList: UserData[] = authUsers.users.map(authUser => {
        return {
          id: authUser.id,
          email: authUser.email || 'No email',
          role: (userRoles.get(authUser.id) || 'user') as UserRole,
          created_at: authUser.created_at,
          permissions: permissionsByUser.get(authUser.id) || []
        };
      });

      setUsers(userList);
    } catch (error: any) {
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleOpenRoleDialog = (userData: UserData) => {
    setSelectedUser(userData);
    setDialogType('role');
    setDialogOpen(true);
  };

  const handleOpenPermissionsDialog = (userData: UserData) => {
    setSelectedUser(userData);
    setDialogType('permissions');
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      // Update the local state
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      handleDialogClose();
    }
    return success;
  };

  const handlePermissionUpdate = async (
    userId: string, 
    tableName: string, 
    permission: { can_add?: boolean; can_edit?: boolean; can_delete?: boolean }
  ) => {
    const success = await updateUserPermission(userId, tableName, permission);
    if (success) {
      // Update the local state
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id !== userId) return u;
        
        // Find if permission already exists
        const existingPermIndex = u.permissions.findIndex(p => p.table_name === tableName);
        let updatedPermissions = [...u.permissions];
        
        if (existingPermIndex >= 0) {
          // Update existing permission
          updatedPermissions[existingPermIndex] = {
            ...updatedPermissions[existingPermIndex],
            ...permission
          };
        } else {
          // Add new permission
          updatedPermissions.push({
            table_name: tableName,
            can_add: permission.can_add !== undefined ? permission.can_add : true,
            can_edit: permission.can_edit !== undefined ? permission.can_edit : true,
            can_delete: permission.can_delete !== undefined ? permission.can_delete : true
          });
        }
        
        return {
          ...u,
          permissions: updatedPermissions
        };
      }));
    }
    return success;
  };

  // Show admin access only message if not admin
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Key className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Admin Access Required</h2>
          <p className="text-gray-500 mt-2">
            You need admin privileges to access the user management page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell className="font-medium">{userData.email}</TableCell>
                    <TableCell>
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${userData.role === 'admin' ? 'bg-blue-100 text-blue-800' : ''}
                        ${userData.role === 'user' ? 'bg-green-100 text-green-800' : ''}
                        ${userData.role === 'blocked' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {userData.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(userData.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRoleDialog(userData)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Role
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPermissionsDialog(userData)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Permissions
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for role/permissions management */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'role' ? 'Update User Role' : 'Manage User Permissions'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'role' 
                ? 'Change the user\'s role in the system' 
                : 'Set what actions this user can perform'}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && dialogType === 'role' && (
            <UserRoleForm
              userId={selectedUser.id}
              userEmail={selectedUser.email}
              currentRole={selectedUser.role}
              onUpdateRole={handleRoleUpdate}
              onComplete={handleDialogClose}
            />
          )}

          {selectedUser && dialogType === 'permissions' && (
            <UserPermissionForm
              userId={selectedUser.id}
              userEmail={selectedUser.email}
              permissions={selectedUser.permissions}
              onUpdatePermission={handlePermissionUpdate}
              onComplete={handleDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
