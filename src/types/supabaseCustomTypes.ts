
// Type definitions for Supabase database tables

export interface User {
  id: string;
  full_name?: string | null;
  role: 'admin' | 'user' | 'blocked';
  can_edit_employee: boolean;
  can_delete_employee: boolean;
  can_add_employee: boolean;
  can_edit_job: boolean;
  can_delete_job: boolean;
  can_add_job: boolean;
  can_edit_department: boolean;
  can_delete_department: boolean;
  can_add_department: boolean;
  can_edit_jobhistory: boolean;
  can_delete_jobhistory: boolean;
  can_add_jobhistory: boolean;
  created_at?: string | null;
}

export interface Employee {
  empno: string;
  firstname: string | null;
  lastname: string | null;
  gender: string | null;
  hiredate: string | null;
  birthdate: string | null;
  sepdate: string | null;
  status: 'ADDED' | 'EDITED' | 'DELETED' | 'RESTORED' | null;
  stamp: string | null;
}

export interface Job {
  jobcode: string;
  jobdesc: string | null;
  status: 'ADDED' | 'EDITED' | 'DELETED' | 'RESTORED' | null;
  stamp: string | null;
}

export interface Department {
  deptcode: string;
  deptname: string | null;
  status: 'ADDED' | 'EDITED' | 'DELETED' | 'RESTORED' | null;
  stamp: string | null;
}

export interface JobHistory {
  empno: string;
  jobcode: string;
  effdate: string;
  deptcode: string | null;
  salary: number | null;
  status: 'ADDED' | 'EDITED' | 'DELETED' | 'RESTORED' | null;
  stamp: string | null;
}

export interface Relationships {
  employee: { 
    jobhistory: JobHistory[];
  };
  job: {
    jobhistory: JobHistory[];
  };
  department: {
    jobhistory: JobHistory[];
  };
  jobhistory: {
    employee: Employee;
    job: Job;
    department: Department | null;
  };
}
