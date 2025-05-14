
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { TablePermission } from "@/hooks/useUserRole";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type UserPermissionFormProps = {
  userId: string;
  userEmail: string;
  permissions: TablePermission[];
  onUpdatePermission: (userId: string, tableName: string, permission: {
    can_add?: boolean;
    can_edit?: boolean;
    can_delete?: boolean;
  }) => Promise<boolean>;
  onComplete?: () => void;
};

const tables = ["employee", "job", "department", "jobhistory"];

export default function UserPermissionForm({
  userId,
  userEmail,
  permissions,
  onUpdatePermission,
  onComplete
}: UserPermissionFormProps) {
  const [activeTab, setActiveTab] = useState("employee");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionState, setPermissionState] = useState<{
    [key: string]: { can_add: boolean; can_edit: boolean; can_delete: boolean }
  }>(() => {
    const state: { [key: string]: any } = {};
    
    // Initialize with default permissions for each table (all true)
    tables.forEach(tableName => {
      state[tableName] = { can_add: true, can_edit: true, can_delete: true };
    });
    
    // Override with actual permissions if available
    permissions.forEach(perm => {
      state[perm.table_name] = {
        can_add: perm.can_add,
        can_edit: perm.can_edit,
        can_delete: perm.can_delete
      };
    });
    
    return state;
  });

  // Find original permissions for comparison
  const getOriginalPermission = (tableName: string) => {
    return permissions.find(p => p.table_name === tableName) || {
      table_name: tableName,
      can_add: true,
      can_edit: true,
      can_delete: true
    };
  };

  // Check if permissions changed for the current table
  const hasChanges = (tableName: string) => {
    const original = getOriginalPermission(tableName);
    const current = permissionState[tableName];
    
    return (
      original.can_add !== current.can_add ||
      original.can_edit !== current.can_edit ||
      original.can_delete !== current.can_delete
    );
  };

  const handleSubmit = async () => {
    if (!hasChanges(activeTab)) {
      toast.info("No changes made");
      return;
    }

    try {
      setIsSubmitting(true);
      const current = permissionState[activeTab];
      
      const success = await onUpdatePermission(userId, activeTab, {
        can_add: current.can_add,
        can_edit: current.can_edit,
        can_delete: current.can_delete
      });
      
      if (success && onComplete) {
        onComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage User Permissions</CardTitle>
        <CardDescription>
          Set permissions for user: {userEmail}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="employee">Employees</TabsTrigger>
            <TabsTrigger value="job">Jobs</TabsTrigger>
            <TabsTrigger value="department">Departments</TabsTrigger>
            <TabsTrigger value="jobhistory">Job History</TabsTrigger>
          </TabsList>
          
          {tables.map(tableName => (
            <TabsContent key={tableName} value={tableName} className="space-y-4">
              <div className="grid gap-2">
                <h3 className="text-lg font-medium capitalize">{tableName} Permissions</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${tableName}-add`}
                    checked={permissionState[tableName].can_add}
                    onCheckedChange={(checked) => {
                      setPermissionState(prev => ({
                        ...prev,
                        [tableName]: {
                          ...prev[tableName],
                          can_add: checked === true
                        }
                      }));
                    }}
                  />
                  <label htmlFor={`${tableName}-add`} className="text-sm font-medium">
                    Can Add Records
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${tableName}-edit`}
                    checked={permissionState[tableName].can_edit}
                    onCheckedChange={(checked) => {
                      setPermissionState(prev => ({
                        ...prev,
                        [tableName]: {
                          ...prev[tableName],
                          can_edit: checked === true
                        }
                      }));
                    }}
                  />
                  <label htmlFor={`${tableName}-edit`} className="text-sm font-medium">
                    Can Edit Records
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${tableName}-delete`}
                    checked={permissionState[tableName].can_delete}
                    onCheckedChange={(checked) => {
                      setPermissionState(prev => ({
                        ...prev,
                        [tableName]: {
                          ...prev[tableName],
                          can_delete: checked === true
                        }
                      }));
                    }}
                  />
                  <label htmlFor={`${tableName}-delete`} className="text-sm font-medium">
                    Can Delete Records
                  </label>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !hasChanges(activeTab)}
          className="w-full bg-hr-blue hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Permissions'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
