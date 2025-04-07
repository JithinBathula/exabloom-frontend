import { useCallback } from 'react';
import dagre from 'dagre';
import { WorkflowNode, WorkflowEdge } from '../types/workflow.types';

export function useLayoutEngine() {
  const layoutFlowchart = useCallback((nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 50 });

    nodes.forEach((node) => {
      const width = node.type === 'ifelse' ? 200 : 150;
      const height = 50;
      dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const newPosition = {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      };
      return { ...node, position: newPosition };
    });
  }, []);

  return { layoutFlowchart };
}