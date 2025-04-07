import { NodeTypes } from '@xyflow/react';
import { StartNode, EndNode, ActionNode, IfElseNode, BranchNode, ElseNode } from '../features/workflow/nodes';

export const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  action: ActionNode,
  ifelse: IfElseNode,
  branch: BranchNode,
  else: ElseNode,
};