import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { StartNodeData } from '../../../types/workflow.types';

const styles = {
  node: {
    width: 100,
    height: 50,
    background: 'lightgreen',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export const StartNode = memo(({ data }: NodeProps<StartNodeData>) => {
  return (
    <div style={styles.node}>
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});