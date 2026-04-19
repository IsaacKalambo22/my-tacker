import PhaseSection from './PhaseSection';

interface SubjectCardProps {
  subject: {
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
  };
  onDelete: (subjectId: string) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

export default function SubjectCard({ subject, onDelete, onToggleTask }: SubjectCardProps) {
  const totalTasks = subject.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completedTasks = subject.phases.reduce(
    (sum, phase) => sum + phase.tasks.filter((t) => t.completed).length,
    0
  );
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-4 pb-3 border-b">
        <h2 className="text-xl font-bold text-gray-800">{subject.name}</h2>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-purple-600">{progress}%</span>
          <button
            onClick={() => onDelete(subject.id)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        <span className={`font-semibold ${getPriorityColor(subject.priority)}`}>
          Priority: {subject.priority}
        </span>
        {' | '}
        <span>Started: {formatDate(subject.startDate)}</span>
        {' | '}
        <span>Target: {subject.targetDate ? formatDate(subject.targetDate) : 'Not set'}</span>
      </div>

      {subject.phases.map((phase) => (
        <PhaseSection key={phase.id} phase={phase} onToggleTask={onToggleTask} />
      ))}
    </div>
  );
}
