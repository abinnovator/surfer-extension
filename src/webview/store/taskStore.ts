import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Task {
  id: number;
  text: string;
  status: 'running' | 'done' | 'queued';
}

interface TaskStore {
  tasks: Task[];
  addTask: (text: string) => void;
  removeTask: (id: number) => void;
  updateTaskStatus: (id: number, status: 'running' | 'done' | 'queued') => void;
  clearTasks: () => void;
}

const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (text: string) =>
        set((state) => ({
          tasks: [
            {
              id: Date.now(),
              text,
              status: 'running' as const,
            },
            ...state.tasks,
          ],
        })),
      removeTask: (id: number) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      updateTaskStatus: (id: number, status: 'running' | 'done' | 'queued') =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
        })),
      clearTasks: () => set({ tasks: [] }),
    }),
    {
      name: 'surfer-tasks',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTaskStore;
