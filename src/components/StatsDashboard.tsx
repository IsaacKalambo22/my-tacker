interface StatsDashboardProps {
  totalSubjects: number;
  completedTasks: number;
  avgProgress: number;
}

export default function StatsDashboard({
  totalSubjects,
  completedTasks,
  avgProgress,
}: StatsDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
        <div className="text-3xl font-bold text-purple-600 mb-1">{totalSubjects}</div>
        <div className="text-sm text-gray-600 font-medium">Active Subjects</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
        <div className="text-3xl font-bold text-purple-600 mb-1">{completedTasks}</div>
        <div className="text-sm text-gray-600 font-medium">Tasks Completed</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
        <div className="text-3xl font-bold text-purple-600 mb-1">{avgProgress}%</div>
        <div className="text-sm text-gray-600 font-medium">Average Progress</div>
      </div>
    </div>
  );
}
