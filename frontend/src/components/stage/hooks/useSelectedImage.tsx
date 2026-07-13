import { useExpanseState } from "@/apps/default/hooks/states";
import { useSelectionStore } from "@/store/imageStore";

export const useSelectedImage = () => {
  const selectedImageId = useSelectionStore((s) => s.selectedImageId);
  const { data } = useExpanseState();
  const selectedImage = data?.current_images?.find(
    (img) => img.id === selectedImageId,
  );
  return selectedImage;
};
