import { WorkflowEdge } from '../types/workflow.types';

export const initialEdges: WorkflowEdge[] = [
  { id: 'start->end', source: 'start', target: 'end', type: 'buttonedge' },
];