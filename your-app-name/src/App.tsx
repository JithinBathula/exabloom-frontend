import { useCallback, useState } from 'react';
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

import { initialNodes, nodeTypes } from './nodes';
import { initialEdges } from './edges';
import { NodeForm } from './NodeForm';
import { ButtonEdgeDemo } from './components/ButtonEdgeDemo';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeMenu, setNodeMenu] = useState<{ position: { x: number; y: number }; edgeId: string } | null>(null);
  const [newNodeConfig, setNewNodeConfig] = useState<{ type: 'ifelse'; edgeId: string } | null>(null);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, type: 'buttonedge' }, eds)),
    [setEdges]
  );

  const openNodeMenu = useCallback((position: { x: number; y: number }, edgeId: string) => {
    setNodeMenu({ position, edgeId });
  }, []);

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
          position: { x: baseX, y: baseY + 100 },
          data: { label: 'New Action' },
        };
  
        if (targetNode?.type === 'end') {
          const newEndId = `end-${Date.now()}`;
          const newEndNode: Node = {
            id: newEndId,
            type: 'end',
            position: { x: baseX, y: baseY + 200 },
            data: { label: 'End' },
          };
          setNodes((nds) => nds.filter((n) => n.id !== edge.target).concat([newActionNode, newEndNode]));
          setEdges((eds) => eds.filter((e) => e.id !== nodeMenu.edgeId).concat([
            { id: `${edge.source}-${newActionId}`, source: edge.source, target: newActionId, type: 'buttonedge' },
            { id: `${newActionId}-${newEndId}`, source: newActionId, target: newEndId, type: 'buttonedge' },
          ]));
        } else {
          setNodes((nds) => nds.concat(newActionNode));
          setEdges((eds) => eds.filter((e) => e.id !== nodeMenu.edgeId).concat([
            { id: `${edge.source}-${newActionId}`, source: edge.source, target: newActionId, type: 'buttonedge' },
            { id: `${newActionId}-${edge.target}`, source: newActionId, target: edge.target, type: 'buttonedge' },
          ]));
        }
      } else if (type === 'ifelse') {
        setNewNodeConfig({ type: 'ifelse', edgeId: nodeMenu.edgeId });
      }
      setNodeMenu(null);
    },
    [nodeMenu, nodes, edges, setNodes, setEdges]
  );

  const onNodeClick = useCallback((event: any, node: Node) => {
    if (node.type === 'action' || node.type === 'ifelse') {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={{ buttonedge: (props) => <ButtonEdgeDemo {...props} openNodeMenu={openNodeMenu} /> }}
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
          setNodes={setNodes}
          setEdges={setEdges}
          onClose={() => setSelectedNode(null)}
        />
      )}
      {newNodeConfig && (
        <NodeForm
          newNodeConfig={newNodeConfig}
          setNodes={setNodes}
          setEdges={setEdges}
          onClose={() => setNewNodeConfig(null)}
          onNewNodeSave={(data) => {
            const edge = edges.find((e) => e.id === newNodeConfig.edgeId);
            if (!edge) return;
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            const baseX = sourceNode?.position.x || 0;
            const baseY = sourceNode?.position.y || 0;

            const ifElseId = `ifelse-${Date.now()}`;
            const branchIds = data.branches.map((_, index) => `branch-${Date.now() + index}`);
            const elseId = `else-${Date.now()}`;

            const newIfElseNode: Node = {
              id: ifElseId,
              type: 'ifelse',
              position: { x: baseX, y: baseY + 100 },
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
              position: { x: baseX + 200, y: baseY + 50 + index * 100 },
              data: { label: data.branches[index].label },
            }));
            const newElseNode: Node = {
              id: elseId,
              type: 'else',
              position: { x: baseX + 200, y: baseY + 50 + data.branches.length * 100 },
              data: { label: 'Else' },
            };

            const isTargetEnd = targetNode?.type === 'end';
            if (isTargetEnd) {
              const endNodes = [...branchIds, elseId].map((id, index) => ({
                id: `end-${Date.now() + index}`,
                type: 'end',
                position: { x: baseX + 400, y: baseY + 50 + index * 100 },
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
                const updatedEdges = [
                  ...newEdges,
                  { id: `${edge.source}-${ifElseId}`, source: edge.source, target: ifElseId, type: 'buttonedge' },
                  ...branchIds.map((branchId, index) => [
                    { id: `${ifElseId}-${branchId}`, source: ifElseId, target: branchId, type: 'buttonedge' },
                    { id: `${branchId}-${endNodes[index].id}`, source: branchId, target: endNodes[index].id, type: 'buttonedge' },
                  ]).flat(),
                  { id: `${ifElseId}-${elseId}`, source: ifElseId, target: elseId, type: 'buttonedge' },
                  { id: `${elseId}-${endNodes[branchIds.length].id}`, source: elseId, target: endNodes[branchIds.length].id, type: 'buttonedge' },
                ];
                return updatedEdges;
              });
            } else {
              setNodes((nds) => [...nds, newIfElseNode, ...newBranchNodes, newElseNode]);
              setEdges((eds) => {
                const newEdges = eds.filter((e) => e.id !== newNodeConfig.edgeId);
                const updatedEdges = [
                  ...newEdges,
                  { id: `${edge.source}-${ifElseId}`, source: edge.source, target: ifElseId, type: 'buttonedge' },
                  ...branchIds.map((branchId) => ({ id: `${ifElseId}-${branchId}`, source: ifElseId, target: branchId, type: 'buttonedge' })),
                  { id: `${ifElseId}-${elseId}`, source: ifElseId, target: elseId, type: 'buttonedge' },
                  ...branchIds.map((branchId) => ({ id: `${branchId}-${edge.target}`, source: branchId, target: edge.target, type: 'buttonedge' })),
                  { id: `${elseId}-${edge.target}`, source: elseId, target: edge.target, type: 'buttonedge' },
                ];
                return updatedEdges;
              });
            }
            setNewNodeConfig(null);
          }}
        />
      )}
    </div>
  );
}