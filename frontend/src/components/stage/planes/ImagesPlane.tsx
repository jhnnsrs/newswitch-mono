import { Suspense } from "react";
import ImagePlane from "./ImagePlane";
import { useExpanseState } from "@/apps/default/hooks/states/ExpanseState";

export const ImagesPlane = () => {
  const { data: expanseState } = useExpanseState({ subscribe: true });

  return (
    <Suspense fallback={<></>}>
      {expanseState?.current_images?.map((img, idx) => (
        <ImagePlane key={img.id} image={img} index={idx} />
      ))}
    </Suspense>
  );
};
