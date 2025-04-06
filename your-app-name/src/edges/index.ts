import type { Edge, EdgeTypes } from '@xyflow/react';
import ButtonEdgeDemo from '@/components/ButtonEdgeDemo';

export const initialEdges: Edge[] = [
  { id: 'a->b', source: 'a', target: 'd', type: "buttonedge" },
];

export const edgeTypes = {
  buttonedge: ButtonEdgeDemo,
} satisfies EdgeTypes;
