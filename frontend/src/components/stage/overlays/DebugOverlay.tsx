import { Button } from "@/components/ui/button";
import { useDumpStatesToStdin } from "@/apps/default/hooks/actions";
import { useViewerStore } from "@/store/viewerStore";

export const DebugOverlay = () => {

    const {call: dump} = useDumpStatesToStdin();

    return <div className="absolute top-4 right-4 ">
    </div>
  
}