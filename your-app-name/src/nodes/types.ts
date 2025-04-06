import type { Node, BuiltInNode } from '@xyflow/react';

export type PositionLoggerNode = Node<{ label: string }, 'position-logger'>;
export type AppNode = BuiltInNode | PositionLoggerNode;
export type StartNodeType = Node<{ label: string }, 'start'>;  // Type for StartNode
export type EndNodeType = Node<{ label: string }, 'end'>;      // Type for EndNode