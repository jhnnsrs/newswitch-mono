import { useFilterBankState, type FilterBankKubeSchema } from "@/apps/default/hooks/states";
import * as THREE from "three";
import { type z } from "zod";
import { useThreeAffine } from "./useThreeAffine";

type FilterBankKubeData = z.infer<typeof FilterBankKubeSchema>;

// Helper function to approximate a visible wavelength (380nm - 780nm) to an RGB hex color
function wavelengthToHex(wavelength: number): string {
  let r = 0,
    g = 0,
    b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0;
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0;
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
    b = 0;
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1;
    g = 0;
    b = 0;
  } else {
    // Fallback for non-visible wavelengths (e.g., UV or IR)
    return "#cbd5e1";
  }

  // Intensity modulation to fade out the edges of the visible spectrum
  let factor = 1.0;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
  } else if (wavelength >= 700 && wavelength <= 780) {
    factor = 0.3 + (0.7 * (780 - wavelength)) / (780 - 700);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * factor * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const FilterBankKubePlane = ({ data }: { data: FilterBankKubeData }) => {
  const {data: filterbank} = useFilterBankState()
  const matrix = useThreeAffine(data.affine_matrix);


  const currentWavelength =  filterbank?.filters.find((f) => f.slot === filterbank.current_slot)?.wavelength;

  // Calculate the color based on the wavelength, defaulting to clear/gray if undefined
  const filterColor = currentWavelength
    ? wavelengthToHex(currentWavelength)
    : "#e2e8f0";

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
