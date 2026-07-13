import { appDefinition as DefaultAppDefinition } from './default/app';

export const appsDefinition = {
  default: DefaultAppDefinition,
} as const;

export type AppsDefinition = typeof appsDefinition;
export type AppKey = keyof AppsDefinition;
export type AppDefinition = AppsDefinition[AppKey];
