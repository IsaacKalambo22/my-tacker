'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import SubjectCard from '@/components/SubjectCard';
import AddSubjectModal from '@/components/AddSubjectModal';
import StatsDashboard from '@/components/StatsDashboard';

interface Subject {
  id: string;
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  targetDate: Date | null;
  startDate: Date;
  phases: Array<{
    id: string;
    name: string;
    tasks: Array<{
      id: string;
      text: string;
      completed: boolean;
      completedAt: Date | null;
    }>;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchSubjects();
  }, [session, status, router]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showNotification('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (data: { name: string; priority: string; targetDate?: string }) => {
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create subject');

      showNotification('Subject added successfully!');
      fetchSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
      showNotification('Failed to add subject');
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch('/api/subjects/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId }),
      });

      if (!response.ok) throw new Error('Failed to delete subject');

      showNotification('Subject deleted successfully!');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      showNotification('Failed to delete subject');
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      // Optimistic update
      setSubjects((prev) =>
        prev.map((subject) => ({
          ...subject,
          phases: subject.phases.map((phase) => ({
            ...phase,
            tasks: phase.tasks.map((task) =>
              task.id === taskId ? { ...task, completed } : task
            ),
          })),
        }))
      );

      const response = await fetch('/api/tasks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed }),
      });

      if (!response.ok) throw new Error('Failed to toggle task');

      // Refresh to get accurate data
      fetchSubjects();
    } catch (error) {
      console.error('Error toggling task:', error);
      showNotification('Failed to update task');
      fetchSubjects(); // Revert on error
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculate stats
  const totalSubjects = subjects.length;
  const totalTasks = subjects.reduce(
    (sum, subject) => sum + subject.phases.reduce((pSum, phase) => pSum + phase.tasks.length, 0),
    0
  );
  const completedTasks = subjects.reduce(
    (sum, subject) =>
      sum + subject.phases.reduce((pSum, phase) => pSum + phase.tasks.filter((t) => t.completed).length, 0),
    0
  );
  const avgProgress =
    totalSubjects > 0
      ? Math.round(
          subjects.reduce((sum, subject) => {
            const sTotal = subject.phases.reduce((pSum, phase) => pSum + phase.tasks.length, 0);
            const sCompleted = subject.phases.reduce(
              (pSum, phase) => pSum + phase.tasks.filter((t) => t.completed).length,
              0
            );
            return sum + (sTotal > 0 ? sCompleted / sTotal : 0);
          }, 0) / totalSubjects * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🚀 Tech Learning Tracker</h1>
              <p className="text-gray-600">Welcome! Schedule your new tasks and track your progress</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>

          <StatsDashboard
            totalSubjects={totalSubjects}
            completedTasks={completedTasks}
            avgProgress={avgProgress}
          />

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:opacity-90 transition"
            >
              + Add New Subject
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading...</div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <h3 className="text-xl font-semibold mb-2">No subjects yet</h3>
              <p>Click the "Add New Subject" button to start tracking your learning progress!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onDelete={handleDeleteSubject}
                  onToggleTask={handleToggleTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubject}
      />

      {notification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
    </div>
  );
}
