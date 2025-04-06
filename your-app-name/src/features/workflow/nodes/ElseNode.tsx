import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ElseNodeData } from '../../../types/workflow.types';

const styles = {
  node: {
    padding: 10,
    background: '#ccccff',
    border: '1px solid #ccc',
    borderRadius: 5,
    width: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export const ElseNode = memo(({ data }: NodeProps<ElseNodeData>) => {
  return (
    <div style={styles.node}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});