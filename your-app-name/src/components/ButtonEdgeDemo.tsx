// components/ButtonEdgeDemo.tsx
import { memo } from 'react';
import { EdgeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ButtonEdge } from '@/components/button-edge';

interface ButtonEdgeDemoProps extends EdgeProps {
  openNodeMenu: (position: { x: number; y: number }, edgeId: string) => void;
}

export const ButtonEdgeDemo = memo(({ openNodeMenu, ...props }: ButtonEdgeDemoProps) => {
  const onAddClick = (event: React.MouseEvent) => {
    const { id } = props;
    openNodeMenu({ x: event.clientX, y: event.clientY }, id);
  };

  return (
    <ButtonEdge {...props}>
      <Button onClick={onAddClick} size="icon" variant="secondary">
        <Plus size={16} />
      </Button>
    </ButtonEdge>
  );
});