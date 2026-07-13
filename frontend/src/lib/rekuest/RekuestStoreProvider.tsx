import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {
  AppStateStoreContext,
  createAppStateStoreRegistry,
} from '@/lib/rekuest/app-state';
import {
  createLockStoreRegistry,
  LockStoreContext,
} from '@/lib/rekuest/locks/store';
import {
  createGlobalStateStoreRegistry,
  GlobalStateStoreContext,
} from '@/lib/rekuest/state/store';
import {
  createTaskStoreRegistry,
  TaskStoreContext,
} from '@/lib/rekuest/task/store';
import {
  createTransportStore,
  TransportStoreContext,
} from '@/lib/rekuest/transport/store';

export interface RekuestStoreBundle {
  appStateStore: ReturnType<typeof createAppStateStoreRegistry>;
  globalStateStore: ReturnType<typeof createGlobalStateStoreRegistry>;
  taskStore: ReturnType<typeof createTaskStoreRegistry>;
  transportStore: ReturnType<typeof createTransportStore>;
  lockStore: ReturnType<typeof createLockStoreRegistry>;
}

export interface RekuestStoreProviderProps {
  children: ReactNode;
  scope?: string;
  debug?: boolean;
  latestPatchesBufferSize?: number;
}

const scopedBundles = new Map<string, RekuestStoreBundle>();

const createRekuestStoreBundle = (
  debug = false,
  latestPatchesBufferSize = 100,
): RekuestStoreBundle => {
  const transportStore = createTransportStore();

  return {
    appStateStore: createAppStateStoreRegistry({ debug }),
    globalStateStore: createGlobalStateStoreRegistry({ debug, latestPatchesBufferSize }),
    taskStore: createTaskStoreRegistry(transportStore, { debug }),
    transportStore,
    lockStore: createLockStoreRegistry({ debug }),
  };
};

const getScopedBundle = (
  scope: string,
  debug = false,
  latestPatchesBufferSize = 100,
): RekuestStoreBundle => {
  const bundleKey = `${scope}::debug-${debug ? 'on' : 'off'}::patches-${latestPatchesBufferSize}`;
  const existingBundle = scopedBundles.get(bundleKey);

  if (existingBundle) {
    return existingBundle;
  }

  const nextBundle = createRekuestStoreBundle(debug, latestPatchesBufferSize);
  scopedBundles.set(bundleKey, nextBundle);
  return nextBundle;
};

export function RekuestStoreProvider({
  children,
  scope = 'default',
  debug = false,
  latestPatchesBufferSize = 100,
}: RekuestStoreProviderProps) {
  const stores = useMemo(
    () => getScopedBundle(scope, debug, latestPatchesBufferSize),
    [debug, latestPatchesBufferSize, scope],
  );

  return (
    <AppStateStoreContext.Provider value={stores.appStateStore}>
      <GlobalStateStoreContext.Provider value={stores.globalStateStore}>
        <TransportStoreContext.Provider value={stores.transportStore}>
          <TaskStoreContext.Provider value={stores.taskStore}>
            <LockStoreContext.Provider value={stores.lockStore}>
              {children}
            </LockStoreContext.Provider>
          </TaskStoreContext.Provider>
        </TransportStoreContext.Provider>
      </GlobalStateStoreContext.Provider>
    </AppStateStoreContext.Provider>
  );
}
