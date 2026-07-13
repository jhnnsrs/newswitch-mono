import type { RekuestAppDefinition, RekuestAppsDefinition } from '@/lib/rekuest/types';
import type { ResolvedStateDefinition, StateDefinition } from './types';

export const getScopedStateKey = (appKey: string, stateKey: string) =>
  `${appKey}::state::${stateKey}`;

export const resolveStateDefinition = <
  TState extends Record<string, unknown>,
  TKey extends string,
>(
  definition: StateDefinition<TState, TKey>,
): ResolvedStateDefinition<TState, TKey> => ({
  ...definition,
  appKey: definition.appKey,
});

export const getAppStateDefinitions = <TAppKey extends string>(
  app: RekuestAppDefinition<
    TAppKey,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, StateDefinition<Record<string, unknown>, string>>
  >,
) => {
  return Object.values(app.states).map((definition) =>
    resolveStateDefinition(
      definition as StateDefinition<Record<string, unknown>, string>,
    ),
  );
};

export const getAllStateDefinitions = <TAppKey extends string>(
  apps: RekuestAppsDefinition<
    TAppKey,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, StateDefinition<Record<string, unknown>, string>>
  >,
) => {
  return (
    Object.values(apps) as Array<
      RekuestAppDefinition<
        TAppKey,
        Record<string, unknown>,
        Record<string, unknown>,
        Record<string, StateDefinition<Record<string, unknown>, string>>
      >
    >
  ).flatMap((app) => getAppStateDefinitions(app));
};

export const getStateDefinitionsRecord = <TAppKey extends string>(
  apps: RekuestAppsDefinition<
    TAppKey,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, StateDefinition<Record<string, unknown>, string>>
  >,
) => {
  return Object.fromEntries(
    getAllStateDefinitions(apps).map((definition) => [
      getScopedStateKey(definition.appKey, definition.key),
      definition,
    ]),
  ) as Record<string, ResolvedStateDefinition>;
};
