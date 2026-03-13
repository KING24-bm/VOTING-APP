import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Header from './Header';

interface Poll {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface ViewPollsProps {
  onBack: () => void;
}

export default function ViewPolls({ onBack }: ViewPollsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

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

      setPolls(data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePollStatus = async (pollId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ is_active: !currentStatus })
        .eq('id', pollId);

      if (error) throw error;

      setPolls(
        polls.map((p) =>
          p.id === pollId ? { ...p, is_active: !currentStatus } : p
        )
      );
    } catch (error) {
      console.error('Error toggling poll status:', error);
      alert('Failed to update poll status');
    }
  };

  const handleOpenDeleteModal = (pollId: string) => {
    setSelectedPollId(pollId);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deletion.');
      return;
    }

    setShowDeleteModal(false);

    try {
      // First delete the poll
      const { error: deleteError } = await supabase.from('polls').delete().eq('id', selectedPollId);
      if (deleteError) throw deleteError;

      // Optional: Log deletion reason if table exists
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase
          .from('poll_deletions')
          .insert([{ 
            poll_id: selectedPollId, 
            delete_reason: deleteReason.trim(),
            deleted_by: user?.id 
          }]);
      } catch {
        // Silently skip logging
      }

      setPolls(polls.filter((p) => p.id !== selectedPollId));
      alert('Poll deleted successfully.');
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert(`Delete failed: ${String(error)}`);
    }
  };

  const deletePoll = (pollId: string) => {
    handleOpenDeleteModal(pollId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Header />
      <div className="container mx-auto max-w-4xl">
        {/* logo removed; header still links to home */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Live Polls</h1>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading polls...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No polls created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className="border-2 border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{poll.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            poll.is_active
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {poll.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {poll.description && (
                        <p className="text-gray-600 mb-2">{poll.description}</p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created: {new Date(poll.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePollStatus(poll.id, poll.is_active)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title={poll.is_active ? 'Deactivate poll' : 'Activate poll'}
                      >
                        {poll.is_active ? (
                          <ToggleRight className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => deletePoll(poll.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                        title="Delete poll"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  Delete Poll
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This action cannot be undone. Please provide a reason for deletion.
                </p>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Enter reason for deleting this poll..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-vertical min-h-[100px]"
                  rows={4}
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 transition font-medium"
                    disabled={!deleteReason.trim()}
                  >
                    Delete Poll
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
