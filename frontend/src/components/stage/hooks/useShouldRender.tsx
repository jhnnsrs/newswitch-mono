

export const useShouldRender = ({
  availableScales,
  selfScale,
  chunkCoords,
  affineScaleX,
  affineScaleY,
  chunkShape,
}: {
  availableScales: ScaledView[];
  selfScale: ScaledView;
  chunkCoords?: number[];
  chunkShape?: number[];
  affineScaleX: number;
  affineScaleY: number;
}) => {
  if (!availableScales?.length) {
    throw new Error("useTileLOD: provide at least one level in opts.levels");
  }

  const { camera, size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  const [shouldRender, setShouldRender] = useState(false);
  const [inView, setInView] = useState(false);
  const frame = useRef(0);

  const step = 5; // measure every N frames

  // Configuration for view culling and LOD
  const viewRadius = VIEW_RADIUS / affineScaleX; // Base render radius around camera center
  const minPixelSize = 200 * affineScaleX; // Minimum pixel size to render (increased from 0.5)
  const maxPixelSize = 400 * affineScaleY; // Maximum pixel size to render (increased from 100)

  // Simple function to find optimal scale for given pixel size
  const findOptimalScale = useMemo(() => {
    return (basePixelUnit: number): ScaledView => {
      if (!availableScales?.length) return availableScales[0];

      const sortedScales = [...availableScales].sort(
        (a, b) => (a.scaleX || 1) - (b.scaleX || 1),
      );
      const idealPixelSize = 50;

      let optimalScale = sortedScales[0];
      let bestScore = Infinity;

      for (const scale of sortedScales) {
        const s = scale.scaleX || 1;
        const scalePixelSize = basePixelUnit * s;

        let score;
        if (basePixelUnit > idealPixelSize) {
          // Zoomed IN: prefer HIGH resolution (lower scale numbers like 1x)
          score = s + Math.abs(scalePixelSize - idealPixelSize);
        } else {
          // Zoomed OUT: prefer LOW resolution (higher scale numbers like 32x)
          score = (1 / s) * 100 + Math.abs(scalePixelSize - idealPixelSize);
        }

        // Penalty for going below minimum threshold
        if (scalePixelSize < minPixelSize) {
          score += 1000;
        }

        // Moderate penalty for going above maximum threshold
        if (scalePixelSize > maxPixelSize) {
          score += (scalePixelSize - maxPixelSize) * 0.1;
        }

        if (score < bestScore) {
          bestScore = score;
          optimalScale = scale;
        }
      }

      return optimalScale;
    };
  }, [availableScales, minPixelSize, maxPixelSize]);

  useFrame(() => {
    frame.current++;
    if (frame.current % step !== 0) return;

    const obj = meshRef.current;
    if (!obj || !chunkCoords || !chunkShape) {
      setShouldRender(false);
      return;
    }

    // Check if the object is in the viewport and assess the current pixel size of a world pixel
    if (!camera) return;

    // Get chunk world position and size
    const chunkWorldPos = new THREE.Vector3();
    obj.getWorldPosition(chunkWorldPos);

    // Calculate chunk size in world units first
    const chunkSize3D = chunkShape.slice(3, 5); // Get x, y dimensions
    const scaleX = selfScale.scaleX || 1;
    const scaleY = selfScale.scaleY || 1;
    const chunkWorldWidth = chunkSize3D[1] * scaleX;
    const chunkWorldHeight = chunkSize3D[0] * scaleY;
    const halfW = chunkWorldWidth / 2;
    const halfH = chunkWorldHeight / 2;

    // Make culling radius react to zoom for Orthographic cameras, keep base for Perspective
    const effectiveRadius =
      camera instanceof THREE.OrthographicCamera
        ? viewRadius / Math.max(1e-6, camera.zoom)
        : viewRadius;

    // Check if any part of the chunk rectangle intersects with the camera's circular view radius
    const cameraX = camera.position?.x ?? 0;
    const cameraY = camera.position?.y ?? 0;
    const chunkCenterX = chunkWorldPos.x;
    const chunkCenterY = chunkWorldPos.y;

    // Rectangle-circle intersection test
    // Find the closest point on the rectangle to the camera center
    const closestX = Math.max(
      chunkCenterX - halfW,
      Math.min(cameraX, chunkCenterX + halfW),
    );
    const closestY = Math.max(
      chunkCenterY - halfH,
      Math.min(cameraY, chunkCenterY + halfH),
    );

    // Calculate distance from camera to closest point on rectangle
    const dx = cameraX - closestX;
    const dy = cameraY - closestY;
    const distanceToClosestPoint = Math.hypot(dx, dy);

    // Chunk is visible if closest point is within the effective radius
    const withinViewRadius = distanceToClosestPoint <= effectiveRadius;

    setInView(withinViewRadius);

    if (!withinViewRadius) {
      setShouldRender(false);
      return;
    }

    // Calculate the apparent size in screen space
    // For orthographic camera, use zoom factor
    // For perspective camera, use distance and FOV
    let basePixelUnit = 0; // pixel size for scale 1x (using the unscaled chunk size)

    if (camera instanceof THREE.OrthographicCamera) {
      // For orthographic camera, pixel size is based on zoom
      const zoom = camera.zoom;
      const worldUnitsPerPixel =
        (camera.right - camera.left) / (size.width * zoom);
      basePixelUnit =
        Math.min(chunkSize3D[1], chunkSize3D[0]) / worldUnitsPerPixel;
    } else if (camera instanceof THREE.PerspectiveCamera) {
      // For perspective camera, calculate based on distance and FOV
      const fov = (camera.fov * Math.PI) / 180; // Convert to radians
      // Use planar (XY) distance for on-plane approximation
      const planarDistance = Math.max(
        1e-3,
        Math.hypot(
          camera.position.x - chunkWorldPos.x,
          camera.position.y - chunkWorldPos.y,
        ),
      );
      const worldHeight = 2 * Math.tan(fov / 2) * planarDistance;
      const worldUnitsPerPixel = worldHeight / size.height;
      basePixelUnit =
        Math.min(chunkSize3D[1], chunkSize3D[0]) / worldUnitsPerPixel;
    }

    // Enhanced LOD logic: Calculate optimal scale and check if this chunk is within threshold
    let isBestLOD = true;
    if (availableScales.length > 1) {
      const currentScaleX = selfScale.scaleX || 1;

      // Find the optimal scale for the current pixel size
      const optimalScale = findOptimalScale(basePixelUnit);
      const optimalScaleX = optimalScale.scaleX || 1;

      // Calculate this chunk's scaled pixel size
      const thisChunkScaledPixelSize = basePixelUnit * currentScaleX;
      const optimalScaledPixelSize = basePixelUnit * optimalScaleX;

      // Define threshold for acceptable pixel size difference (e.g., 20% tolerance)
      const threshold = 0.2;
      const pixelSizeDifference = Math.abs(
        thisChunkScaledPixelSize - optimalScaledPixelSize,
      );
      const relativeThreshold = optimalScaledPixelSize * threshold;

      // Render if this chunk's scaled pixel size is within threshold of optimal
      isBestLOD = pixelSizeDifference <= relativeThreshold;

      // Debug logging (only occasionally to avoid spam)
      if (frame.current % 30 === 0) {
        // console.log( --- IGNORE ---
      }
    }

    // Final render decision: render if within view radius and this is the best LOD
    const shouldRenderChunk = withinViewRadius && isBestLOD;
    setShouldRender(shouldRenderChunk);
  });

  return {
    meshRef,
    shouldRender,
    inView,
  };
};