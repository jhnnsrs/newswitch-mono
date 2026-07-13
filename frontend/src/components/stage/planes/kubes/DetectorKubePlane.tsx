import type { DetectorKubeStateSchema } from "@/apps/default/hooks/states/ExpanseState";
import { type z } from "zod";
import { useThreeAffine } from "./useThreeAffine";
import { useCameraState } from "@/apps/default/hooks/states";

type DetectorData = z.infer<typeof DetectorKubeStateSchema>;

export const DetectorKubePlane = ({ data }: { data: DetectorData }) => {
  // Use a group to hold the entire detector structure at the state coordinates
  const matrix = useThreeAffine(data.affine_matrix);
  
  return (
    <group matrix={matrix} matrixAutoUpdate={false}>
      {/* Inner group rotates the Y-aligned detector to point down the Z-axis by default */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* 1. Main Detector Body (Box) */}
        <mesh position={[0, 20, 0]}>
          <boxGeometry args={[80, 60, 80]} />
          <meshStandardMaterial
            color="#c2c2c2"
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>

        {/* 2. Sensor Mount / Collar (Cylinder protruding from the bottom) */}
        <mesh position={[0, -20, 0]}>
          <cylinderGeometry args={[30, 30, 20, 32]} />
          <meshStandardMaterial
            color="#5b5b5b"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* 3. Sensor Glass / Active Area */}
        <mesh position={[0, -30.5, 0]}>
          <cylinderGeometry args={[25, 25, 2, 32]} />
          {/* Using a soft green reflection to nod to your original #d4edda color */}
          <meshStandardMaterial
            color="#68d391"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
    </group>
  );
};
