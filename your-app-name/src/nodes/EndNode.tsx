// nodes/EndNode.tsx
import { NodeProps, Handle, Position } from '@xyflow/react';

export function EndNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div
      style={{
        width: 80,
        height: 40,
        background: 'gray',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}
    >
      {/* Target handle for incoming connections */}
      <Handle type="target" position={Position.Top} />
      
      {/* Display the label */}
      <div>{data.label}</div>
      
      {/* Hidden source handle (no outgoing connections) */}
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}