import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import Header from './Header';

interface Poll {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
}

interface ViewPollsProps {
  onBack: () => void;
}

export default function SuperViewPolls({ onBack }: ViewPollsProps) {
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [deletedPolls, setDeletedPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPolls: Poll[] = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        is_active: Boolean(p.is_active),
        deleted_at: p.deleted_at,
        created_at: p.created_at,
      }));

      setActivePolls(formattedPolls.filter(p => !p.deleted_at));
      setDeletedPolls(formattedPolls.filter(p => p.deleted_at));
    } catch (err) {
      setError('Failed to fetch polls');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePollStatus = async (pollId: string, currentStatus: boolean) => {
    setUpdating(prev => ({ ...prev, [pollId]: true }));
    try {
      const { error } = await supabase
        .from('polls')
        .update({ is_active: !currentStatus })
        .eq('id', pollId)
        .eq('deleted_at', null); // Only active polls

      if (error) throw error;

      setActivePolls(prev => 
        prev.map(p => p.id === pollId ? { ...p, is_active: !currentStatus } : p)
      );
    } catch (error) {
      setError('Failed to update poll status');
      console.error(error);
    } finally {
      setUpdating(prev => ({ ...prev, [pollId]: false }));
    }
  };

  const softDeletePoll = async (pollId: string) => {
    if (!window.confirm('Soft delete this poll? It will appear in Deleted section.')) return;

    setUpdating(prev => ({ ...prev, [pollId]: true }));
    try {
      const { error } = await supabase
        .from('polls')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', pollId)
        .eq('deleted_at', null);

      if (error) throw error;

      setActivePolls(prev => prev.filter(p => p.id !== pollId));
      const deletedPoll = activePolls.find(p => p.id === pollId);
      if (deletedPoll) {
        setDeletedPolls(prev => [deletedPoll, ...prev]);
      }
    } catch (error) {
      setError('Failed to delete poll');
      console.error(error);
    } finally {
      setUpdating(prev => ({ ...prev, [pollId]: false }));
    }
  };

  const permanentDelete = async (pollId: string) => {
    if (!window.confirm('Permanent delete? This cannot be undone.')) return;

    setUpdating(prev => ({ ...prev, [pollId]: true }));
    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;

      setDeletedPolls(prev => prev.filter(p => p.id !== pollId));
    } catch (error) {
      setError('Failed to permanently delete');
      console.error(error);
    } finally {
      setUpdating(prev => ({ ...prev, [pollId]: false }));
    }
  };

  const openEdit = (poll: Poll) => {
    setEditingPoll(poll);
    setEditForm({ title: poll.title, description: poll.description });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoll) return;

    setUpdating(prev => ({ ...prev, [editingPoll.id]: true }));
    try {
      const { error } = await supabase
        .from('polls')
        .update({ title: editForm.title, description: editForm.description })
        .eq('id', editingPoll.id);

      if (error) throw error;

      setActivePolls(prev => 
        prev.map(p => p.id === editingPoll.id ? { ...p, title: editForm.title, description: editForm.description } : p)
      );
      setEditingPoll(null);
    } catch (error) {
      setError('Failed to update poll');
      console.error(error);
    } finally {
      setUpdating(prev => ({ ...prev, [editingPoll.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Header />
        <div className="container mx-auto max-w-4xl py-20 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Header />
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Polls (Super Admin)</h1>
            <button onClick={fetchPolls} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl dark:bg-red-900/50">
              {error}
            </div>
          )}

          {/* Active Polls */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              Active Polls ({activePolls.length})
            </h2>
            {activePolls.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No active polls</p>
            ) : (
              <div className="space-y-4">
                {activePolls.map((poll) => (
                  <div key={poll.id} className="border-2 border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{poll.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            poll.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {poll.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {poll.description && <p className="text-gray-600 mb-2">{poll.description}</p>}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {new Date(poll.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(poll)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition"
                          title="Edit poll"
                          disabled={updating[poll.id]}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => togglePollStatus(poll.id, poll.is_active)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title={poll.is_active ? 'Deactivate' : 'Activate'}
                          disabled={updating[poll.id]}
                        >
                          {updating[poll.id] ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : poll.is_active ? (
                            <ToggleRight className="w-6 h-6 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => softDeletePoll(poll.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                          title="Soft Delete"
                          disabled={updating[poll.id]}
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deleted Polls */}
        {deletedPolls.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              Deleted Polls ({deletedPolls.length})
            </h2>
            <div className="space-y-4">
              {deletedPolls.map((poll) => (
                <div key={poll.id} className="border-2 border-red-200 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20 rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 line-through text-red-600">{poll.title}</h3>
                      {poll.description && <p className="text-gray-600 mb-2">{poll.description}</p>}
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Deleted: {new Date(poll.deleted_at!).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => permanentDelete(poll.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                        title="Permanent Delete"
                        disabled={updating[poll.id]}
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingPoll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Edit Poll
              </h2>
              <form onSubmit={saveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-vertical"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingPoll(null)}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating[editingPoll.id]}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-3 px-6 rounded-xl transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating[editingPoll.id] ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

