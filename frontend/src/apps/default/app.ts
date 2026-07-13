import {
  globalActionDefinition,
  type GlobalActionDefinition,
} from './hooks/actions';
import { globalLockDefinition, type GlobalLockDefinition } from './hooks/locks';
import {
  globalStateDefinition,
  type GlobalStateDefinition,
} from './hooks/states';

export interface AppDefinition<TAppKey extends string = string> {
  key: TAppKey;
  actions: GlobalActionDefinition;
  locks: GlobalLockDefinition;
  states: GlobalStateDefinition;
}

export const appDefinition = {
  key: 'default',
  actions: globalActionDefinition,
  locks: globalLockDefinition,
  states: globalStateDefinition,
} satisfies AppDefinition<'default'>;
