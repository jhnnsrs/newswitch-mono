import { IlluminationNode } from "./IlluminationNode";
import { ObjectiveNode } from "./ObjectiveNode";
import { FilterNode } from "./FilterNode";
import { DetectorNode } from "./DetectorNode";
import { GenericNode } from "./GenericNode";

// Maps the runtime schema brands to the React flow custom nodes
export const nodeTypes = {
  illumination_kube_state: IlluminationNode,
  objective_kube_state: ObjectiveNode,
  filter_kube_state: FilterNode,
  detector_kube_state: DetectorNode,
  generic_kube_state: GenericNode,
};
