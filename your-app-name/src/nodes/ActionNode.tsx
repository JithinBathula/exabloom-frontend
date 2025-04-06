// nodes/ActionNode.tsx
import { Handle, Position } from '@xyflow/react';

export function ActionNode({ data }) {
  return (
    <div style={{ padding: 10, background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 5 }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}