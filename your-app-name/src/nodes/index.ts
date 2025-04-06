import type { NodeTypes } from '@xyflow/react';
import { StartNode } from './StartNode';  // Import StartNode
import { EndNode } from './EndNode';      // Import EndNode
import { ActionNode } from './ActionNode';  // Add this
import { PositionLoggerNode } from './PositionLoggerNode';
import { AppNode } from './types';

export const initialNodes: AppNode[] = [
  { id: 'a', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
  {
    id: 'd',
    type: 'end',
    position: { x: 0, y: 200 },
    data: { label: 'End' },
  },
];
export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  start: StartNode,  // Add StartNode
  end: EndNode,      // Add EndNode
  action: ActionNode,  // Add this
} satisfies NodeTypes;

export { StartNode } from './StartNode';
export { EndNode } from './EndNode';
export { ActionNode } from './ActionNode';  // Export ActionNode