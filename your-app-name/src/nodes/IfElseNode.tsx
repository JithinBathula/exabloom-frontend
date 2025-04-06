import { Handle, Position, type NodeProps } from '@xyflow/react';

export function IfElseNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div style={{ padding: 10, background: '#ffcc00', border: '1px solid #ccc', borderRadius: 5 }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}