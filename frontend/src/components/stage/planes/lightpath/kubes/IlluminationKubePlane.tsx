import { useIlluminationState, type IlluminationKubeSchema } from "@/apps/default/hooks/states";
import { type z } from "zod";
import { useThreeAffine } from "./useThreeAffine";

type IlluminationData = z.infer<typeof IlluminationKubeSchema>;

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
    // Fallback for non-visible wavelengths (UV/IR) or undefined
    return "#ffffff";
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

export const IlluminationKubePlane = ({ data }: { data: IlluminationData }) => {
  const matrix = useThreeAffine(data.affine_matrix);


  const {data: illumination} = useIlluminationState({selector: (state) => {
    const illum = state.illuminations.find((i) => i.slot === data.slot_id);
    return illum;
  }  });

  // Resolve light properties
  const lightColor = illumination?.wavelength
    ? wavelengthToHex(illumination.wavelength)
    : "#ffffff";

  // Normalize intensity for visual emissive scaling (adjust divisor based on your data scale, e.g., if max intensity is 100)
  const emissiveStrength = (illumination?.intensity ?? 0) / 100 * 2;
  const intensity = illumination?.intensity ?? 0;

  return (
    <group matrix={matrix} matrixAutoUpdate={false}>
      {/* Inner group rotates the light source to point down the Z-axis by default */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* 1. Heat Sink / Base Module (Thick, metallic) */}
        <mesh position={[0, 20, 0]}>
          <cylinderGeometry args={[25, 25, 30, 32]} />
          <meshStandardMaterial color="#777f8e" />
        </mesh>

        {/* 2. Heat Sink Grooves (Visual detail) */}
        <mesh position={[0, 20, 0]}>
          <cylinderGeometry args={[26, 26, 2, 32]} />
          <meshStandardMaterial color="#979797" />
        </mesh>
        <mesh position={[0, 25, 0]}>
          <cylinderGeometry args={[26, 26, 2, 32]} />
          <meshStandardMaterial color="#7c7d7d" />
        </mesh>

        {/* 3. Collimator Housing (Narrower barrel) */}
        <mesh position={[0, -5, 0]}>
          <cylinderGeometry args={[15, 12, 20, 32]} />
          <meshStandardMaterial color="#6e6e6e" />
        </mesh>

        {/* 4. Glowing Emitter Lens */}
        <mesh position={[0, -16, 0]}>
          <cylinderGeometry args={[8, 8, 3, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={lightColor}
            emissiveIntensity={emissiveStrength}
            toneMapped={false} // Prevents Three.js from clamping the glow color
          />
        </mesh>

        {/* 5. Actual PointLight casting into the scene */}
        {intensity > 0 && (
          <pointLight
            position={[0, -20, 0]}
            color={lightColor}
            intensity={intensity}
            distance={500}
            decay={2}
          />
        )}
      </group>
    </group>
  );
};
