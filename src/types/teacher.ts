export interface Teacher {
  id: string;
  username: string;
  email?: string | null;
  school_name?: string | null;
  password?: string; // only for auth, avoid exposing
  staff_code?: string | null;
  is_super_admin: boolean;
  is_approved: boolean;
  created_at?: string;
}

export interface PendingTeacherRequest extends Omit<Teacher, 'password'> {
  // Pending teachers shown to superadmin
}
