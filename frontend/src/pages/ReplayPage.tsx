import { CameraMatrixSync } from "@/components/stage/CameraMatrixSync";
import { CameraController } from "@/components/stage/cameras/CameraController";
import { KeyboardModeController } from "@/components/stage/controllers/KeyboardModeController";
import { SceneWrapper } from "@/components/stage/Expanse";
import { SceneOverlay } from "@/components/stage/overlays/SceneOverlay";
import { PanelProvider } from "@/components/stage/PanelProvider";
import { FramePanel } from "@/components/stage/panels/FramePanel";
import { KubeStatePanel } from "@/components/stage/panels/KubeStatePanel";
import { CurrentLightPathPlane } from "@/components/stage/planes/lightpath/LightPathPlane";
import { useTransportStore } from "@/lib/rekuest/transport";

import { useEffect, useState } from "react";




export const useActiveSessionBoundaries = () => {
  const { fetchActiveSessionBoundaries } = useTransportStore((s) => s);

  const [sessionBoundaries, setSessionBoundaries] = useState<{
    sessionStart: Date;
    sessionEnd: Date;
  } | null>(null);

  useEffect(() => {
    const getSessionBoundaries = async () => {
      try {
        const boundaries = await fetchActiveSessionBoundaries();
        setSessionBoundaries(boundaries);
      } catch (error) {
        console.error("Failed to fetch active session boundaries:", error);
      }
    }
    getSessionBoundaries();
  }, [fetchActiveSessionBoundaries]);

  return sessionBoundaries;
}


export const CurrentSessionTimeLine = () => {

  const data = useActiveSessionBoundaries();




  return (
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gray-800/50 backdrop-blur flex items-center justify-center">
      <p className="text-white">Timeline Component (Placeholder)</p>
      {data?.sessionStart.toString()} - {data?.sessionEnd.toString()} {JSON.stringify(data)}
    </div>
  );
};



export function ReplayPage() {
  return (
    <div className="h-screen bg-background text-foreground dark w-screen overflow-hidden">

        


       <PanelProvider>
              <KeyboardModeController />
              <SceneWrapper>
                <color attach="background" args={["#020617"]} />
                <ambientLight intensity={0.7} />
                <pointLight position={[100, 100, 100]} />
      
                {/* The Camera Matrix Sync ensures that we can access the view matrix outside in html world */}
                <CameraMatrixSync />
      
                
                <CurrentLightPathPlane/>
      
                

                        <CameraController />
      
                
              </SceneWrapper>


              <KubeStatePanel />
      
              <FramePanel />
      
              <SceneOverlay />
            </PanelProvider>
            <CurrentSessionTimeLine />
          </div>
  );
}
