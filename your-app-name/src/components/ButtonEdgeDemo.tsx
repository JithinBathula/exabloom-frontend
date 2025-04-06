import { memo } from "react";
import { EdgeProps, useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ButtonEdge } from "@/components/button-edge";

const ButtonEdgeDemo = memo((props: EdgeProps) => {
  const { setNodes, setEdges } = useReactFlow();

  const onEdgeClick = () => {
    const { sourceX, sourceY, targetX, targetY, source, target } = props;
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    const newNodeId = `action-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'action',
      position: { x: midX, y: midY },
      data: { label: 'Action Node' },
    };

    // Add the new Action Node
    setNodes((nds) => [...nds, newNode]);

    // Replace the current edge with two default edges
    setEdges((eds) => {
      const newEdges = eds.filter((e) => e.id !== props.id); // Remove the clicked edge
      return [
        ...newEdges,
        { id: `${source}-${newNodeId}`, source, target: newNodeId, type: "buttonedge"}, // Default edge
        { id: `${newNodeId}-${target}`, source: newNodeId, target, type:"buttonedge" }, // Default edge
      ];
    });
  };

  return (
    <ButtonEdge {...props}>
      <Button onClick={onEdgeClick} size="icon" variant="secondary">
        <Plus size={16} />
      </Button>
    </ButtonEdge>
  );
});

export default ButtonEdgeDemo;