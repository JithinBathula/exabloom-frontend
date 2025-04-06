import { type Node } from '@xyflow/react';

export type StartNodeType = Node<{ label: string }, 'start'>;
export type EndNodeType = Node<{ label: string }, 'end'>;
export type ActionNodeType = Node<{ label: string }, 'action'>;
export type IfElseNodeType = Node<
  { label: string; branches: { id: string; label: string }[]; elseId: string; elseLabel: string },
  'ifelse'
>;
export type BranchNodeType = Node<{ label: string }, 'branch'>;
export type ElseNodeType = Node<{ label: string }, 'else'>;

export type AppNode =
  | StartNodeType
  | EndNodeType
  | ActionNodeType
  | IfElseNodeType
  | BranchNodeType
  | ElseNodeType;