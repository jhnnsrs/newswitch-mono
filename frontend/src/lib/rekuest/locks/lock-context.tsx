import { createContext, useContext } from 'react';

export interface LockContextValue {}

export const LockContext = createContext<LockContextValue | null>(null);

export function useLockContext(): LockContextValue {
  const context = useContext(LockContext);

  if (!context) {
    throw new Error('useLockContext must be used within a BundleProvider');
  }

  return context;
}