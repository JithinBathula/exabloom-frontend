import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { IfElseNodeData } from '../../../types/workflow.types';

const styles = {
  node: {
    padding: 10,
    background: '#ffcc00',
    border: '1px solid #ccc',
    borderRadius: 5,
    width: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export const IfElseNode = memo(({ data }: NodeProps<IfElseNodeData>) => {
  return (
    <div style={styles.node}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});