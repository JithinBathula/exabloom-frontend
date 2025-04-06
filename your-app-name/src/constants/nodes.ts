import { WorkflowNode } from '../types/workflow.types';

export const initialNodes: WorkflowNode[] = [
  { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
  { id: 'end', type: 'end', position: { x: 0, y: 200 }, data: { label: 'End' } },
];