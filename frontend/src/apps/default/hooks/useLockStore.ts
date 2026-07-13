import {
  useLockStore as useBaseLockStore,
  type LockStore,
} from '@/lib/rekuest/locks';

export const useLockStore = <TSelected>(
  selector: (state: LockStore) => TSelected,
): TSelected => useBaseLockStore('default', selector);
