import {
  globalActionDefinition,
  type GlobalActionDefinition,
} from "./src/hooks/generated";
import {
  globalLockDefinition,
  type GlobalLockDefinition,
} from "./src/hooks/locks";
import {
  globalStateDefinition,
  type GlobalStateDefinition,
} from "./src/hooks/states";

export interface AppDefinition {
  actions: GlobalActionDefinition;
  locks: GlobalLockDefinition;
  states: GlobalStateDefinition;
}

export const appDefinition = {
  actions: globalActionDefinition,
  locks: globalLockDefinition,
  states: globalStateDefinition,
} satisfies AppDefinition;
