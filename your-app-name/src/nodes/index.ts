import { type NodeTypes, type Node } from '@xyflow/react';
import { StartNode } from './StartNode';
import { EndNode } from './EndNode';
import { ActionNode } from './ActionNode';
import { IfElseNode } from './IfElseNode';
import { BranchNode } from './BranchNode';
import { ElseNode } from './ElseNode';

export const initialNodes: Node[] = [
  { id: 'a', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
  { id: 'd', type: 'end', position: { x: 0, y: 200 }, data: { label: 'End' } },
];

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  action: ActionNode,
  ifelse: IfElseNode,
  branch: BranchNode,
  else: ElseNode,
} satisfies NodeTypes;

export { StartNode } from './StartNode';
export { EndNode } from './EndNode';
export { ActionNode } from './ActionNode';
export { IfElseNode } from './IfElseNode';
export { BranchNode } from './BranchNode';
export { ElseNode } from './ElseNode';