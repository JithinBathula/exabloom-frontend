import React, { memo } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';

interface ButtonEdgeProps extends EdgeProps {
  openNodeMenu?: (position: { x: number; y: number }, edgeId: string) => void;
}

export const ButtonEdge = memo(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, openNodeMenu }: ButtonEdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onAddClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (openNodeMenu) {
      openNodeMenu({ x: event.clientX, y: event.clientY }, id);
    }
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
      />
      <foreignObject
        width={30}
        height={30}
        x={labelX - 15}
        y={labelY - 15}
        className="react-flow__edge-button"
        style={{ overflow: 'visible' }}
      >
        <Button onClick={onAddClick} size="icon" variant="secondary">
          <Plus size={16} />
        </Button>
      </foreignObject>
    </>
  );
});