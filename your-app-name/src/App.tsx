import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

// Custom nodes and edges
import { initialNodes, nodeTypes } from './nodes';
import { initialEdges } from './edges';
import { NodeForm } from './NodeForm';
import { ButtonEdgeDemo } from './components/ButtonEdgeDemo';

// Define edgeTypes outside the component for stability
const edgeTypes = {
  buttonedge: ButtonEdgeDemo,
};

// Dagre layout function
const layoutFlowchart = (nodes: Node[], edges: Edge[]) => {
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
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeMenu, setNodeMenu] = useState<{ position: { x: number; y: number }; edgeId: string } | null>(null);
  const [newNodeConfig, setNewNodeConfig] = useState<{ type: 'ifelse'; edgeId: string } | null>(null);
  const [needsLayout, setNeedsLayout] = useState(false);

  // Function to get all reachable nodes from Start using BFS
  const getReachableNodes = useCallback((startNodeId: string, nodes: Node[], edges: Edge[]): string[] => {
    const visited = new Set<string>();
    const queue = [startNodeId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (!visited.has(currentId)) {
        visited.add(currentId);
        const outgoingEdges = edges.filter((e) => e.source === currentId);
        outgoingEdges.forEach((e) => queue.push(e.target));
      }
    }
    return Array.from(visited);
  }, []);

  // Cleanup unreachable nodes after any change
  useEffect(() => {
    const startNode = nodes.find((n) => n.type === 'start');
    if (startNode) {
      const reachableIds = getReachableNodes(startNode.id, nodes, edges);
      const unreachableNodes = nodes.filter((n) => !reachableIds.includes(n.id));
      if (unreachableNodes.length > 0) {
        setNodes((nds) => nds.filter((n) => reachableIds.includes(n.id)));
        setNeedsLayout(true);
      }
    }
  }, [nodes, edges, setNodes, getReachableNodes]);

  // Apply layout when needsLayout is true
  useEffect(() => {
    if (needsLayout) {
      const updatedNodes = layoutFlowchart(nodes, edges);
      setNodes(updatedNodes);
      setNeedsLayout(false);
    }
  }, [needsLayout, nodes, edges, setNodes]);

  // Handle edge connections
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, type: 'buttonedge' }, eds)),
    [setEdges]
  );

  // Open node menu on edge button click
  const openNodeMenu = useCallback((position: { x: number; y: number }, edgeId: string) => {
    setNodeMenu({ position, edgeId });
  }, []);

  // Add a new node (Action or If/Else)
  const addNode = useCallback(
    (type: 'action' | 'ifelse') => {
      if (!nodeMenu) return;
      const edge = edges.find((e) => e.id === nodeMenu.edgeId);
      if (!edge) return;
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const baseX = sourceNode?.position.x || 0;
      const baseY = sourceNode?.position.y || 0;

      if (type === 'action') {
        const newActionId = `action-${Date.now()}`;
        const newActionNode: Node = {
          id: newActionId,
          type: 'action',
          position: { x: 0, y: 0 }, // Temporary, Dagre will adjust
          data: { label: 'New Action' },
        };

        if (targetNode?.type === 'end') {
          const newEndId = `end-${Date.now()}`;
          const newEndNode: Node = {
            id: newEndId,
            type: 'end',
            position: { x: 0, y: 0 },
            data: { label: 'End' },
          };
          setNodes((nds) => nds.filter((n) => n.id !== edge.target).concat([newActionNode, newEndNode]));
          setEdges((eds) =>
            eds
              .filter((e) => e.id !== nodeMenu.edgeId)
              .concat([
                { id: `${edge.source}-${newActionId}`, source: edge.source, target: newActionId, type: 'buttonedge' },
                { id: `${newActionId}-${newEndId}`, source: newActionId, target: newEndId, type: 'buttonedge' },
              ])
          );
        } else {
          setNodes((nds) => nds.concat(newActionNode));
          setEdges((eds) =>
            eds
              .filter((e) => e.id !== nodeMenu.edgeId)
              .concat([
                { id: `${edge.source}-${newActionId}`, source: edge.source, target: newActionId, type: 'buttonedge' },
                { id: `${newActionId}-${edge.target}`, source: newActionId, target: edge.target, type: 'buttonedge' },
              ])
          );
        }
        setNeedsLayout(true);
      } else if (type === 'ifelse') {
        setNewNodeConfig({ type: 'ifelse', edgeId: nodeMenu.edgeId });
      }
      setNodeMenu(null);
    },
    [nodeMenu, nodes, edges, setNodes, setEdges]
  );

  // Handle node clicks for editing
  const onNodeClick = useCallback((event: any, node: Node) => {
    if (node.type === 'action' || node.type === 'ifelse') {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  }, []);

  // Memoize the edgeTypes object to pass openNodeMenu
  const memoizedEdgeTypes = useMemo(
    () => ({
      buttonedge: (props: any) => <ButtonEdgeDemo {...props} openNodeMenu={openNodeMenu} />,
    }),
    [openNodeMenu]
  );

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={memoizedEdgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
      {nodeMenu && (
        <div
          style={{
            position: 'fixed',
            left: nodeMenu.position.x,
            top: nodeMenu.position.y,
            zIndex: 100,
            background: '#fff',
            border: '1px solid #ccc',
            padding: 5,
          }}
        >
          <button onClick={() => addNode('action')} style={{ display: 'block', width: '100%' }}>
            Action Node
          </button>
          <button onClick={() => addNode('ifelse')} style={{ display: 'block', width: '100%' }}>
            If/Else Node
          </button>
        </div>
      )}
      {selectedNode && (
        <NodeForm
          node={selectedNode}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          setNeedsLayout={setNeedsLayout}
          onClose={() => setSelectedNode(null)}
        />
      )}
      {newNodeConfig && (
        <NodeForm
          newNodeConfig={newNodeConfig}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          setNeedsLayout={setNeedsLayout}
          onClose={() => setNewNodeConfig(null)}
          onNewNodeSave={(data) => {
            const edge = edges.find((e) => e.id === newNodeConfig.edgeId);
            if (!edge) {
              console.error('Edge not found for ID:', newNodeConfig.edgeId);
              return;
            }
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);

            const ifElseId = `ifelse-${Date.now()}`;
            const branchIds = data.branches.map((_, index) => `branch-${Date.now() + index}`);
            const elseId = `else-${Date.now()}`;

            const newIfElseNode: Node = {
              id: ifElseId,
              type: 'ifelse',
              position: { x: 0, y: 0 },
              data: {
                label: data.label,
                branches: branchIds.map((id, index) => ({ id, label: data.branches[index].label })),
                elseId,
                elseLabel: 'Else',
              },
            };
            const newBranchNodes: Node[] = branchIds.map((id, index) => ({
              id,
              type: 'branch',
              position: { x: 0, y: 0 },
              data: { label: data.branches[index].label },
            }));
            const newElseNode: Node = {
              id: elseId,
              type: 'else',
              position: { x: 0, y: 0 },
              data: { label: 'Else' },
            };

            const isTargetEnd = targetNode?.type === 'end';
            if (isTargetEnd) {
              const endNodes = [...branchIds, elseId].map((id, index) => ({
                id: `end-${Date.now() + index}`,
                type: 'end',
                position: { x: 0, y: 0 },
                data: { label: 'End' },
              }));
              setNodes((nds) => [
                ...nds.filter((n) => n.id !== edge.target),
                newIfElseNode,
                ...newBranchNodes,
                newElseNode,
                ...endNodes,
              ]);
              setEdges((eds) => {
                const newEdges = eds.filter((e) => e.id !== newNodeConfig.edgeId);
                return [
                  ...newEdges,
                  { id: `${edge.source}-${ifElseId}`, source: edge.source, target: ifElseId, type: 'buttonedge' },
                  ...branchIds
                    .map((branchId, index) => [
                      { id: `${ifElseId}-${branchId}`, source: ifElseId, target: branchId, type: 'buttonedge' },
                      { id: `${branchId}-${endNodes[index].id}`, source: branchId, target: endNodes[index].id, type: 'buttonedge' },
                    ])
                    .flat(),
                  { id: `${ifElseId}-${elseId}`, source: ifElseId, target: elseId, type: 'buttonedge' },
                  { id: `${elseId}-${endNodes[branchIds.length].id}`, source: elseId, target: endNodes[branchIds.length].id, type: 'buttonedge' },
                ];
              });
            } else {
              setNodes((nds) => [...nds, newIfElseNode, ...newBranchNodes, newElseNode]);
              setEdges((eds) => {
                const newEdges = eds.filter((e) => e.id !== newNodeConfig.edgeId);
                return [
                  ...newEdges,
                  { id: `${edge.source}-${ifElseId}`, source: edge.source, target: ifElseId, type: 'buttonedge' },
                  ...branchIds.map((branchId) => ({ id: `${ifElseId}-${branchId}`, source: ifElseId, target: branchId, type: 'buttonedge' })),
                  { id: `${ifElseId}-${elseId}`, source: ifElseId, target: elseId, type: 'buttonedge' },
                  ...branchIds.map((branchId) => ({ id: `${branchId}-${edge.target}`, source: branchId, target: edge.target, type: 'buttonedge' })),
                  { id: `${elseId}-${edge.target}`, source: elseId, target: edge.target, type: 'buttonedge' },
                ];
              });
            }
            setNewNodeConfig(null);
            setNeedsLayout(true);
          }}
        />
      )}
    </div>
  );
}