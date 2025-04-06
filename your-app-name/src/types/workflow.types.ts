import { Node, Edge } from '@xyflow/react';

export interface WorkflowNode extends Node {
  // Extended properties if needed
}

export interface WorkflowEdge extends Edge {
  // Extended properties if needed
}

export interface NodeMenuPosition {
  position: { x: number; y: number };
  edgeId: string;
}

export interface NewNodeConfig {
  type: 'ifelse';
  edgeId: string;
}

export interface ActionNodeData {
  label: string;
}

export interface StartNodeData {
  label: string;
}

export interface EndNodeData {
  label: string;
}

export interface IfElseNodeData {
  label: string;
  branches: { id: string; label: string }[];
  elseId: string;
  elseLabel: string;
}

export interface BranchNodeData {
  label: string;
}

export interface ElseNodeData {
  label: string;
}

export interface NodeFormData {
  label: string;
  branches: { label: string }[];
}

export interface NodeFormProps {
  node?: WorkflowNode;
  newNodeConfig?: NewNodeConfig;
  edges: WorkflowEdge[];
  setNodes: (updater: (nodes: WorkflowNode[]) => WorkflowNode[]) => void;
  setEdges: (updater: (edges: WorkflowEdge[]) => WorkflowEdge[]) => void;
  setNeedsLayout: (value: boolean) => void;
  onClose: () => void;
  onNewNodeSave?: (data: NodeFormData) => void;
}