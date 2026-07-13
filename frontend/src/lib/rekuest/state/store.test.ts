import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createGlobalStateStore } from './store';
import {
  StateEventType,
  type StatePatchEvent,
} from '@/lib/rekuest/transport/types';

/**
 * The replay/live state model: the backend streams JSON-patch events, the store applies
 * them to the current snapshot and tracks the global revision. Getting this wrong means
 * silently showing the wrong microscope state, so it is worth pinning down.
 */

const makePatch = (
  overrides: Partial<StatePatchEvent> = {},
): StatePatchEvent => ({
  type: StateEventType.STATE_PATCH,
  session_id: 'session-1',
  global_rev: 1,
  state_name: 'StageState',
  ts: 1_000,
  op: 'replace',
  path: '/x',
  value: 42,
  correlation_id: 'corr-1',
  ...overrides,
});

describe('globalStateStore.applyPatch', () => {
  beforeEach(() => {
    // The store logs on every patch; keep the test output readable.
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies a replace patch and advances the global revision', () => {
    const store = createGlobalStateStore();
    store.getState().setState('StageState', { x: 0, y: 5 });

    store
      .getState()
      .applyPatch(
        makePatch({ op: 'replace', path: '/x', value: 42, global_rev: 7 }),
      );

    expect(store.getState().states.StageState).toEqual({ x: 42, y: 5 });
    expect(store.getState().globalRevision).toBe(7);
  });

  it('applies an add patch without disturbing sibling keys', () => {
    const store = createGlobalStateStore();
    store.getState().setState('StageState', { x: 1 });

    store.getState().applyPatch(makePatch({ op: 'add', path: '/z', value: 3 }));

    expect(store.getState().states.StageState).toEqual({ x: 1, z: 3 });
  });

  it('leaves the previous state intact when a patch cannot be applied', () => {
    const store = createGlobalStateStore();
    store.getState().setState('StageState', { x: 1 });

    // /missing/deep does not exist, so fast-json-patch throws; the store must swallow it
    // rather than leave a half-applied document behind.
    store
      .getState()
      .applyPatch(
        makePatch({
          op: 'replace',
          path: '/missing/deep',
          value: 9,
          global_rev: 99,
        }),
      );

    expect(store.getState().states.StageState).toEqual({ x: 1 });
    expect(store.getState().globalRevision).not.toBe(99);
  });

  it('does not mutate the previous state object in place', () => {
    const store = createGlobalStateStore();
    const original = { x: 0 };
    store.getState().setState('StageState', original);

    store
      .getState()
      .applyPatch(makePatch({ op: 'replace', path: '/x', value: 5 }));

    // The store clones before patching; the caller's object must not be rewritten.
    expect(original.x).toBe(0);
  });

  it('caps the latestPatches ring buffer at the configured size', () => {
    const store = createGlobalStateStore({ latestPatchesBufferSize: 3 });
    store.getState().setState('StageState', { x: 0 });

    for (let i = 1; i <= 5; i += 1) {
      store
        .getState()
        .applyPatch(makePatch({ value: i, global_rev: i, ts: i }));
    }

    const { latestPatches } = store.getState();
    expect(latestPatches).toHaveLength(3);
    // Oldest entries are dropped, newest kept.
    expect(latestPatches.map((entry) => entry.ts)).toEqual([3, 4, 5]);
  });
});
