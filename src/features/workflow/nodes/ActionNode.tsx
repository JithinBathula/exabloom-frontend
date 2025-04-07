import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ActionNodeData } from '../../../types/workflow.types';

const styles = {
  node: {
    padding: 10,
    background: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: 5,
    width: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export const ActionNode = memo(({ data }: NodeProps<ActionNodeData>) => {
  return (
    <div style={styles.node}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});