
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

type UserRoleFormProps = {
  userId: string;
  userEmail: string;
  currentRole: UserRole | string;
  onUpdateRole: (userId: string, role: UserRole) => Promise<boolean>;
  onComplete?: () => void;
};

export default function UserRoleForm({
  userId,
  userEmail,
  currentRole,
  onUpdateRole,
  onComplete
}: UserRoleFormProps) {
  const [role, setRole] = useState<UserRole | string>(currentRole || 'user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!role || role === currentRole) {
      toast.info("No changes made");
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await onUpdateRole(userId, role as UserRole);
      
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
        <CardTitle>Update User Role</CardTitle>
        <CardDescription>
          Change the role for user: {userEmail}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
              Role
            </label>
            <Select value={role as string} onValueChange={(value) => setRole(value)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || role === currentRole}
          className="w-full bg-hr-blue hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Role'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
