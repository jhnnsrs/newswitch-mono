import type { ObjectiveKubeStateSchema } from "@/apps/default/hooks/states/ExpanseState";
import { Html } from "@react-three/drei";
import { type z } from "zod";
import { useThreeAffine } from "./useThreeAffine";

type ObjectiveData = z.infer<typeof ObjectiveKubeStateSchema>;

export const ObjectiveKubePlane = ({ data }: { data: ObjectiveData }) => {
  // We use a group to hold the stacked cylinder parts together.
  // The entire group is positioned at the state coordinates.
  const matrix = useThreeAffine(data.affine_matrix);

  return (
    <group matrix={matrix} matrixAutoUpdate={false}>
      {/* Inner group rotates the Y-aligned cylinders to point down the Z-axis by default */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* 1. Top Thread/Mount (Silver) */}
        <mesh position={[0, 45, 0]}>
          {/* args: [radiusTop, radiusBottom, height, radialSegments] */}
          <cylinderGeometry args={[30, 30, 10, 32]} />
          <meshStandardMaterial
            color="#d1d5db"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* 2. Main Tapered Barrel (Dark Grey/Black) */}
        <mesh position={[0, 15, 0]}>
          <cylinderGeometry args={[30, 20, 50, 32]} />
          <meshStandardMaterial
            color="#1f2937"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* 3. Magnification Color Band (e.g., Yellow for 10x) */}
        <mesh position={[0, -12.5, 0]}>
          <cylinderGeometry args={[20, 20, 5, 32]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} />
        </mesh>

        {/* 4. Narrow Tip (Dark Grey/Black) */}
        <mesh position={[0, -25, 0]}>
          <cylinderGeometry args={[20, 10, 20, 32]} />
          <meshStandardMaterial
            color="#1f2937"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* 5. The Glass Lens at the very bottom */}
        <mesh position={[0, -35.5, 0]}>
          <cylinderGeometry args={[8, 8, 2, 32]} />
          <meshStandardMaterial
            color="#0ea5e9"
            metalness={0.9}
            roughness={0.05}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
    </group>
  );
};
