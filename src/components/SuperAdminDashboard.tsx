import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, PlusCircle, BarChart3, Eye, LogOut } from 'lucide-react';
import CreatePoll from './CreatePoll';
import SuperViewPolls from './SuperViewPolls';
import ViewResults from './ViewResults';
import ManageTeachers from './ManageTeachers';
import Header from './Header';

type View = 'menu' | 'create' | 'polls' | 'results' | 'teachers';

export default function SuperAdminDashboard() {
  const [currentView, setCurrentView] = useState<View>('menu');
  const { logout, teacher } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  if (currentView === 'create') {
    return <CreatePoll onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'polls') {
    return <SuperViewPolls onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'results') {
    return <ViewResults onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'teachers') {
    return <ManageTeachers onBack={() => setCurrentView('menu')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Super Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Full system control and teacher management</p>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Welcome, {teacher?.username || 'Super Admin'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => setCurrentView('create')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
                <PlusCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">Create Poll</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Create new polls for schools
            </p>
          </button>

          <button
            onClick={() => setCurrentView('polls')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                <Eye className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">Manage Polls</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              View, edit, activate/deactivate all polls
            </p>
          </button>

          <button
            onClick={() => setCurrentView('results')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
                <BarChart3 className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">View Results</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Check election results across schools
            </p>
          </button>

          <button
            onClick={() => setCurrentView('teachers')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full">
                <Users className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">Manage Teachers</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Approve/decline teacher accounts
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

