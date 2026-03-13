import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Users } from 'lucide-react';
import type { Teacher } from '../types/teacher';
import Header from './Header';

interface ViewTeachersProps {
  onBack: () => void;
}

export default function ManageTeachers({ onBack }: ViewTeachersProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, username, email, school_name, is_approved, is_super_admin, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTeachers: Teacher[] = (data || []).map((t: any) => ({
        id: t.id,
        username: t.username,
        email: t.email,
        school_name: t.school_name,
        is_super_admin: Boolean(t.is_super_admin),
        is_approved: Boolean(t.is_approved),
        created_at: t.created_at,
      }));

      setTeachers(formattedTeachers);
    } catch (err) {
      setError('Failed to fetch teachers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveTeacher = async (teacherId: string) => {
    setUpdating(prev => ({ ...prev, [teacherId]: true }));
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_approved: true })
        .eq('id', teacherId);

      if (error) throw error;

      setTeachers(prev => prev.map(t => 
        t.id === teacherId ? { ...t, is_approved: true } : t
      ));
    } catch (err) {
      setError('Failed to approve teacher');
      console.error(err);
    } finally {
      setUpdating(prev => ({ ...prev, [teacherId]: false }));
    }
  };

  const declineTeacher = async (teacherId: string) => {
    if (!window.confirm('Decline this signup request? This will delete the account.')) return;

    setUpdating(prev => ({ ...prev, [teacherId]: true }));
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) throw error;

      setTeachers(prev => prev.filter(t => t.id !== teacherId));
    } catch (err) {
      setError('Failed to decline teacher');
      console.error(err);
    } finally {
      setUpdating(prev => ({ ...prev, [teacherId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Header />
        <div className="container mx-auto max-w-4xl py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-xl text-gray-600 dark:text-gray-400">Loading teachers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Header />
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-8 transition p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Teachers</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Approve or decline teacher signup requests
              </p>
            </div>
            <button
              onClick={fetchTeachers}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
              disabled={loading}
            >
              Refresh List
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl dark:bg-red-900/50 dark:border-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {teachers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No teachers registered yet</p>
              <p className="text-gray-500 dark:text-gray-500">Teachers will appear here after signup requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-gray-800 dark:text-gray-100">Username</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800 dark:text-gray-100">School</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800 dark:text-gray-100">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800 dark:text-gray-100">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800 dark:text-gray-100">Joined</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">
                        {teacher.username}
                        {teacher.is_super_admin && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            Super Admin
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                        {teacher.school_name || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                        {teacher.email || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          teacher.is_approved
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {teacher.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                        {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        {!teacher.is_approved && !teacher.is_super_admin ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveTeacher(teacher.id)}
                              disabled={updating[teacher.id]}
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                              {updating[teacher.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => declineTeacher(teacher.id)}
                              disabled={updating[teacher.id]}
                              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                              {updating[teacher.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No actions needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

