import { z } from "zod";
import { FrameSchema } from "@/apps/default/hooks/states/ExpanseState";


export type Frame = z.infer<typeof FrameSchema>;
export type Metadata = z.infer<typeof FrameSchema.shape.metadata>;