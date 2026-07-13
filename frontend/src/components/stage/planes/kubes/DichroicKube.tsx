import type { DichroicKubeStateSchema } from "@/apps/default/hooks/states";
import * as THREE from "three";
import { type z } from "zod";
import { useThreeAffine } from "./useThreeAffine";

type DichroicData = z.infer<typeof DichroicKubeStateSchema>;

export const DichroicKubePlane = ({ data }: { data: DichroicData }) => {
  const matrix = useThreeAffine(data.affine_matrix);

  // Calculate the color based on the wavelength, defaulting to clear/gray if undefined
  const filterColor = "#e2e8f0";

  return (
    <group matrix={matrix} matrixAutoUpdate={false}>
      {/* Inner group rotates the filter to point down the Z-axis by default */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* 1. Outer Filter Ring / Housing (Dark Metal) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          {/* A torus provides a smooth, rounded rim. args: [radius, tube, radialSegments, tubularSegments] */}
          <torusGeometry args={[30, 4, 16, 64]} />
          <meshStandardMaterial
            color="#1f2937"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* 2. The Transparent Glass Element */}
        <mesh>
          {/* A thin cylinder sits inside the torus to act as the glass pane */}
          <cylinderGeometry args={[29, 29, 1.5, 32]} />
          <meshStandardMaterial
            color={filterColor}
            metalness={0.1}
            roughness={0.05}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};
