import { useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState, addEdge, type OnConnect } from '@xyflow/react';
import { initialNodes } from '../constants/nodes';
import { initialEdges } from '../constants/edges';
import { WorkflowNode, WorkflowEdge, NodeMenuPosition, NewNodeConfig } from '../types/workflow.types';
import { useLayoutEngine } from './useLayoutEngine';

export function useWorkflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [nodeMenu, setNodeMenu] = useState<NodeMenuPosition | null>(null);
  const [newNodeConfig, setNewNodeConfig] = useState<NewNodeConfig | null>(null);
  const [needsLayout, setNeedsLayout] = useState(false);

  const { layoutFlowchart } = useLayoutEngine();

  // Function to get all reachable nodes from Start using BFS
  const getReachableNodes = useCallback((startNodeId: string, nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] => {
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
  }, [needsLayout, nodes, edges, setNodes, layoutFlowchart]);

  // Handle edge connections
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, type: 'buttonedge' }, eds)),
    [setEdges]
  );

  // Open node menu on edge button click
  const openNodeMenu = useCallback((position: { x: number; y: number }, edgeId: string) => {
    setNodeMenu({ position, edgeId });
  }, []);

  // Add a new action node
  const addActionNode = useCallback((edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge) return;

    const targetNode = nodes.find((n) => n.id === edge.target);
    const newActionId = `action-${Date.now()}`;
    const newActionNode: WorkflowNode = {
      id: newActionId,
      type: 'action',
      position: { x: 0, y: 0 }, // Temporary, layout will adjust
      data: { label: 'New Action' },
    };

    if (targetNode?.type === 'end') {
      const newEndId = `end-${Date.now()}`;
      const newEndNode: WorkflowNode = {
        id: newEndId,
        type: 'end',
        position: { x: 0, y: 0 },
        data: { label: 'End' },
      };
      setNodes((nds) => nds.filter((n) => n.id !== edge.target).concat([newActionNode, newEndNode]));
      setEdges((eds) =>
        eds
          .filter((e) => e.id !== edgeId)
          .concat([
            { id: `${edge.source}-${newActionId}`, source: edge.source, target: newActionId, type: 'buttonedge' },
            { id: `${newActionId}-${newEndId}`, source: newActionId, target: newEndId, type: 'buttonedge' },
          ])
      );
    } else {
      setNodes((nds) => nds.concat(newActionNode));
      setEdges((eds) =>
        eds
          .filter((e) => e.id !== edgeId)
          .concat([
            { id: `${edge.source}-${newActionId}`, source: edge.source, target: newActionId, type: 'buttonedge' },
            { id: `${newActionId}-${edge.target}`, source: newActionId, target: edge.target, type: 'buttonedge' },
          ])
      );
    }
    setNeedsLayout(true);
  }, [nodes, edges, setNodes, setEdges]);

  // Set up for adding an if/else node
  const prepareIfElseNode = useCallback((edgeId: string) => {
    setNewNodeConfig({ type: 'ifelse', edgeId });
  }, []);

  // Add a new node (action or if/else)
  const addNode = useCallback(
    (type: 'action' | 'ifelse') => {
      if (!nodeMenu) return;
      
      if (type === 'action') {
        addActionNode(nodeMenu.edgeId);
      } else if (type === 'ifelse') {
        prepareIfElseNode(nodeMenu.edgeId);
      }
      
      setNodeMenu(null);
    },
    [nodeMenu, addActionNode, prepareIfElseNode]
  );

  // Handle node clicks for editing
  const onNodeClick = useCallback((event: React.MouseEvent, node: WorkflowNode) => {
    if (node.type === 'action' || node.type === 'ifelse') {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  }, []);

  // Delete a node
  const deleteNode = useCallback((node: WorkflowNode) => {
    if (node.type === 'ifelse') {
      // Get branch IDs and else ID
      const branchIds = node.data.branches.map((b: { id: string }) => b.id);
      const elseId = node.data.elseId;
      const nodesToRemove = new Set([node.id, ...branchIds, elseId].filter(Boolean));

      // Find incoming edge to If/Else node
      const incomingEdge = edges.find((e) => e.target === node.id);
      const sourceId = incomingEdge?.source;

      if (!sourceId) {
        // No incoming edge, just remove the nodes and their edges
        setNodes((nds) => nds.filter((n) => !nodesToRemove.has(n.id)));
        setEdges((eds) => eds.filter((e) => !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target)));
        setNeedsLayout(true);
        return;
      }

      // Identify immediate successors of Branch and Else nodes
      const branchSuccessors = branchIds
        .map((branchId) => edges.find((e) => e.source === branchId)?.target)
        .filter(Boolean);
      const elseSuccessor = edges.find((e) => e.source === elseId)?.target;
      const allSuccessors = [...branchSuccessors, elseSuccessor].filter(Boolean) as string[];

      // Check if all successors converge to the same node
      const uniqueSuccessors = new Set(allSuccessors);
      let targetId: string;

      if (uniqueSuccessors.size === 1) {
        // All branches converge to one node, connect source to this node
        targetId = allSuccessors[0];
      } else {
        // Branches go to different nodes or End nodes, create a new End node
        targetId = `end-${Date.now()}`;
        const newEndNode: WorkflowNode = {
          id: targetId,
          type: 'end',
          position: { x: node.position.x, y: node.position.y + 200 },
          data: { label: 'End' },
        };
        setNodes((nds) => [...nds.filter((n) => !nodesToRemove.has(n.id)), newEndNode]);
      }

      // Update edges
      setEdges((eds) => {
        // Remove edges connected to nodes being deleted
        const filteredEdges = eds.filter((e) => !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target));
        // Add new edge from source to target
        const newEdge = {
          id: `${sourceId}-${targetId}-${Date.now()}`,
          source: sourceId,
          target: targetId,
          type: 'buttonedge',
        };
        return [...filteredEdges, newEdge];
      });

      // Remove the If/Else structure
      setNodes((nds) => nds.filter((n) => !nodesToRemove.has(n.id)));
    } else {
      // Handle deletion for action nodes
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) => {
        const incoming = edges.find((e) => e.target === node.id);
        const outgoing = edges.find((e) => e.source === node.id);
        if (incoming && outgoing) {
          const newEdge = {
            id: `${incoming.source}-${outgoing.target}`,
            source: incoming.source,
            target: outgoing.target,
            type: 'buttonedge',
          };
          return [...eds.filter((e) => e.source !== node.id && e.target !== node.id), newEdge];
        }
        return eds.filter((e) => e.source !== node.id && e.target !== node.id);
      });
    }
    setNeedsLayout(true);
  }, [edges, setNodes, setEdges]);

  return {
    nodes,
    edges,
    selectedNode,
    nodeMenu,
    newNodeConfig,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    setNodeMenu,
    setNewNodeConfig,
    setNeedsLayout,
    addNode,
    openNodeMenu,
    onNodeClick,
    deleteNode,
  };
}