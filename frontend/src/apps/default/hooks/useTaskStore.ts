import {
  useTaskStore as useBaseTaskStore,
  type TaskStore,
} from '@/lib/rekuest/task';

export const useTaskStore = <TSelected,>(
  selector: (state: TaskStore) => TSelected,
): TSelected => useBaseTaskStore('default', selector);
