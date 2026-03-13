import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Teacher } from '../types/teacher';

interface AuthContextType {
  teacher: Teacher | null;
  isSuperAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string, schoolName: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTeacherJson = localStorage.getItem('teacher');
    if (storedTeacherJson) {
      try {
        const storedTeacher: Teacher = JSON.parse(storedTeacherJson);
        setTeacher(storedTeacher);
      } catch (error) {
        console.error('Invalid stored teacher data:', error);
        localStorage.removeItem('teacher');
      }
    }
    setIsLoading(false);
  }, []);

  const isSuperAdmin = teacher?.is_super_admin || false;

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = username.trim();
      const { data: teacherData, error } = await supabase
        .from('teachers')
        .select('id, username, email, school_name, is_super_admin, is_approved')
        .eq('username', user)
        .eq('password', password)
        .maybeSingle();

      if (error) throw error;

      if (teacherData) {
        if (!teacherData.is_approved) {
          console.error('Account not approved by superadmin');
          return false;
        }

        const teacher: Teacher = {
          ...teacherData,
          is_super_admin: Boolean(teacherData.is_super_admin),
          is_approved: Boolean(teacherData.is_approved),
        };
        
        setTeacher(teacher);
        localStorage.setItem('teacher', JSON.stringify(teacher));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string, schoolName: string): Promise<boolean> => {
    try {
      const user = username.trim();
      
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('teachers')
        .select('id')
        .eq('username', user)
        .maybeSingle();

      if (existingUser) {
        console.error('Username already exists');
        return false;
      }

      // Insert new pending teacher
      const { data: newTeacher, error } = await supabase
        .from('teachers')
        .insert([
          {
            username: user,
            email: email.trim(),
            password: password,
            school_name: schoolName.trim(),
            is_approved: false,  // Pending approval
          }
        ])
        .select('id, username, email, school_name, is_super_admin, is_approved')
        .single();

      if (error) throw error;

      // No auto-login - just success
      return !!newTeacher;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem('teacher');
  };

  return (
    <AuthContext.Provider value={{ teacher, isSuperAdmin, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

