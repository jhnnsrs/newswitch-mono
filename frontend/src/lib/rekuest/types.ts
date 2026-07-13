export interface RekuestAppDefinition<
  TKey extends string = string,
  TActions extends Record<string, unknown> = Record<string, unknown>,
  TLocks extends Record<string, unknown> = Record<string, unknown>,
  TStates extends Record<string, unknown> = Record<string, unknown>,
> {
  key: TKey;
  actions: TActions;
  locks: TLocks;
  states: TStates;
}

export type RekuestAppsDefinition<
  TKey extends string = string,
  TActions extends Record<string, unknown> = Record<string, unknown>,
  TLocks extends Record<string, unknown> = Record<string, unknown>,
  TStates extends Record<string, unknown> = Record<string, unknown>,
> = Record<TKey, RekuestAppDefinition<TKey, TActions, TLocks, TStates>>;

export type AppKey = string;

export type AppDefinition<
  TKey extends string = string,
  TActions extends Record<string, unknown> = Record<string, unknown>,
  TLocks extends Record<string, unknown> = Record<string, unknown>,
  TStates extends Record<string, unknown> = Record<string, unknown>,
> = RekuestAppDefinition<TKey, TActions, TLocks, TStates>;

export type AppsDefinition<
  TKey extends string = string,
  TActions extends Record<string, unknown> = Record<string, unknown>,
  TLocks extends Record<string, unknown> = Record<string, unknown>,
  TStates extends Record<string, unknown> = Record<string, unknown>,
> = RekuestAppsDefinition<TKey, TActions, TLocks, TStates>;
