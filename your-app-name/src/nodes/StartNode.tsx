// nodes/StartNode.tsx
import { NodeProps, Handle, Position } from '@xyflow/react';

export function StartNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div
      style={{
        width: 100,
        height: 50,
        background: 'lightgreen',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Hidden target handle (no incoming connections) */}
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      
      {/* Display the label */}
      <div style={{ fontWeight: 'bold' }}>{data.label}</div>
      
      {/* Source handle for outgoing connections */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}