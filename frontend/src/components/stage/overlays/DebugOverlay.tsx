import { useDumpStatesToStdin } from "@/apps/default/hooks/actions";

export const DebugOverlay = () => {
  // TODO: not wired up - the `call` returned by useDumpStatesToStdin() is never
  // attached to a control, so this overlay currently renders an empty box. The hook
  // call is kept so the action stays registered.
  useDumpStatesToStdin();

  return <div className="absolute top-4 right-4 "></div>;
};
