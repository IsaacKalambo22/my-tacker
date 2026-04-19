interface TaskItemProps {
  task: {
    id: string;
    text: string;
    completed: boolean;
    completedAt: Date | null;
  };
  onToggle: (taskId: string, completed: boolean) => void;
}

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <div className="flex items-center mb-2 p-2 rounded hover:bg-gray-50 transition">
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={task.completed}
        onChange={(e) => onToggle(task.id, e.target.checked)}
        className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
      />
      <label
        htmlFor={`task-${task.id}`}
        className={`flex-1 cursor-pointer text-sm ${
          task.completed ? 'line-through text-green-600' : 'text-gray-700'
        }`}
      >
        {task.text}
      </label>
    </div>
  );
}
