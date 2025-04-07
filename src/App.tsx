import React from 'react';
import {ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflow } from './hooks/useWorkflow';
import { nodeTypes } from './constants/nodeTypes';
import { NodeForm } from './features/Forms/NodeForms';
import { NodeMenu } from './features/workflow/NodeMenu';
import { ButtonEdge } from './features/workflow/edges/ButtonEdge';

const styles = {
  container: {
    position: 'relative' as const,
    width: '100vw',
    height: '100vh',
  },
};

export default function App() {
  const {
    nodes,
    edges,
    selectedNode,
    nodeMenu,
    newNodeConfig,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    openNodeMenu,
    addNode,
    setNodes,
    setEdges,
    setNeedsLayout,
    setSelectedNode,
    setNodeMenu,
    setNewNodeConfig,
  } = useWorkflow();

  // Memoize the edgeTypes object
  const edgeTypes = React.useMemo(
    () => ({
      buttonedge: (props: any) => <ButtonEdge {...props} openNodeMenu={openNodeMenu} />,
    }),
    [openNodeMenu]
  );

  // Add a node handler
  const handleAddNode = React.useCallback(
    (type: 'action' | 'ifelse') => {
      addNode(type);
    },
    [addNode]
  );

  return (
    <div style={styles.container}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
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
        <NodeMenu
          position={nodeMenu.position}
          onAddAction={() => handleAddNode('action')}
          onAddIfElse={() => handleAddNode('ifelse')}
          onClose={() => setNodeMenu(null)}
        />
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
            
            const ifElseId = `ifelse-${Date.now()}`;
            const branchIds = data.branches.map((_, index) => `branch-${Date.now() + index}`);
            const elseId = `else-${Date.now()}`;

            const newIfElseNode = {
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
            
            const newBranchNodes = branchIds.map((id, index) => ({
              id,
              type: 'branch',
              position: { x: 0, y: 0 },
              data: { label: data.branches[index].label },
            }));
            
            const newElseNode = {
              id: elseId,
              type: 'else',
              position: { x: 0, y: 0 },
              data: { label: 'Else' },
            };

            const targetNode = nodes.find((n) => n.id === edge.target);
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
                  ...branchIds.map((branchId) => ({ 
                    id: `${ifElseId}-${branchId}`, 
                    source: ifElseId, 
                    target: branchId, 
                    type: 'buttonedge' 
                  })),
                  { id: `${ifElseId}-${elseId}`, source: ifElseId, target: elseId, type: 'buttonedge' },
                  ...branchIds.map((branchId) => ({ 
                    id: `${branchId}-${edge.target}`, 
                    source: branchId, 
                    target: edge.target, 
                    type: 'buttonedge' 
                  })),
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