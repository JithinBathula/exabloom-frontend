import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { EndNodeData } from '../../../types/workflow.types';

const styles = {
  node: {
    padding: 10,
    background: '#ffd0d0',
    border: '1px solid #ccc',
    borderRadius: 50,
    width: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export const EndNode = memo(({ data }: NodeProps<EndNodeData>) => {
  return (
    <div style={styles.node}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
    </div>
  );
});