import TaskItem from './TaskItem';

interface PhaseSectionProps {
  phase: {
    id: string;
    name: string;
    tasks: Array<{
      id: string;
      text: string;
      completed: boolean;
      completedAt: Date | null;
    }>;
  };
  onToggleTask: (taskId: string, completed: boolean) => void;
}

export default function PhaseSection({ phase, onToggleTask }: PhaseSectionProps) {
  const completedTasks = phase.tasks.filter((t) => t.completed).length;
  const totalTasks = phase.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded border-l-4 border-purple-500">
          {phase.name}
        </h3>
        <span className="text-xs text-gray-500">{progress}%</span>
      </div>
      <div className="ml-2">
        {phase.tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </div>
    </div>
  );
}
