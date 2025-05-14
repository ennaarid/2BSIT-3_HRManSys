
import { useEffect, useState } from "react";
import { useUserRole } from "./useUserRole";

export function useTableState(tableName: 'employee' | 'job' | 'department' | 'jobhistory') {
  const { hasPermission } = useUserRole();
  
  const [canAdd, setCanAdd] = useState(true);
  const [canEdit, setCanEdit] = useState(true);
  const [canDelete, setCanDelete] = useState(true);
  
  useEffect(() => {
    setCanAdd(hasPermission(tableName, 'add'));
    setCanEdit(hasPermission(tableName, 'edit'));
    setCanDelete(hasPermission(tableName, 'delete'));
  }, [hasPermission, tableName]);
  
  return {
    canAdd,
    canEdit,
    canDelete
  };
}
