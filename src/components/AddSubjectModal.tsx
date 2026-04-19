'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSubjectSchema } from '@/lib/zod-schemas';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; priority: string; targetDate?: string }) => void;
}

export default function AddSubjectModal({ isOpen, onClose, onAdd }: AddSubjectModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      priority: 'Medium',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onAdd(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding subject:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Add New Learning Subject</h2>
          <p className="text-gray-600">Start tracking your progress on a new technology or skill</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Subject/Technology Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g., React, Python, Docker, AWS"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority Level
            </label>
            <select
              id="priority"
              {...register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            {errors.priority && (
              <p className="text-red-500 text-sm mt-1">{errors.priority.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
              Target Completion Date
            </label>
            <input
              id="targetDate"
              type="date"
              {...register('targetDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Creating...' : 'Create Subject'}
          </button>
        </form>
      </div>
    </div>
  );
}
